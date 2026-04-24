"use client";

import clsx from "clsx";
import slugify from "slugify";
import { useForm, useWatch, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { brandFormSchema, type BrandFormInputs } from "./schema";
import { routes } from "@/app/routes";
import { createBrand } from "./actions";
import { supabase } from "@/app/lib/supabase";
import PhotoUpload from "@/app/components/PhotoUpload";
import { DevTool } from "@hookform/devtools";

export default function AddBrand() {
  const router = useRouter();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

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

  const onSubmit: SubmitHandler<BrandFormInputs> = async ({
    name,
    description,
  }) => {
    if (!logoFile) {
      setLogoError("Logo is required");
      return;
    }

    const slug = slugify(name, { lower: true, strict: true });
    const path = `${slug}.webp`;

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
      <h1 className="text-2xl font-semibold mb-6">Add a brand</h1>
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
          <legend className="fieldset-legend">Name*</legend>
          <input
            {...register("name")}
            type="text"
            placeholder="Brand Name"
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
            placeholder="Short brand description (optional)"
            className="textarea w-full h-32"
          />
        </fieldset>

        <PhotoUpload
          label="Logo*"
          onChange={(file) => {
            setLogoFile(file);
            if (file) setLogoError(null);
          }}
          error={logoError ?? undefined}
          aspect={4 / 3}
        />

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
      {process.env.NODE_ENV !== "production" && <DevTool control={control} />}
    </div>
  );
}
