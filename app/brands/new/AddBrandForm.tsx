"use client";

import clsx from "clsx";
import { XCircle } from "lucide-react";
import slugify from "slugify";
import {
  useForm,
  useWatch,
  SubmitHandler,
  FieldValues,
  Control,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { brandFormSchema, type BrandFormInputs } from "./schema";
import { routes } from "@/app/routes";
import { submitBrand, findSimilarBrands } from "./actions";
import PhotoUpload from "@/app/components/PhotoUpload";
import SimilarItemsWarning from "@/app/components/SimilarItemsWarning";
import dynamic from "next/dynamic";
import { useScrollToError } from "@/app/hooks/useScrollToError";
import { Route } from "next";

const DevTool = dynamic(
  () => import("@hookform/devtools").then((m) => m.DevTool),
  { ssr: false },
);

export default function AddBrand() {
  const router = useRouter();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<BrandFormInputs>({ resolver: zodResolver(brandFormSchema) });

  const formRef = useScrollToError(errors, submitCount);

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

    const formData = new FormData();
    formData.append("name", name);
    if (description) formData.append("description", description);
    formData.append("logo", logoFile);

    const result = await submitBrand(formData);

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
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        {errors.root && (
          <div role="alert" className="alert alert-error">
            <XCircle className="h-6 w-6 shrink-0" />
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

          {slugPreview ? (
            <span className="text-base-content/50 text-xs">
              slug preview: brands/{slugPreview}
            </span>
          ) : null}

          {errors.name ? (
            <p className="text-error text-xs mt-1">{errors.name.message}</p>
          ) : null}

          <SimilarItemsWarning
            slug={slugPreview}
            fetchFn={findSimilarBrands}
            message="ℹ️ We found similar existing brands. Please double check if you are not creating a duplicate."
            hrefFn={(slug) => `${routes.brands}/${slug}` as Route}
          />
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

      {process.env.NODE_ENV !== "production" && (
        <DevTool control={control as unknown as Control<FieldValues>} />
      )}
    </div>
  );
}
