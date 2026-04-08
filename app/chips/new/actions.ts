"use server";

import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { chipSchema, type ChipInputs } from "./schema";

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
    brand_id_fk: parsed.data.brand_id_fk,
    photo_url: parsed.data.photo_url,
  });

  if (error) return { error: error.message };

  return { slug: parsed.data.slug };
}
