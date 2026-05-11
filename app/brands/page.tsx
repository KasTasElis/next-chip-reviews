import type { Metadata } from "next";
import { BrandsEmptyState } from "../components/BrandsEmptyState";
import { createSupabaseServerClient } from "../lib/supabase-server";
import Link from "next/link";
import { routes } from "@/app/routes";
import { BrandsList } from "./BrandsList";
import { BRANDS_PAGE_SIZE } from "./constants";

export const metadata: Metadata = {
  title: "All Brands",
  description: "Explore all chip brands reviewed by the community.",
};

export default async function BrandsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("created_at", { ascending: false })
    .range(0, BRANDS_PAGE_SIZE - 1);

  return (
    <div className="container mx-auto my-5">
      <div className="flex justify-between mb-3 items-center">
        <h2 className="text-lg font-bold">All Brands</h2>
        <Link className="underline hover:opacity-80" href={routes.brandsNew}>
          Add Brand
        </Link>
      </div>
      {brands && brands.length > 0 ? (
        <BrandsList initialBrands={brands} />
      ) : (
        <BrandsEmptyState />
      )}
    </div>
  );
}
