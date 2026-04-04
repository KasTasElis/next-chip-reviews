import Link from "next/link";
import { ChipCard } from "@/app/components/ChipCard";

const brand = {
  name: "Pringles",
  description:
    "Known for their iconic saddle-shaped crisps and stackable tube packaging, Pringles has been a global snack staple since 1968. Every chip is uniform, crunchy, and boldly flavored.",
  logo_url:
    "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
};

const chips = [
  { id: 1, slug: "pringles-sour-cream-onion" },
  { id: 2, slug: "pringles-original" },
  { id: 3, slug: "pringles-cheddar" },
  { id: 4, slug: "pringles-bbq" },
  { id: 5, slug: "pringles-ranch" },
];

export default function BrandSingle() {
  return (
    <div className="container mx-auto my-5 mb-7">
      {/* Hero section */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
        <div className="avatar">
          <div className="w-24 rounded-xl">
            <img src={brand.logo_url} alt={brand.name} />
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
          Chips by {brand.name} ({chips.length})
        </h2>

        <div className="flex flex-wrap gap-3">
          {chips.map((chip) => (
            <Link
              key={chip.id}
              href={`/chips/${chip.slug}`}
              className="flex-1 min-w-[180px] hover:opacity-80 transition"
            >
              <ChipCard />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
