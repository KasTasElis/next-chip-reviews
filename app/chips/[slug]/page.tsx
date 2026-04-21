import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { routes } from "@/app/routes";
import ReviewSection from "./ReviewSection";
import ReviewList from "./ReviewList";
import StarRating from "@/app/components/StarRating";
import Image from "next/image";
import { Timestamps } from "@/app/components/Timestamps";
import { reviewsQueryBuilder } from "./queries";

type Props = { params: Promise<{ slug: string }> };

const getChip = cache(async (slug: string) => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("chips_with_stats")
    .select(
      "id, name, description, slug, photo_url, average_rating, review_count, created_at, updated_at, brands(name, slug, logo_url)",
    )
    .eq("slug", slug)
    .single();
  return data;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const chip = await getChip(slug);
  if (!chip) return {};

  const desc = chip.description
    ? chip.description.slice(0, 155) +
      (chip.description.length > 155 ? "…" : "")
    : `Read community reviews for ${chip.name}.`;

  return {
    title: chip.name,
    description: desc,
    openGraph: chip.photo_url ? { images: [chip.photo_url] } : undefined,
  };
}

export default async function ChipsSingle({ params }: Props) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const chip = await getChip(slug);

  if (!chip) notFound();

  const { data: reviews } = await reviewsQueryBuilder(supabase, chip.id);

  const brand = Array.isArray(chip.brands) ? chip.brands[0] : chip.brands;

  return (
    <div className="container mx-auto my-5 mb-7">
      {/* Hero section */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="md:w-1/2">
          <figure className="relative h-[30vh] bg-gray-900 rounded-xl overflow-hidden">
            <Image
              src={
                chip.photo_url ??
                "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
              }
              alt={chip.name}
              className="object-scale-down"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </figure>
        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{chip.name}</h1>
          <StarRating
            rating={chip.average_rating}
            count={chip.review_count}
            size="lg"
          />

          {brand && (
            <Link
              href={`${routes.brands}/${brand.slug}`}
              className="flex items-center gap-2 hover:opacity-80 transition w-fit"
            >
              <div className="avatar">
                <div className="mask mask-squircle w-8 h-8 relative">
                  <Image
                    src={
                      brand.logo_url ??
                      "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                    }
                    alt={brand.name}
                    fill
                    className="object-fit"
                    sizes="32px"
                  />
                </div>
              </div>
              <span className="text-xl font-medium">{brand.name}</span>
            </Link>
          )}

          {chip.description && (
            <p className="text-md opacity-70">{chip.description}</p>
          )}

          <Timestamps
            created_at={chip.created_at}
            updated_at={chip.updated_at}
          />

          <ReviewSection chipId={chip.id} chipSlug={chip.slug} user={user} />
        </div>
      </div>

      {/* Reviews section */}
      <div>
        <h2 className="text-lg font-bold mb-4">Reviews</h2>
        <ReviewList reviews={reviews ?? []} userId={user?.id ?? null} />
      </div>
    </div>
  );
}
