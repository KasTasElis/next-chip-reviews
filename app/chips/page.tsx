import { ChipCard } from "../components/ChipCard";
import { ChipsEmptyState } from "../components/ChipsEmptyState";
import { createSupabaseServerClient } from "../lib/supabase-server";
import Link from "next/link";

export default async function ChipsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: chips } = await supabase
    .from("chips_with_stats")
    .select("id, name, slug, photo_url, average_rating, review_count")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto my-5">
      <div className="flex justify-between mb-3 items-center">
        <h2 className="text-lg font-bold">All Chips</h2>
        <Link className="underline hover:opacity-80" href="/chips/new">
          Add Chip
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        {chips && chips.length > 0 ? (
          chips.map((chip) => (
            <Link
              href={`/chips/${chip.slug}`}
              key={chip.id}
              className="hover:opacity-80 transition w-[25%]"
            >
              <ChipCard
                name={chip.name}
                photo_url={chip.photo_url}
                rating={chip.average_rating}
                reviewCount={chip.review_count}
              />
            </Link>
          ))
        ) : (
          <ChipsEmptyState />
        )}
      </div>
    </div>
  );
}
