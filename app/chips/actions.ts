"use server";

import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { PAGE_SIZE } from "./constants";
import { ChipsWithStats } from "@/supabase/types";

export type SortableChipColumn = keyof Pick<
  ChipsWithStats,
  "average_rating" | "review_count"
>;

export type FetchChipsOptions = {
  offset?: number;
  sortBy?: SortableChipColumn;
  sortOrder?: "asc" | "desc";
  minRating?: number;
};

export async function fetchChips(
  options: FetchChipsOptions = {},
): Promise<ChipsWithStats[]> {
  const { offset = 0, sortBy, sortOrder = "desc", minRating } = options;
  const supabase = await createSupabaseServerClient();

  const sortColumn = sortBy ?? "created_at";
  const ascending = sortBy ? sortOrder === "asc" : false;

  let query = supabase
    .from("chips_with_stats")
    .select("*")
    .order(sortColumn, { ascending })
    .order("id", { ascending: true }); // tiebreaker: ensures a total order so offset pagination windows never overlap

  if (minRating !== undefined && minRating > 0) {
    query = query.gte("average_rating", minRating);
  }

  const { data } = await query.range(offset, offset + PAGE_SIZE - 1);
  return data ?? [];
}
