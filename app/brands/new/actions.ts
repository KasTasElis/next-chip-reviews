"use server";

import slugify from "slugify";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { submitBrandSchema } from "./schema";
import { SimilarBrand } from "@/supabase/types";

const RESERVED_SLUGS = ["new"];

export async function findSimilarBrands(name: string): Promise<SimilarBrand[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("find_similar_brands", { query: name });
  return data ?? [];
}

export async function submitBrand(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = submitBrandSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    logo: formData.get("logo"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const slug = slugify(parsed.data.name, { lower: true, strict: true });
  if (RESERVED_SLUGS.includes(slug)) {
    return { error: "That name is reserved — please choose a different one" };
  }

  const path = `${slug}.webp`;
  const {
    data: { publicUrl },
  } = supabase.storage.from("brand-logos").getPublicUrl(path);

  const { error: insertError } = await supabase.from("brands").insert({
    name: parsed.data.name,
    description: parsed.data.description,
    slug,
    logo_url: publicUrl,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "A brand with this name already exists" };
    }
    return {
      error: "Something went wrong, failed to create brand. Please try again.",
    };
  }

  const { error: uploadError } = await supabase.storage
    .from("brand-logos")
    .upload(path, parsed.data.logo);

  if (uploadError) {
    await supabase.from("brands").delete().eq("slug", slug);
    return { error: "Failed to upload logo. Please try again." };
  }

  return { slug };
}
