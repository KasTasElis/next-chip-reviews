import { BrandCard } from "../components/BrandCard";
import { createSupabaseServerClient } from "../lib/supabase-server";
import Link from "next/link";

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
        <Link className="underline hover:opacity-80" href="/brands/new">
          Add Brand
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        {brands?.map((brand) => (
          <Link
            href={`/brands/${brand.slug}`}
            key={brand.id}
            className="flex-1 hover:opacity-80 transition min-w-[180px]"
          >
            <BrandCard
              name={brand.name}
              description={brand.description}
              logo_url={brand.logo_url}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
