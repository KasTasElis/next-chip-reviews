"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { SortableChipColumn } from "./actions";

const SORT_OPTIONS: { label: string; value: SortableChipColumn | "" }[] = [
  { label: "Default", value: "" },
  { label: "Avg Rating", value: "average_rating" },
  { label: "Review Count", value: "review_count" },
];

export function ChipsFilterSort({
  sortBy,
  sortOrder,
  minRating,
}: {
  sortBy: SortableChipColumn | undefined;
  sortOrder: "asc" | "desc";
  minRating: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [localSortBy, setLocalSortBy] = useState(sortBy ?? "");
  const [localSortOrder, setLocalSortOrder] = useState(sortOrder);
  const [localMinRating, setLocalMinRating] = useState(minRating);

  useEffect(() => {
    setLocalSortBy(sortBy ?? "");
  }, [sortBy]);
  useEffect(() => {
    setLocalSortOrder(sortOrder);
  }, [sortOrder]);
  useEffect(() => {
    setLocalMinRating(minRating);
  }, [minRating]);

  function update(updates: Record<string, string>) {
    const merged = { ...Object.fromEntries(searchParams), ...updates };
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== ""))
    );
    router.replace(`${pathname}?${params.toString()}` as Route, { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-3 items-center mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium whitespace-nowrap">Sort by</span>
        <select
          className="select select-sm select-bordered"
          value={localSortBy}
          onChange={(e) => {
            const val = e.target.value;
            setLocalSortBy(val);
            update({ sortBy: val, sortOrder: val ? localSortOrder : "" });
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {localSortBy && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">Order</span>
          <select
            className="select select-sm select-bordered"
            value={localSortOrder}
            onChange={(e) => {
              setLocalSortOrder(e.target.value as "asc" | "desc");
              update({ sortOrder: e.target.value });
            }}
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
          value={localMinRating}
          className="range range-sm w-32"
          onChange={(e) => setLocalMinRating(Number(e.target.value))}
          onPointerUp={(e) => {
            const val = (e.target as HTMLInputElement).value;
            update({ minRating: val === "0" ? "" : val });
          }}
        />
        <span className="text-sm w-6 text-right">
          {localMinRating > 0 ? localMinRating : "Any"}
        </span>
      </div>
    </div>
  );
}
