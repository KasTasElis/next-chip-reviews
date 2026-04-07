"use client";

import clsx from "clsx";
import slugify from "slugify";
import { useForm, useWatch, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { brandFormSchema, type BrandFormInputs } from "./schema";
import { createBrand } from "./actions";

export default function AddBrand() {
  const router = useRouter();
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
    const slug = slugify(name, { lower: true, strict: true });
    const result = await createBrand({ name, description, slug });
    if (result?.error) {
      setError("root", { message: result.error });
      return;
    }
    toast.success(`${name} added!`);
    router.push(`/brands/${result.slug}`);
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
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-base-300 rounded-box cursor-pointer hover:border-primary hover:bg-base-200 transition-colors">
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
            <input
              type="file"
              name="logo"
              accept="image/*"
              className="hidden"
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
            "Add Brand"
          )}
        </button>
      </form>
    </div>
  );
}
