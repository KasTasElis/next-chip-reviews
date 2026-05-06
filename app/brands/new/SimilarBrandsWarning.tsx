"use client";

import pDebounce from "p-debounce";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { routes } from "@/app/routes";
import { SimilarBrand } from "@/supabase/types";
import { findSimilarBrands as findSimilarBrandsAction } from "./actions";

const findSimilarBrands = pDebounce(findSimilarBrandsAction, 1500);

export default function SimilarBrandsWarning({ name }: { name: string }) {
  const [suggestions, setSuggestions] = useState<SimilarBrand[]>([]);

  useEffect(() => {
    if (!name || name.length < 2) {
      return;
    }

    findSimilarBrands(name).then((data) => {
      setSuggestions(data);
    });
  }, [name]);

  const displayedSuggestions = name && name.length >= 2 ? suggestions : [];

  if (displayedSuggestions.length === 0) return null;

  return (
    <>
      <div className="divider" />
      <div>
        <p className="mb-3 text-sm text-base-content/70">
          ℹ️ We found similar existing brands. Please double check if you are
          not creating a duplicate.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {displayedSuggestions.map((brand, i) => (
            <Link
              key={i}
              className="flex gap-3 outline outline-1 outline-base-content/20 rounded p-3 hover:outline-base-content/50 cursor-pointer"
              href={`${routes.brands}/${brand.slug}`}
              target="_blank"
            >
              <div className="h-14 w-14 rounded-xl relative">
                <Image
                  src={brand.logo_url}
                  alt={brand.name}
                  className="h-full w-full object-cover rounded-xl"
                  fill
                  sizes="56px"
                />
              </div>
              <p className="text-xs text-base-content/50">{brand.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
