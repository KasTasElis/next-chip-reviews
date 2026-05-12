"use server";

import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { PAGE_SIZE } from "./constants";
import { ChipsWithStats } from "@/supabase/types";
import slugify from "slugify";

export type SortableChipColumn = keyof Pick<
  ChipsWithStats,
  "average_rating" | "review_count"
>;

export type FetchChipsOptions = {
  offset?: number;
  limit?: number;
  sortBy?: SortableChipColumn;
  sortOrder?: "asc" | "desc";
  minRating?: number;
  search?: string;
};

export async function fetchChips(
  options: FetchChipsOptions = {},
): Promise<ChipsWithStats[]> {
  const { offset = 0, limit = PAGE_SIZE, sortBy, sortOrder = "desc", minRating, search } =
    options;
  const supabase = await createSupabaseServerClient();

  if (search) {
    const slugifiedQuery = slugify(search, { lower: true, strict: true });
    if (!slugifiedQuery) return [];
    const { data } = await supabase.rpc("search_chips", {
      query: slugifiedQuery,
      min_rating: minRating ?? 0,
      page_limit: limit,
      page_offset: offset,
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    return data ?? [];
  }

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

  const { data } = await query.range(offset, offset + limit - 1);
  return data ?? [];
}
