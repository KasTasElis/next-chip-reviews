import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import ReviewSection from "./ReviewSection";
import ReviewList from "./ReviewList";
import StarRating from "@/app/components/StarRating";
import Image from "next/image";

type Props = { params: Promise<{ slug: string }> };

const getChip = cache(async (slug: string) => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("chips_with_stats")
    .select(
      "id, name, description, slug, photo_url, average_rating, review_count, brands(name, slug, logo_url)",
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
    ? chip.description.slice(0, 155) + (chip.description.length > 155 ? "…" : "")
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

  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      "id, rating, review, photo_url, created_at, user_id_fk, profiles(username)",
    )
    .eq("chips_id_fk", chip.id)
    .order("created_at", { ascending: false });

  const brand = Array.isArray(chip.brands) ? chip.brands[0] : chip.brands;

  return (
    <div className="container mx-auto my-5 mb-7">
      {/* Hero section */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="md:w-1/2">
          <figure className="relative h-48 bg-red-200">
            <Image
              src={
                chip.photo_url ??
                "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
              }
              alt={chip.name}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </figure>
        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{chip.name}</h1>
          <StarRating rating={chip.average_rating} count={chip.review_count} />

          {brand && (
            <Link
              href={`/brands/${brand.slug}`}
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
              <span className="text-sm font-medium">{brand.name}</span>
            </Link>
          )}

          {chip.description && (
            <p className="text-sm opacity-70">{chip.description}</p>
          )}

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
