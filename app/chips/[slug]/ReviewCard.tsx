"use client";

import { useRef, useState } from "react";
import { SquarePen, Trash2, Heart, XCircle } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import clsx from "clsx";
import { toast } from "sonner";
import { updateReview, deleteReview, toggleReviewLike } from "./actions";
import { Timestamps } from "@/app/components/Timestamps";
import { UserProfile } from "@/app/components/UserProfile";
import Image from "next/image";
import type { ReviewWithProfile } from "./queries";
const reviewSchema = z.object({
  rating: z.number().int().min(1, "Select a rating").max(5),
  review: z.string().min(1, "Review cannot be empty"),
});

type Inputs = z.infer<typeof reviewSchema>;

export default function ReviewCard({
  review,
  userId,
}: {
  review: ReviewWithProfile;
  userId: string | null;
}) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [likes, setLikes] = useState(review.review_likes ?? []);
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = userId === review.user_id;
  const profile = review.profiles;
  const likeCount = likes.length;
  const hasLiked = userId ? likes.some((l) => l.user_id === userId) : false;

  const {
    handleSubmit,
    setError,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: review.rating, review: review.review },
  });

  const [rating, reviewText] = useWatch({
    control,
    name: ["rating", "review"],
  });

  const onSubmitForm = (e: React.BaseSyntheticEvent) =>
    handleSubmit(submitEdit)(e);

  const submitEdit = async (data: Inputs) => {
    const result = await updateReview(review.id, data);
    if (result.error) {
      setError("root", { message: result.error });
      return;
    }
    toast.success("Review updated!");
    modalRef.current?.close();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteReview(review.id);
    setIsDeleting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Review deleted!");
  };

  const openEdit = () => {
    reset({ rating: review.rating, review: review.review });
    modalRef.current?.showModal();
  };

  const handleLike = async () => {
    if (!userId || isLiking) return;
    const prevLikes = likes;
    setLikes(
      hasLiked
        ? likes.filter((l) => l.user_id !== userId)
        : [...likes, { user_id: userId }],
    );
    setIsLiking(true);
    const result = await toggleReviewLike(review.id);
    setIsLiking(false);
    if ("error" in result) {
      setLikes(prevLikes);
      toast.error(result.error);
    }
  };

  return (
    <>
      <div className="card bg-base-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <UserProfile
            displayName={profile.username}
            avatarUrl={profile.avatar_url ?? undefined}
          />
          <div className="flex items-center gap-1">
            {isOwner && (
              <>
                <button
                  onClick={openEdit}
                  className="btn btn-ghost btn-xs"
                  aria-label="Edit review"
                >
                  <SquarePen className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="btn btn-ghost btn-xs text-error"
                  aria-label="Delete review"
                >
                  {isDeleting ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
        <div className="rating rating-md mb-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <input
              key={v}
              type="radio"
              className="mask mask-star-2 bg-orange-400"
              checked={review.rating === v}
              readOnly
              disabled
            />
          ))}
        </div>
        <p className="text-md mb-3">{review.review}</p>
        {review.photo_url && (
          <figure className="relative h-[24vh] bg-gray-900 rounded-xl overflow-hidden">
            <Image
              src={review.photo_url}
              alt="Review photo"
              className="object-scale-down"
              fill
              priority
            />
          </figure>
        )}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={handleLike}
            disabled={!userId || isLiking}
            title={!userId ? "Sign in to like" : undefined}
            className={clsx(
              "btn btn-ghost btn-lg gap-1",
              hasLiked && "text-error",
            )}
            aria-label={hasLiked ? "Unlike review" : "Like review"}
          >
            <Heart
              className="h-4 w-4"
              fill={hasLiked ? "currentColor" : "none"}
            />
            {likeCount > 0 && <span className="text-md">{likeCount}</span>}
          </button>

          <Timestamps
            created_at={review.created_at}
            updated_at={review.updated_at}
          />
        </div>
      </div>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Edit Review</h3>
          <form onSubmit={onSubmitForm} className="flex flex-col gap-3">
            {errors.root && (
              <div role="alert" className="alert alert-error">
                <XCircle className="h-6 w-6 shrink-0" />
                <span>{errors.root.message}</span>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-1">Rating</p>
              <div className="rating">
                {[1, 2, 3, 4, 5].map((value) => (
                  <input
                    key={value}
                    type="radio"
                    className="mask mask-star-2 bg-orange-400"
                    checked={rating === value}
                    onChange={() =>
                      setValue("rating", value, { shouldValidate: true })
                    }
                  />
                ))}
              </div>
              {errors.rating && (
                <p className="text-error text-xs mt-1">
                  {errors.rating.message}
                </p>
              )}
            </div>

            <div>
              <textarea
                value={reviewText}
                onChange={(e) =>
                  setValue("review", e.target.value, { shouldValidate: true })
                }
                placeholder="Write your review..."
                rows={4}
                className={clsx(
                  "textarea w-full",
                  errors.review && "textarea-error",
                )}
              />
              {errors.review && (
                <p className="text-error text-xs mt-1">
                  {errors.review.message}
                </p>
              )}
            </div>

            <button
              disabled={isSubmitting}
              type="submit"
              className={clsx(
                "btn btn-primary",
                isSubmitting && "btn-disabled",
              )}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner" />
              ) : (
                "Save"
              )}
            </button>
          </form>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Cancel</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
