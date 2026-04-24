"use client";

import clsx from "clsx";
import slugify from "slugify";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { chipFormSchema, type ChipFormInputs } from "./schema";
import { routes } from "@/app/routes";
import { createChip } from "./actions";
import { supabase } from "@/app/lib/supabase";
import type { Brand } from "@/supabase/types";
import PhotoUpload from "@/app/components/PhotoUpload";

export default function ChipForm({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ChipFormInputs>({ resolver: zodResolver(chipFormSchema) });

  const [watchedName, watchedBrandId] = useWatch({
    control,
    name: ["name", "brand_id_fk"],
    defaultValue: { name: "", brand_id_fk: "" },
  });
  const selectedBrand = brands.find(
    (brand) => brand.id === Number(watchedBrandId),
  );
  const prelimSlug = `${selectedBrand?.name ? `${selectedBrand.name} ` : ""}${watchedName ?? ""}`;

  const slug = slugify(prelimSlug, { lower: true, strict: true });

  const onSubmit = async ({
    name,
    description,
    brand_id_fk,
  }: ChipFormInputs) => {
    let photo_url: string | undefined;
    if (photoFile) {
      const path = `${slug}.webp`;

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
    router.push(`${routes.chips}/${result.slug}`);
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
          <legend className="fieldset-legend">Name</legend>
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
          {errors.brand_id_fk ? (
            <p className="text-error text-xs mt-1">
              {errors.brand_id_fk.message}
            </p>
          ) : null}
        </fieldset>

        <PhotoUpload
          label="Photo"
          optional
          onChange={setPhotoFile}
          aspect={4 / 3}
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
    </div>
  );
}
