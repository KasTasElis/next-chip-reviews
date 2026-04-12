import type { Metadata } from "next";
import { BrandCard } from "../components/BrandCard";

export const metadata: Metadata = {
  title: "All Brands",
  description: "Explore all chip brands reviewed by the community.",
};
import { BrandsEmptyState } from "../components/BrandsEmptyState";
import { createSupabaseServerClient } from "../lib/supabase-server";
import Link from "next/link";
import { routes } from "@/app/routes";

export default async function BrandsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("id, name, description, slug, logo_url")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto my-5">
      <div className="flex justify-between mb-3 items-center">
        <h2 className="text-lg font-bold">All Brands</h2>
        <Link className="underline hover:opacity-80" href={routes.brandsNew}>
          Add Brand
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {brands && brands.length > 0 ? (
          brands.map((brand) => (
            <Link
              href={`${routes.brands}/${brand.slug}`}
              key={brand.id}
              className="hover:opacity-80 transition"
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
  );
}
