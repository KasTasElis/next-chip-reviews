"use server";

import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { PAGE_SIZE } from "./constants";
import { ChipsWithStats } from "@/supabase/types";

export async function fetchChips(
  offset: number = 0,
): Promise<ChipsWithStats[]> {
  const supabase = await createSupabaseServerClient();

  console.log(
    "Calling range from: " + offset + " To: " + (offset + PAGE_SIZE - 1),
  );

  const { data } = await supabase
    .from("chips_with_stats")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  return data ?? [];
}
