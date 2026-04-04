import { BrandCard } from "./components/BrandCard";
import { ChipCard } from "./components/ChipCard";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="container mx-auto my-5 mb-7">
        <div className="flex justify-between mb-3">
          <h2 className="text-lg font-bold">⭐️ All Time Favorites</h2>
          <button className="underline">See All</button>
        </div>

        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((i, k) => (
            <Link
              href="/chips/123"
              key={k}
              className="flex-1 hover:opacity-80 transition"
            >
              <ChipCard />
            </Link>
          ))}
        </div>
      </div>

      <div className="container mx-auto my-5 mb-7">
        <div className="flex justify-between mb-3">
          <h2 className="text-lg font-bold">⭐️ Top Rated 10</h2>
          <button className="underline">See All</button>
        </div>

        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 9 }).map((i, k) => (
            <Link
              href="/chips/123"
              key={k}
              className="flex-1 hover:opacity-80 transition"
            >
              <ChipCard />
            </Link>
          ))}
        </div>
      </div>

      <div className="container mx-auto my-5">
        <div className="flex justify-between mb-3">
          <h2 className="text-lg font-bold">Brands</h2>
          <button className="underline">See All</button>
        </div>

        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 10 }).map((i, k) => (
            <Link
              href="/brands/lays"
              key={k}
              className="flex-1 hover:opacity-80 transition min-w-[180px]"
            >
              <BrandCard />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
