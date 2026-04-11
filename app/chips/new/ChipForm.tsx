"use client";

import clsx from "clsx";
import slugify from "slugify";
import { useForm, useWatch, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { chipFormSchema, type ChipFormInputs } from "./schema";
import { createChip } from "./actions";
import { supabase } from "@/app/lib/supabase";
import type { Brand } from "@/supabase/types";

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

export default function ChipForm({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ChipFormInputs>({ resolver: zodResolver(chipFormSchema) });

  const watchedName = useWatch({ control, name: "name", defaultValue: "" });
  const slugPreview = watchedName
    ? slugify(watchedName, { lower: true, strict: true })
    : "";

  const onSubmit: SubmitHandler<ChipFormInputs> = async ({
    name,
    description,
    brand_id_fk,
  }) => {
    const slug = slugify(name, { lower: true, strict: true });

    let photo_url: string | undefined;
    if (photoFile) {
      const ext = getExtension(photoFile.type);
      const path = `${slug}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chip-photos")
        .upload(path, photoFile);

      if (uploadError) {
        setError("root", { message: uploadError.message });
        return;
      }

      photo_url = supabase.storage
        .from("chip-photos")
        .getPublicUrl(uploadData.path).data.publicUrl;
    }

    const result = await createChip({
      name,
      description,
      brand_id_fk,
      slug,
      photo_url,
    });
    if (result?.error) {
      setError("root", { message: result.error });
      return;
    }
    toast.success(`${name} added!`);
    router.push(`/chips/${result.slug}`);
  };

  return (
    <div className="w-full max-w-3xl min-w-80 mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-6">Add a Chip</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Name</legend>
          <input
            {...register("name")}
            type="text"
            placeholder="e.g. Sour Cream & Onion"
            className={clsx("input w-full", errors.name && "input-error")}
          />
          {errors.name ? (
            <p className="text-error text-xs mt-1">{errors.name.message}</p>
          ) : slugPreview ? (
            <p className="text-base-content/50 text-xs mt-1">
              chips/{slugPreview}
            </p>
          ) : null}
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Description</legend>
          <textarea
            {...register("description")}
            placeholder="Describe the chip..."
            className="textarea w-full h-32"
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Brand</legend>
          <select
            {...register("brand_id_fk")}
            className={clsx(
              "select w-full",
              errors.brand_id_fk && "select-error",
            )}
            defaultValue=""
          >
            <option value="" disabled>
              Select a brand
            </option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {errors.brand_id_fk && (
            <p className="text-error text-xs mt-1">
              {errors.brand_id_fk.message}
            </p>
          )}
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            Photo{" "}
            <span className="text-base-content/40 font-normal">(optional)</span>
          </legend>
          <label
            className={clsx(
              "flex flex-col items-center justify-center w-full border-2 border-dashed rounded-box cursor-pointer hover:border-primary hover:bg-base-200 transition-colors overflow-hidden",
              previewUrl ? "h-auto p-2" : "h-40 border-base-300",
            )}
          >
            {previewUrl ? (
              <div className="relative flex flex-col items-center gap-2 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Photo preview"
                  className="max-h-48 max-w-full object-contain rounded"
                />
                <span className="text-xs text-base-content/50">
                  Click to change
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-base-content/50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <span className="text-sm">
                  Drop photo here or{" "}
                  <span className="text-primary">browse</span>
                </span>
                <span className="text-xs">PNG, JPG, WebP up to 5MB</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className={clsx(
            "btn btn-primary mt-2",
            isSubmitting && "btn-disabled",
          )}
        >
          {isSubmitting ? (
            <span className="loading loading-spinner" />
          ) : (
            "Add Chip"
          )}
        </button>
      </form>
    </div>
  );
}
