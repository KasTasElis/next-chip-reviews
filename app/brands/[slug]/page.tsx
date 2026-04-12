import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import { ChipCard } from "@/app/components/ChipCard";
import { ChipsEmptyState } from "@/app/components/ChipsEmptyState";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { routes } from "@/app/routes";

type Props = { params: Promise<{ slug: string }> };

const getBrand = cache(async (slug: string) => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("brands")
    .select("id, name, description, slug, logo_url")
    .eq("slug", slug)
    .single();
  return data;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return {};

  const desc = brand.description
    ? brand.description.slice(0, 155) + (brand.description.length > 155 ? "…" : "")
    : `Browse all chips by ${brand.name}.`;

  return {
    title: brand.name,
    description: desc,
    openGraph: brand.logo_url ? { images: [brand.logo_url] } : undefined,
  };
}

export default async function BrandSingle({ params }: Props) {
  const { slug } = await params;

  const brand = await getBrand(slug);

  if (!brand) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: chips } = await supabase
    .from("chips_with_stats")
    .select("id, name, slug, photo_url, average_rating, review_count")
    .eq("brand_id_fk", brand.id)
    .order("average_rating", { ascending: false });
  const fallbackImg =
    "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp";

  return (
    <div className="container mx-auto my-5 mb-7">
      {/* Hero section */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
        <div className="avatar">
          <div className="w-24 rounded-xl relative">
            <Image
              src={brand.logo_url ?? fallbackImg}
              alt={brand.name}
              fill
              className="object-cover rounded-xl"
              sizes="96px"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{brand.name}</h1>
          <p className="text-sm opacity-70 max-w-prose">{brand.description}</p>
        </div>
      </div>

      {/* Chips section */}
      <div>
        <h2 className="text-lg font-bold mb-4">
          Chips by {brand.name} ({chips?.length ?? 0})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {chips && chips.length > 0 ? (
            chips.map((chip, i) => (
              <Link
                key={chip.id}
                href={`${routes.chips}/${chip.slug}`}
                className="hover:opacity-80 transition"
              >
                <ChipCard
                  name={chip.name}
                  photo_url={chip.photo_url}
                  rating={chip.average_rating}
                  reviewCount={chip.review_count}
                  priority={i === 0}
                />
              </Link>
            ))
          ) : (
            <ChipsEmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
