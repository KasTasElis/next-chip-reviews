import type { QueryData } from "@supabase/supabase-js";
import type { createSupabaseServerClient } from "@/app/lib/supabase-server";

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export function reviewsQueryBuilder(supabase: SupabaseClient, chipId: string) {
  return supabase
    .from("reviews")
    .select(
      "id, rating, review, photo_url, created_at, updated_at, user_id, profiles(username, avatar_url)",
    )
    .eq("chip_id", chipId)
    .order("created_at", { ascending: false });
}

export type ReviewsWithProfiles = QueryData<
  ReturnType<typeof reviewsQueryBuilder>
>;
export type ReviewWithProfile = ReviewsWithProfiles[number];
