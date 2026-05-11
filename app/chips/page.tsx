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
});

export default async function ChipsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { sortBy, sortOrder, minRating } = ChipsParamsSchema.parse(
    await searchParams,
  );

  const chips = await fetchChips({ sortBy, sortOrder, minRating });
  const listKey = JSON.stringify({ sortBy, sortOrder, minRating });

  return (
    <div className="container mx-auto my-5 px-4">
      <div className="flex justify-between mb-3 items-center">
        <h2 className="text-lg font-bold">All Chips</h2>
      </div>
      <ChipsFilterSort
        sortBy={sortBy}
        sortOrder={sortOrder}
        minRating={minRating}
      />
      {chips.length > 0 ? (
        <ChipsList
          key={listKey}
          initialChips={chips}
          sortBy={sortBy}
          sortOrder={sortOrder}
          minRating={minRating}
        />
      ) : (
        <ChipsEmptyState />
      )}
    </div>
  );
}
