"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().min(1),
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
  });

  if (error) return { error: error.message };
  return { success: true };
}
