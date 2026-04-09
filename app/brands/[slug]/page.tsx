import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChipCard } from "@/app/components/ChipCard";
import { ChipsEmptyState } from "@/app/components/ChipsEmptyState";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";

export default async function BrandSingle({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: brand } = await supabase
    .from("brands")
    .select("id, name, description, slug, logo_url")
    .eq("slug", slug)
    .single();

  if (!brand) notFound();

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

        <div className="flex flex-wrap gap-3">
          {chips && chips.length > 0 ? (
            chips.map((chip) => (
              <Link
                key={chip.id}
                href={`/chips/${chip.slug}`}
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
    </div>
  );
}
