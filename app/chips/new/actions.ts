"use server";

import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { submitChipSchema } from "./schema";
import type { SimilarItem } from "@/app/components/SimilarItemsWarning";

export async function findSimilarChips(
  chipSlug: string,
  brandId: string,
): Promise<SimilarItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("find_similar_chips", {
    chip_slug: chipSlug,
    brand_id: brandId,
  });
  return (data ?? []).map((c) => ({
    name: c.name,
    imageUrl: c.photo_url,
    slug: c.slug,
  }));
}

export async function createChip(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = submitChipSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    brand_id: formData.get("brand_id"),
    slug: formData.get("slug"),
    photo: formData.get("photo"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, description, brand_id, slug, photo } = parsed.data;
  const path = `${slug}.webp`;

  const {
    data: { publicUrl: photo_url },
  } = supabase.storage.from("chip-photos").getPublicUrl(path);

  const { error: insertError } = await supabase.from("chips").insert({
    name,
    description,
    slug,
    brand_id,
    photo_url,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "A chip with this name already exists for this brand" };
    }
    return {
      error: "Something went wrong, failed to create chip. Please try again.",
    };
  }

  const { error: uploadError } = await supabase.storage
    .from("chip-photos")
    .upload(path, photo);

  if (uploadError) {
    await supabase.from("chips").delete().eq("slug", slug);
    return { error: "Failed to upload photo. Please try again." };
  }

  return { slug };
}
