"use client";

import Link from "next/link";
import { BrandCard } from "../components/BrandCard";
import { routes } from "@/app/routes";
import type { Brand } from "@/supabase/types";
import { BRANDS_PAGE_SIZE } from "./constants";
import { fetchBrands } from "./actions";
import { useInfiniteScroll } from "@/app/hooks/useInfiniteScroll";

function BrandCardSkeleton() {
  return (
    <div className="card bg-base-100 shadow-sm h-full">
      <figure className="relative h-32">
        <div className="skeleton w-full h-full rounded-none" />
      </figure>
      <div className="card-body">
        <div className="skeleton h-4 w-20" />
      </div>
    </div>
  );
}

export function BrandsList({ initialBrands }: { initialBrands: Brand[] }) {
  const { items: brands, isLoading, hasMore, sentinelRef } = useInfiniteScroll({
    initialItems: initialBrands,
    pageSize: BRANDS_PAGE_SIZE,
    fetchFn: fetchBrands,
    rootMargin: "400px",
  });

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {brands.map((brand) => (
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
        ))}
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <BrandCardSkeleton key={i} />
          ))}
      </div>

      <div ref={sentinelRef} />

      {!hasMore && brands.length > 0 && (
        <p className="text-center text-sm opacity-50 py-4">No more brands</p>
      )}
    </>
  );
}
