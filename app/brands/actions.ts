"use server";

import { createSupabaseServerClient } from "../lib/supabase-server";
import { BRANDS_PAGE_SIZE } from "./constants";
import type { Brand } from "@/supabase/types";
import slugify from "slugify";

export type FetchBrandsOptions = {
  offset?: number;
  limit?: number;
  search?: string;
};

export async function fetchBrands({
  offset = 0,
  limit = BRANDS_PAGE_SIZE,
  search,
}: FetchBrandsOptions = {}): Promise<Brand[]> {
  const supabase = await createSupabaseServerClient();

  if (search) {
    const slugifiedQuery = slugify(search, { lower: true, strict: true });
    if (!slugifiedQuery) return [];
    const { data } = await supabase.rpc("search_brands", {
      query: slugifiedQuery,
      page_limit: limit,
      page_offset: offset,
    });
    return data ?? [];
  }

  const { data } = await supabase
    .from("brands")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return data ?? [];
}
