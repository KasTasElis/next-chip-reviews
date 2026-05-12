import type { Metadata } from "next";
import { z } from "zod";
import { BrandsEmptyState } from "../components/BrandsEmptyState";
import { BrandsList } from "./BrandsList";
import { BrandsSearch } from "./BrandsSearch";
import { fetchBrands, type FetchBrandsOptions } from "./actions";

export const metadata: Metadata = {
  title: "All Brands",
  description: "Explore all chip brands reviewed by the community.",
};

const BrandsParamsSchema = z.object({
  search: z.string().trim().catch(""),
});

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { search } = BrandsParamsSchema.parse(await searchParams);
  const isSearching = search.length >= 3;

  const fetchOptions: FetchBrandsOptions = {
    search: isSearching ? search : undefined,
  };
  const brands = await fetchBrands(fetchOptions);
  const listKey = JSON.stringify(fetchOptions);

  return (
    <div className="container mx-auto my-5 px-4">
      <div className="flex justify-between mb-3 items-center">
        <h2 className="text-lg font-bold">All Brands</h2>
      </div>
      <BrandsSearch search={search} />
      {brands.length > 0 ? (
        <BrandsList
          key={listKey}
          initialBrands={brands}
          search={fetchOptions.search}
        />
      ) : (
        <BrandsEmptyState />
      )}
    </div>
  );
}
