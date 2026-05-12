"use client";

import { useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const searchSchema = z.object({
  search: z.string().refine((v) => v.length === 0 || v.length >= 3, {
    message: "Search must be at least 3 characters",
  }),
});

type SearchValues = z.infer<typeof searchSchema>;

export function BrandsSearch({ search }: { search: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SearchValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { search },
  });

  useEffect(() => {
    reset({ search });
  }, [search, reset]);

  function onSubmit(data: SearchValues) {
    const params: Record<string, string> = {};
    if (data.search) params.search = data.search;
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
          placeholder="Search brands..."
          {...register("search")}
          className="input input-sm input-bordered w-48"
        />
        {errors.search && (
          <span className="text-error text-xs">{errors.search.message}</span>
        )}
      </div>

      <button type="submit" className="btn btn-sm btn-primary" disabled={isPending}>
        {isPending && <span className="loading loading-spinner loading-xs" />}
        Search
      </button>

      {search && (
        <button
          type="button"
          className="btn btn-sm btn-outline"
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              router.replace(pathname as Route, { scroll: false });
            })
          }
        >
          Reset
        </button>
      )}
    </form>
  );
}
