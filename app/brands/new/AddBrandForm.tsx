"use client";

import clsx from "clsx";
import slugify from "slugify";
import { useForm, useWatch, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { brandFormSchema, type BrandFormInputs } from "./schema";
import { routes } from "@/app/routes";
import { createBrand } from "./actions";
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

export default function AddBrand() {
  const router = useRouter();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormInputs>({ resolver: zodResolver(brandFormSchema) });

  const watchedName = useWatch({ control, name: "name", defaultValue: "" });
  const slugPreview = watchedName
    ? slugify(watchedName, { lower: true, strict: true })
    : "";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setLogoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setLogoError(null);
  }

  const onSubmit: SubmitHandler<BrandFormInputs> = async ({
    name,
    description,
  }) => {
    if (!logoFile) {
      setLogoError("Logo is required");
      return;
    }

    const slug = slugify(name, { lower: true, strict: true });
    const ext = getExtension(logoFile.type);
    const path = `${slug}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("brand-logos")
      .upload(path, logoFile);

    if (uploadError) {
      console.log("Image error: ", uploadError);
      setError("root", { message: uploadError.message });
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("brand-logos").getPublicUrl(uploadData.path);

    const result = await createBrand({
      name,
      description,
      slug,
      logo_url: publicUrl,
    });
    if (result?.error) {
      setError("root", { message: result.error });
      return;
    }
    toast.success(`${name} added!`);
    router.push(`${routes.brands}/${result.slug}`);
  };

  return (
    <div className="w-full max-w-3xl min-w-80 mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-6">Add a Brand</h1>

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
            placeholder="Brand name"
            className={clsx("input w-full", errors.name && "input-error")}
          />
          {errors.name ? (
            <p className="text-error text-xs mt-1">{errors.name.message}</p>
          ) : slugPreview ? (
            <p className="text-base-content/50 text-xs mt-1">
              brands/{slugPreview}
            </p>
          ) : null}
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Description</legend>
          <textarea
            {...register("description")}
            placeholder="A short description of the brand"
            className="textarea w-full h-32"
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Logo</legend>
          <label
            className={clsx(
              "flex flex-col items-center justify-center w-full border-2 border-dashed rounded-box cursor-pointer hover:border-primary hover:bg-base-200 transition-colors overflow-hidden",
              logoError ? "border-error" : "border-base-300",
              previewUrl ? "h-auto p-2" : "h-40",
            )}
          >
            {previewUrl ? (
              <div className="relative flex flex-col items-center gap-2 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Logo preview"
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
                  Drop logo here or <span className="text-primary">browse</span>
                </span>
                <span className="text-xs">PNG, JPG, SVG up to 5MB</span>
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
          {logoError && <p className="text-error text-xs mt-1">{logoError}</p>}
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
            "Add Brand"
          )}
        </button>
      </form>
    </div>
  );
}
