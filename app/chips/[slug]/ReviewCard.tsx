"use client";

import { useRef, useState, useCallback } from "react";
import { useForm, useWatch, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import clsx from "clsx";
import { toast } from "sonner";
import { updateReview, deleteReview } from "./actions";
import { Timestamps } from "@/app/components/Timestamps";
const reviewSchema = z.object({
  rating: z.number().int().min(1, "Select a rating").max(5),
  review: z.string().min(1, "Review cannot be empty"),
});

type Inputs = z.infer<typeof reviewSchema>;

export type Review = {
  id: number;
  rating: number;
  review: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string | null;
  user_id_fk: string;
  profiles: { username: string } | { username: string }[] | null;
};

export default function ReviewCard({
  review,
  userId,
}: {
  review: Review;
  userId: string | null;
}) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = userId === review.user_id_fk;
  const username =
    (Array.isArray(review.profiles)
      ? review.profiles[0]?.username
      : review.profiles?.username) ?? "Anonymous";

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

  const submitEdit = useCallback<SubmitHandler<Inputs>>(
    async (data) => {
      const result = await updateReview(review.id, data);
      if (result.error) {
        setError("root", { message: result.error });
        return;
      }
      toast.success("Review updated!");
      modalRef.current?.close();
    },
    [review.id, setError, modalRef],
  );

  const onSubmitForm = useCallback(
    (e: React.BaseSyntheticEvent) => handleSubmit(submitEdit)(e),
    [handleSubmit, submitEdit],
  );

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

  return (
    <>
      <div className="card bg-base-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{username}</span>
          <div className="flex items-center gap-1">
            {isOwner && (
              <>
                <button
                  onClick={openEdit}
                  className="btn btn-ghost btn-xs"
                  aria-label="Edit review"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
        <div className="rating rating-sm mb-2">
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
        <p className="text-sm">{review.review}</p>
        {review.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.photo_url}
            alt="Review photo"
            className="mt-3 max-h-64 max-w-full object-contain rounded-box"
          />
        )}
        <div className="mt-3">
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
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
