"use server";

import { createSupabaseServerClient } from "../lib/supabase-server";
import { BRANDS_PAGE_SIZE } from "./constants";
import type { Brand } from "@/supabase/types";

export async function fetchBrands(offset: number = 0): Promise<Brand[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("brands")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + BRANDS_PAGE_SIZE - 1);
  return data ?? [];
}
