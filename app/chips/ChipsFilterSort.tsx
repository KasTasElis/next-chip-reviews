"use client";

import { useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SortableChipColumn } from "./actions";

const filterSchema = z.object({
  search: z.string().refine((v) => v.length === 0 || v.length >= 3, {
    message: "Search must be at least 3 characters",
  }),
  sortBy: z.enum(["average_rating", "review_count", ""]),
  sortOrder: z.enum(["asc", "desc"]),
  minRating: z.number().min(0).max(5),
});

type FilterValues = z.infer<typeof filterSchema>;

const SORT_OPTIONS: { label: string; value: SortableChipColumn | "" }[] = [
  { label: "Default", value: "" },
  { label: "Avg Rating", value: "average_rating" },
  { label: "Review Count", value: "review_count" },
];

export function ChipsFilterSort({
  sortBy,
  sortOrder,
  minRating,
  search,
}: {
  sortBy: SortableChipColumn | undefined;
  sortOrder: "asc" | "desc";
  minRating: number;
  search: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search, sortBy: sortBy ?? "", sortOrder, minRating },
  });

  useEffect(() => {
    reset({ search, sortBy: sortBy ?? "", sortOrder, minRating });
  }, [search, sortBy, sortOrder, minRating, reset]);

  const watchedSortBy = useWatch({ control, name: "sortBy" });
  const watchedMinRating = useWatch({ control, name: "minRating" });

  function onSubmit(data: FilterValues) {
    const params: Record<string, string> = {};
    if (data.search) params.search = data.search;
    if (data.sortBy) {
      params.sortBy = data.sortBy;
      params.sortOrder = data.sortOrder;
    }
    if (data.minRating > 0) params.minRating = String(data.minRating);
    startTransition(() => {
      router.replace(
        `${pathname}?${new URLSearchParams(params).toString()}` as Route,
        { scroll: false },
      );
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-wrap gap-3 mb-4 items-center"
    >
      <div className="flex flex-col gap-1">
        <input
          type="search"
          placeholder="Search chips..."
          {...register("search")}
          className="input input-sm input-bordered w-48"
        />
        {errors.search && (
          <span className="text-error text-xs">{errors.search.message}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium whitespace-nowrap">Sort by</span>
        <select
          className="select select-sm select-bordered"
          {...register("sortBy")}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {watchedSortBy && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">Order</span>
          <select
            className="select select-sm select-bordered"
            {...register("sortOrder")}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      )}

      <div className="flex items-center gap-2 ml-auto">
        <span className="text-sm font-medium whitespace-nowrap">
          Min Rating
        </span>
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          {...register("minRating", { valueAsNumber: true })}
          className="range range-sm w-32"
        />
        <span className="text-sm w-6 text-right">
          {Number(watchedMinRating) > 0 ? watchedMinRating : "Any"}
        </span>
      </div>

      <button type="submit" className="btn btn-sm btn-primary" disabled={isPending}>
        {isPending && <span className="loading loading-spinner loading-xs" />}
        Search
      </button>
    </form>
  );
}
