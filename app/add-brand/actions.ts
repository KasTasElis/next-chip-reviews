"use server";

import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { brandSchema, type BrandInputs } from "./schema";

export async function createBrand(data: BrandInputs) {
  const parsed = brandSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("brands").insert({
    name: parsed.data.name,
    description: parsed.data.description,
    slug: parsed.data.slug,
  });

  if (error) return { error: error.message };

  return { slug: parsed.data.slug };
}
