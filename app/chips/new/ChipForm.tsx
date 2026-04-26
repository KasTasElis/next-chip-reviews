"use client";

import clsx from "clsx";
import slugify from "slugify";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { chipFormSchema, type ChipFormInputs } from "./schema";
import { routes } from "@/app/routes";
import { createChip } from "./actions";
import { supabase } from "@/app/lib/supabase";
import type { Brand } from "@/supabase/types";
import PhotoUpload from "@/app/components/PhotoUpload";
import Autocomplete from "@/app/components/Autocomplete";
import { DevTool } from "@hookform/devtools";

export default function ChipForm({ brands }: { brands: Brand[] }) {
  const brandOptions = brands.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string>();

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ChipFormInputs>({ resolver: zodResolver(chipFormSchema) });

  const [watchedName, watchedBrandId] = useWatch({
    control,
    name: ["name", "brand_id"],
    defaultValue: { name: "", brand_id: "" },
  });
  const selectedBrand = brands.find((brand) => brand.id === watchedBrandId);
  const prelimSlug = `${selectedBrand?.name ? `${selectedBrand.name} ` : ""}${watchedName ?? ""}`;

  const slug = slugify(prelimSlug, { lower: true, strict: true });

  const onSubmit = async ({ name, description, brand_id }: ChipFormInputs) => {
    setPhotoError(undefined);

    if (!photoFile) {
      setPhotoError("Please add a photo.");
      return;
    }

    const path = `${slug}.webp`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("chip-photos")
      .upload(path, photoFile);

    if (uploadError) {
      setPhotoError(uploadError.message);
      return;
    }

    const photo_url = supabase.storage
      .from("chip-photos")
      .getPublicUrl(uploadData.path).data.publicUrl;

    const { error: createChipError, slug: createdChipSlug } = await createChip({
      name,
      description,
      brand_id,
      slug,
      photo_url,
    });

    if (createChipError) {
      setError("root", { message: createChipError });

      // todo: clean up potentially stranded images
      // console.log("path: ", uploadData.path, uploadData.fullPath);
      // const { error: cleanUpErr, data: cleanUpData } = await supabase.storage
      //   .from("chip-photos")
      //   .remove([uploadData.fullPath]);

      // console.log({ cleanUpErr, cleanUpData });
      return;
    }
    toast.success(`${name} added!`);
    router.push(`${routes.chips}/${createdChipSlug}`);
  };

  return (
    <div className="w-full max-w-3xl min-w-80 mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-6">Add a Chip</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {errors.root ? (
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
        ) : null}

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Brand Name*</legend>
          <Controller
            name="brand_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={brandOptions}
                value={field.value ?? null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={!!errors.brand_id}
                placeholder="e.g. Lay's"
              />
            )}
          />
          {errors.brand_id ? (
            <p className="text-error text-xs mt-1">{errors.brand_id.message}</p>
          ) : null}
          <p className="text-xs mt-1">
            Can&apos;t find a brand?{" "}
            <Link href={routes.brandsNew} className="link link-primary">
              Add brand
            </Link>
          </p>
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Flavor*</legend>
          <input
            {...register("name")}
            type="text"
            placeholder="e.g. Sour Cream & Onion"
            className={clsx("input w-full", errors.name && "input-error")}
          />
          {slug ? (
            <p className="text-base-content/50 text-xs mt-1">chips/{slug}</p>
          ) : null}

          {errors.name ? (
            <p className="text-error text-xs mt-1">{errors.name.message}</p>
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

        <PhotoUpload
          label="Package Photo*"
          onChange={(file) => {
            setPhotoError(undefined);
            setPhotoFile(file);
          }}
          aspect={4 / 3}
          error={photoError}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary mt-2"
        >
          {isSubmitting ? (
            <span className="loading loading-spinner" />
          ) : (
            "Add Chip"
          )}
        </button>
      </form>
      {process.env.NODE_ENV !== "production" && <DevTool control={control} />}
    </div>
  );
}
