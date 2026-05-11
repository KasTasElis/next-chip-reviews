import type { Metadata } from "next";
import { ChipsEmptyState } from "../components/ChipsEmptyState";
import Link from "next/link";
import { routes } from "@/app/routes";
import { fetchChips } from "./actions";
import { ChipsList } from "./ChipsList";

export const metadata: Metadata = {
  title: "All Chips",
  description: "Browse every chip reviewed by the community.",
};

export default async function ChipsPage() {
  const chips = await fetchChips();

  return (
    <div className="container mx-auto my-5 px-4">
      <div className="flex justify-between mb-3 items-center">
        <h2 className="text-lg font-bold">All Chips</h2>
        <Link className="underline hover:opacity-80" href={routes.chipsNew}>
          Add Chip
        </Link>
      </div>
      {chips.length > 0 ? (
        <ChipsList initialChips={chips} />
      ) : (
        <ChipsEmptyState />
      )}
    </div>
  );
}
