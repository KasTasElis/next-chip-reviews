"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import clsx from "clsx";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { submitReview } from "./actions";

const reviewSchema = z.object({
  rating: z.number().int().min(1, "Select a rating").max(5),
  review: z.string().min(1, "Review cannot be empty"),
});

type Inputs = z.infer<typeof reviewSchema>;

function ReviewForm({
  chipId,
  onSuccess,
}: {
  chipId: number;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({ resolver: zodResolver(reviewSchema) });

  const rating = watch("rating");

  const submit: SubmitHandler<Inputs> = async (data) => {
    const result = await submitReview(chipId, data);
    if (result.error) {
      setError("root", { message: result.error });
      return;
    }
    reset();
    toast.success("Review submitted!");
    onSuccess();
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
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
              onChange={() => setValue("rating", value, { shouldValidate: true })}
            />
          ))}
        </div>
        {errors.rating && (
          <p className="text-error text-xs mt-1">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <textarea
          {...register("review")}
          placeholder="Write your review..."
          rows={4}
          className={clsx("textarea w-full", errors.review && "textarea-error")}
        />
        {errors.review && (
          <p className="text-error text-xs mt-1">{errors.review.message}</p>
        )}
      </div>

      <button
        disabled={isSubmitting}
        type="submit"
        className={clsx("btn btn-primary", isSubmitting && "btn-disabled")}
      >
        {isSubmitting ? <span className="loading loading-spinner" /> : "Submit Review"}
      </button>
    </form>
  );
}

export default function ReviewSection({
  chipId,
  chipSlug,
  user,
}: {
  chipId: number;
  chipSlug: string;
  user: User | null;
}) {
  const modalRef = useRef<HTMLDialogElement>(null);

  if (!user) {
    return (
      <Link
        href={`/auth/sign-in?next=/chips/${chipSlug}` as Route}
        className="btn btn-outline btn-primary w-fit mt-2"
      >
        Sign in to review
      </Link>
    );
  }

  return (
    <>
      <button
        className="btn btn-primary w-fit mt-2"
        onClick={() => modalRef.current?.showModal()}
      >
        Write a Review
      </button>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Write a Review</h3>
          <ReviewForm chipId={chipId} onSuccess={() => modalRef.current?.close()} />
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
