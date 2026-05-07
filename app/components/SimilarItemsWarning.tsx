"use client";

import pDebounce from "p-debounce";
import { useState, useEffect, useMemo } from "react";
import type { Route } from "next";
import Link from "next/link";
import Image from "next/image";

export type SimilarItem = { name: string; imageUrl: string; slug: string };

type Props = {
  slug: string;
  fetchFn: (name: string) => Promise<SimilarItem[]>;
  message: string;
  // TODO: this is not ideal type safety, come back to this later.
  hrefFn: (slug: string) => Route;
};

export default function SimilarItemsWarning({
  slug,
  fetchFn,
  message,
  hrefFn,
}: Props) {
  const [suggestions, setSuggestions] = useState<SimilarItem[]>([]);

  const debouncedFetch = useMemo(() => pDebounce(fetchFn, 1500), [fetchFn]);

  useEffect(() => {
    debouncedFetch(slug).then((data) => {
      setSuggestions(data);
    });
  }, [slug, debouncedFetch]);

  const displayedSuggestions = slug && slug.length >= 2 ? suggestions : [];

  if (displayedSuggestions.length === 0) return null;

  return (
    <>
      <div className="divider" />
      <div>
        <p className="mb-3 text-sm text-base-content/70">{message}</p>
        <div className="grid grid-cols-2 gap-3">
          {displayedSuggestions.map((item, i) => (
            <Link
              key={i}
              className="flex gap-3 outline outline-1 outline-base-content/20 rounded p-3 hover:outline-base-content/50 cursor-pointer"
              href={hrefFn(item.slug)}
              target="_blank"
            >
              <div className="h-14 w-14 rounded-xl relative">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover rounded-xl"
                  fill
                  sizes="56px"
                />
              </div>
              <p className="text-xs text-base-content/50">{item.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
