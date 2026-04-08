import { ChipCard } from "../components/ChipCard";
import { createSupabaseServerClient } from "../lib/supabase-server";
import Link from "next/link";

export default async function ChipsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: chips } = await supabase
    .from("chips")
    .select("id, name, description, slug, photo_url")
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
        {chips?.map((chip) => (
          <Link
            href={`/chips/${chip.slug}`}
            key={chip.id}
            className="flex-1 hover:opacity-80 transition min-w-[180px]"
          >
            <ChipCard
              name={chip.name}
              description={chip.description}
              photo_url={chip.photo_url}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
