import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";

export default async function ChipsSingle({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: chip } = await supabase
    .from("chips")
    .select("id, name, description, slug, photo_url, brands(name, slug, logo_url)")
    .eq("slug", slug)
    .single();

  if (!chip) notFound();

  const brand = Array.isArray(chip.brands) ? chip.brands[0] : chip.brands;

  return (
    <div className="container mx-auto my-5 mb-7">
      {/* Hero section */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="md:w-1/2">
          <div className="card bg-base-100 shadow-sm">
            <figure>
              <img
                src={chip.photo_url ?? "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"}
                alt={chip.name}
                className="w-full"
              />
            </figure>
          </div>
        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{chip.name}</h1>

          {brand && (
            <Link
              href={`/brands/${brand.slug}`}
              className="flex items-center gap-2 hover:opacity-80 transition w-fit"
            >
              <div className="avatar">
                <div className="mask mask-squircle w-8 h-8">
                  <img src={brand.logo_url ?? ""} alt={brand.name} />
                </div>
              </div>
              <span className="text-sm font-medium">{brand.name}</span>
            </Link>
          )}

          {chip.description && (
            <p className="text-sm opacity-70">{chip.description}</p>
          )}

          <button className="btn btn-primary w-fit mt-2">Write a Review</button>
        </div>
      </div>

      {/* Reviews section */}
      <div>
        <h2 className="text-lg font-bold mb-4">Reviews</h2>
        <p className="text-sm opacity-50">No reviews yet. Be the first!</p>
      </div>
    </div>
  );
}
