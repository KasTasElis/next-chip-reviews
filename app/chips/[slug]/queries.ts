import type { QueryData } from "@supabase/supabase-js";
import type { createSupabaseServerClient } from "@/app/lib/supabase-server";

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export function reviewsQueryBuilder(supabase: SupabaseClient, chipId: number) {
  return supabase
    .from("reviews")
    .select(
      "id, rating, review, photo_url, created_at, updated_at, user_id_fk, profiles(username, avatar_url)",
    )
    .eq("chips_id_fk", chipId)
    .order("created_at", { ascending: false });
}

export type ReviewsWithProfiles = QueryData<
  ReturnType<typeof reviewsQueryBuilder>
>;
export type ReviewWithProfile = ReviewsWithProfiles[number];
