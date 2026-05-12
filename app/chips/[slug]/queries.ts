import type { QueryData } from "@supabase/supabase-js";
import type { createSupabaseServerClient } from "@/app/lib/supabase-server";

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export type SortableReviewColumn = "likes_count" | "created_at";

export function reviewsQueryBuilder(
  supabase: SupabaseClient,
  chipId: string,
  sortBy: SortableReviewColumn = "likes_count",
  sortOrder: "asc" | "desc" = "desc",
) {
  return supabase
    .from("reviews")
    .select(
      "id, rating, review, photo_url, created_at, updated_at, user_id, likes_count, profiles!reviews_user_id_fkey(username, avatar_url), review_likes(user_id)",
    )
    .eq("chip_id", chipId)
    .order(sortBy, { ascending: sortOrder === "asc" });
}

export type ReviewsWithProfiles = QueryData<
  ReturnType<typeof reviewsQueryBuilder>
>;
export type ReviewWithProfile = ReviewsWithProfiles[number];
