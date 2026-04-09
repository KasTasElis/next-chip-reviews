import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import ReviewSection from "./ReviewSection";
import ReviewList from "./ReviewList";
import Image from "next/image";

export default async function ChipsSingle({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: chip } = await supabase
    .from("chips")
    .select(
      "id, name, description, slug, photo_url, brands(name, slug, logo_url)",
    )
    .eq("slug", slug)
    .single();

  if (!chip) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, review, photo_url, created_at, user_id_fk, profiles(username)")
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
            />
          </figure>
        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{chip.name}</h1>

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
        <ReviewList
          reviews={reviews ?? []}
          userId={user?.id ?? null}
          chipSlug={chip.slug}
        />
      </div>
    </div>
  );
}
