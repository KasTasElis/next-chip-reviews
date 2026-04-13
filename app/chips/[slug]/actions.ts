"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().min(1),
  photo_url: z.string().url().optional(),
});

export async function submitReview(chipId: number, data: unknown) {
  const parsed = reviewSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("reviews").insert({
    chips_id_fk: chipId,
    user_id_fk: user.id,
    rating: parsed.data.rating,
    review: parsed.data.review,
    ...(parsed.data.photo_url ? { photo_url: parsed.data.photo_url } : {}),
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateReview(reviewId: number, data: unknown) {
  const parsed = reviewSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: existing } = await supabase
    .from("reviews")
    .select("user_id_fk")
    .eq("id", reviewId)
    .single();

  // TODO: RLS should take care of this?
  if (!existing || existing.user_id_fk !== user.id)
    return { error: "Forbidden" };

  const { error } = await supabase
    .from("reviews")
    .update({
      rating: parsed.data.rating,
      review: parsed.data.review,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId);

  if (error) return { error: error.message };
  refresh();
  return { success: true };
}

export async function deleteReview(reviewId: number) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: existing } = await supabase
    .from("reviews")
    .select("user_id_fk")
    .eq("id", reviewId)
    .single();
  if (!existing || existing.user_id_fk !== user.id)
    return { error: "Forbidden" };

  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) return { error: error.message };
  refresh();
  return { success: true };
}
