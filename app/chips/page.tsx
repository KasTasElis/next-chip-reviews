import type { Metadata } from "next";
import { z } from "zod";
import { ChipsEmptyState } from "../components/ChipsEmptyState";
import { fetchChips } from "./actions";
import { ChipsList } from "./ChipsList";
import { ChipsFilterSort } from "./ChipsFilterSort";

export const metadata: Metadata = {
  title: "All Chips",
  description: "Browse every chip reviewed by the community.",
};

const ChipsParamsSchema = z.object({
  sortBy: z
    .enum(["average_rating", "review_count"])
    .optional()
    .catch(undefined),
  sortOrder: z.enum(["asc", "desc"]).catch("desc"),
  minRating: z.coerce.number().min(0).max(5).catch(0),
  search: z.string().trim().catch(""),
});

export default async function ChipsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { sortBy, sortOrder, minRating, search } = ChipsParamsSchema.parse(
    await searchParams,
  );

  const isSearching = search.length >= 3;

  const chips = await fetchChips({
    sortBy,
    sortOrder,
    minRating,
    search: isSearching ? search : undefined,
  });

  const listKey = JSON.stringify({ sortBy, sortOrder, minRating, search: isSearching ? search : undefined });

  return (
    <div className="container mx-auto my-5 px-4">
      <div className="flex justify-between mb-3 items-center">
        <h2 className="text-lg font-bold">All Chips</h2>
      </div>
      <ChipsFilterSort
        sortBy={sortBy}
        sortOrder={sortOrder}
        minRating={minRating}
        search={search}
      />
      {chips.length > 0 ? (
        <ChipsList
          key={listKey}
          initialChips={chips}
          sortBy={sortBy}
          sortOrder={sortOrder}
          minRating={minRating}
          search={isSearching ? search : undefined}
        />
      ) : (
        <ChipsEmptyState />
      )}
    </div>
  );
}
