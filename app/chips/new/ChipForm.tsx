"use client";

import clsx from "clsx";
import { XCircle } from "lucide-react";
import slugify from "slugify";
import {
  useForm,
  useWatch,
  SubmitHandler,
  Controller,
  Control,
  FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import { chipFormSchema, type ChipFormInputs } from "./schema";
import { routes } from "@/app/routes";
import { createChip, findSimilarChips } from "./actions";
import SimilarItemsWarning from "@/app/components/SimilarItemsWarning";
import type { Brand } from "@/supabase/types";
import PhotoUpload from "@/app/components/PhotoUpload";
import Autocomplete from "@/app/components/Autocomplete";
import { Route } from "next";
import dynamic from "next/dynamic";
import { useScrollToError } from "@/app/hooks/useScrollToError";

const DevTool = dynamic(
  () => import("@hookform/devtools").then((m) => m.DevTool),
  { ssr: false },
);

export default function ChipForm({ brands }: { brands: Brand[] }) {
  const brandOptions = brands.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<ChipFormInputs>({ resolver: zodResolver(chipFormSchema) });

  const formRef = useScrollToError(errors, submitCount);

  const [watchedName, watchedBrandId] = useWatch({
    control,
    name: ["name", "brand_id"],
    defaultValue: { name: "", brand_id: "" },
  });
  const selectedBrand = brands.find((brand) => brand.id === watchedBrandId);
  const prelimSlug = `${selectedBrand?.name ? `${selectedBrand.name} ` : ""}${watchedName ?? ""}`;

  const slug = slugify(prelimSlug, { lower: true, strict: true });

  const fetchSimilarChips = useCallback(
    (chipSlug: string) => findSimilarChips(chipSlug, watchedBrandId),
    [watchedBrandId],
  );

  const onSubmit: SubmitHandler<ChipFormInputs> = async ({ name, description, brand_id }) => {
    if (!photoFile) {
      setPhotoError("Please add a photo.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (description) formData.append("description", description);
    formData.append("brand_id", brand_id);
    formData.append("slug", slug);
    formData.append("photo", photoFile);

    const result = await createChip(formData);

    if (result?.error) {
      setError("root", { message: result.error });
      return;
    }

    toast.success(`${name} added!`);
    router.push(`${routes.chips}/${result.slug}`);
  };

  return (
    <div className="w-full max-w-3xl min-w-80 mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-6">Add a Chip</h1>

      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {errors.root && (
          <div role="alert" className="alert alert-error">
            <XCircle className="h-6 w-6 shrink-0" />
            <span>{errors.root.message}</span>
          </div>
        )}

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

          {watchedBrandId && (
            <SimilarItemsWarning
              slug={slug}
              fetchFn={fetchSimilarChips}
              message="ℹ️ We found similar existing chips. Please double check if you are not creating a duplicate."
              hrefFn={(s) => `${routes.chips}/${s}` as Route}
            />
          )}
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
            if (file) setPhotoError(null);
            setPhotoFile(file);
          }}
          aspect={4 / 3}
          error={photoError ?? undefined}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={clsx("btn btn-primary mt-2", isSubmitting && "btn-disabled")}
        >
          {isSubmitting ? (
            <span className="loading loading-spinner" />
          ) : (
            "Add Chip"
          )}
        </button>
      </form>
      {process.env.NODE_ENV !== "production" && (
        <DevTool control={control as unknown as Control<FieldValues>} />
      )}
    </div>
  );
}
