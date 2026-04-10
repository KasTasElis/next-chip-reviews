import type { Metadata } from "next";
import { BrandCard } from "./components/BrandCard";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Discover top-rated chips and trending brands. Browse community reviews.",
};
import { BrandsEmptyState } from "./components/BrandsEmptyState";
import { ChipCard } from "./components/ChipCard";
import { ChipsEmptyState } from "./components/ChipsEmptyState";
import { createSupabaseServerClient } from "./lib/supabase-server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const [{ data: brands }, { data: chips }] = await Promise.all([
    supabase
      .from("brands")
      .select("id, name, description, slug, logo_url")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase.from("chips_with_stats").select("*").limit(10),
  ]);

  return (
    <div>
      {/* <div className="container mx-auto my-5 mb-7">
        <div className="flex justify-between mb-3">
          <h2 className="text-lg font-bold">⭐️ All Time Favorites</h2>
          <button className="underline">See All</button>
        </div>

        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((i, k) => (
            <Link
              href="/chips/123"
              key={k}
              className="flex-1 hover:opacity-80 transition"
            >
              <ChipCard />
            </Link>
          ))}
        </div>
      </div> */}
      <h1>Hello World</h1>

      <div className="container mx-auto my-5 mb-7">
        <div className="flex justify-between mb-3 items-center">
          <h2 className="text-lg font-bold">⭐️ Top Rated 10</h2>
          <Link href="/chips" className="underline hover:opacity-80">
            See All
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

      <div className="container mx-auto my-5">
        <div className="flex justify-between mb-3 items-center">
          <h2 className="text-lg font-bold">Brands</h2>
          <Link className="underline hover:opacity-80" href={"/brands"}>
            See All
          </Link>
        </div>

        <div className="flex gap-3">
          {brands && brands.length > 0 ? (
            brands.map((brand) => (
              <Link
                href={`/brands/${brand.slug}`}
                key={brand.id}
                className="hover:opacity-80 transition w-[25%]"
              >
                <BrandCard
                  name={brand.name}
                  description={brand.description}
                  logo_url={brand.logo_url}
                />
              </Link>
            ))
          ) : (
            <BrandsEmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
