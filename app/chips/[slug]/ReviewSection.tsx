"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import clsx from "clsx";
import { routes } from "@/app/routes";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { submitReview } from "./actions";
import { supabase } from "@/app/lib/supabase";

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/svg+xml": "svg",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mimeType] ?? "jpg";
}

const reviewSchema = z.object({
  rating: z.number().int().min(1, "Select a rating").max(5),
  review: z.string().min(1, "Review cannot be empty"),
});

type Inputs = z.infer<typeof reviewSchema>;

function ReviewForm({
  chipId,
  userId,
  onSuccess,
}: {
  chipId: number;
  userId: string;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({ resolver: zodResolver(reviewSchema) });

  const rating = useWatch({ control, name: "rating" });

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  const submit: SubmitHandler<Inputs> = async (data) => {
    let photo_url: string | undefined;

    if (photoFile) {
      const ext = getExtension(photoFile.type);
      const path = `${chipId}/${userId}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("review-photos")
        .upload(path, photoFile, { upsert: true });

      if (uploadError) {
        setError("root", { message: uploadError.message });
        return;
      }

      photo_url = supabase.storage
        .from("review-photos")
        .getPublicUrl(uploadData.path).data.publicUrl;
    }

    const result = await submitReview(chipId, { ...data, photo_url });
    if (result.error) {
      setError("root", { message: result.error });
      return;
    }
    reset();
    setPhotoFile(null);
    setPreviewUrl(null);
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

      <div>
        <p className="text-sm font-medium mb-1">Photo <span className="text-base-content/50 font-normal">(optional)</span></p>
        <label
          className={clsx(
            "flex flex-col items-center justify-center w-full border-2 border-dashed rounded-box cursor-pointer hover:border-primary hover:bg-base-200 transition-colors overflow-hidden",
            previewUrl ? "h-auto p-2" : "h-32 border-base-300"
          )}
        >
          {previewUrl ? (
            <div className="relative flex flex-col items-center gap-2 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Photo preview"
                className="max-h-40 max-w-full object-contain rounded-box"
              />
              <span className="text-xs text-base-content/50">Click to change</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-base-content/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-sm">Drop photo here or <span className="text-primary">browse</span></span>
              <span className="text-xs">PNG, JPG, WebP up to 5MB</span>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </label>
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
        href={`${routes.signIn}?next=${routes.chips}/${chipSlug}` as Route}
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
          <ReviewForm chipId={chipId} userId={user.id} onSuccess={() => modalRef.current?.close()} />
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
