"use server";

import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { PAGE_SIZE } from "@/app/chips/constants";
import type { ChipsWithStats } from "@/supabase/types";

export async function fetchBrandChips(
  brandId: string,
  offset: number = 0,
): Promise<ChipsWithStats[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("chips_with_stats")
    .select("*")
    .eq("brand_id", brandId)
    .order("average_rating", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);
  return data ?? [];
}
