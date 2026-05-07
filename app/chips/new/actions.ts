"use server";

import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { chipSchema, type ChipInputs } from "./schema";
import type { SimilarItem } from "@/app/components/SimilarItemsWarning";

export async function findSimilarChips(chipSlug: string, brandId: string): Promise<SimilarItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("find_similar_chips", { chip_slug: chipSlug, brand_id: brandId });
  return (data ?? []).map((c) => ({ name: c.name, imageUrl: c.photo_url, slug: c.slug }));
}

export async function createChip(data: ChipInputs) {
  const parsed = chipSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("chips").insert({
    name: parsed.data.name,
    description: parsed.data.description,
    slug: parsed.data.slug,
    brand_id: parsed.data.brand_id,
    photo_url: parsed.data.photo_url,
  });

  if (error) return { error: error.message };

  return { slug: parsed.data.slug };
}
