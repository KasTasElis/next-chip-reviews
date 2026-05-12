"use client";

import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { useEffect, useState, useTransition } from "react";
import { fetchChips } from "@/app/chips/actions";
import { fetchBrands } from "@/app/brands/actions";
import type { ChipsWithStats, Brand } from "@/supabase/types";
import { routes } from "@/app/routes";
import { Search } from "lucide-react";

const PREVIEW_LIMIT = 3;
const modalId = "search-modal";

const closeModal = () =>
  (document.getElementById(modalId) as HTMLDialogElement)?.close();

const SearchIcon = () => <Search className="h-[1em] opacity-50" />;

const ModalContent = () => {
  const [query, setQuery] = useState("");
  const [chips, setChips] = useState<ChipsWithStats[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (query.length < 3) return;
    const timeout = setTimeout(() => {
      startTransition(async () => {
        const [chipResults, brandResults] = await Promise.all([
          fetchChips({ search: query, limit: PREVIEW_LIMIT }),
          fetchBrands({ search: query, limit: PREVIEW_LIMIT }),
        ]);
        setChips(chipResults);
        setBrands(brandResults);
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const chipsAllUrl = `${routes.chips}?search=${encodeURIComponent(query)}` as Route;
  const brandsAllUrl = `${routes.brands}?search=${encodeURIComponent(query)}` as Route;

  const hasQuery = query.length >= 3;
  const hasChips = chips.length > 0;
  const hasBrands = brands.length > 0;

  return (
    <div>
      <label className="input input-lg w-full bg-base-200 border-none shadow-none rounded-box">
        <SearchIcon />
        <input
          type="search"
          required
          placeholder="Search for brand or flavor"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </label>

      {hasQuery && (
        <>
          <ul className="list bg-base-200 rounded-box my-3">
            <li className="p-3 pb-2 text-xs opacity-60 tracking-wide">
              Potato Chips
            </li>

            {isPending ? (
              [0, 1, 2].map((k) => (
                <li key={k} className="list-row px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="skeleton size-10 rounded-box shrink-0" />
                    <div className="flex flex-col gap-1">
                      <div className="skeleton h-4 w-32" />
                      <div className="skeleton h-3 w-20" />
                    </div>
                  </div>
                </li>
              ))
            ) : hasChips ? (
              <>
                {chips.map((chip) => (
                  <li
                    key={chip.id}
                    className="list-row hover:bg-base-300 cursor-pointer px-4 py-3"
                  >
                    <Link
                      href={`/chips/${chip.slug}`}
                      className="flex items-center gap-3"
                      onClick={closeModal}
                    >
                      <Image
                        className="size-10 rounded-box object-cover"
                        src={chip.photo_url}
                        alt={chip.name}
                        width={40}
                        height={40}
                      />
                      <div>
                        <div>{chip.name}</div>
                        <div className="text-xs font-semibold opacity-60">
                          {chip.review_count} review{chip.review_count !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
                <li className="list-row hover:bg-base-300 cursor-pointer p-3">
                  <Link
                    href={chipsAllUrl}
                    className="flex items-center gap-3"
                    onClick={closeModal}
                  >
                    <div>
                      <div className="font-semibold text-blue-500">
                        View All Chip Results
                      </div>
                      <div className="text-xs font-semibold opacity-30">
                        {chips.length === PREVIEW_LIMIT ? `${PREVIEW_LIMIT}+ matches` : `${chips.length} match${chips.length !== 1 ? "es" : ""}`}
                      </div>
                    </div>
                  </Link>
                </li>
              </>
            ) : (
              <li className="list-row p-3">
                <div>
                  <div className="font-semibold opacity-30">Nothing found</div>
                  <div className="text-xs font-semibold opacity-30">
                    0 total matches
                  </div>
                </div>
              </li>
            )}
          </ul>

          <ul className="list bg-base-200 rounded-box my-3">
            <li className="p-3 pb-2 text-xs opacity-60 tracking-wide">
              Brands
            </li>

            {isPending ? (
              [0, 1, 2].map((k) => (
                <li key={k} className="list-row px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="skeleton size-10 rounded-box shrink-0" />
                    <div className="flex flex-col gap-1">
                      <div className="skeleton h-4 w-32" />
                    </div>
                  </div>
                </li>
              ))
            ) : hasBrands ? (
              <>
                {brands.map((brand) => (
                  <li
                    key={brand.id}
                    className="list-row hover:bg-base-300 cursor-pointer px-4 py-3"
                  >
                    <Link
                      href={`/brands/${brand.slug}`}
                      className="flex items-center gap-3"
                      onClick={closeModal}
                    >
                      {brand.logo_url && (
                        <Image
                          className="size-10 rounded-box object-cover"
                          src={brand.logo_url}
                          alt={brand.name}
                          width={40}
                          height={40}
                        />
                      )}
                      <div>
                        <div className="font-semibold">{brand.name}</div>
                      </div>
                    </Link>
                  </li>
                ))}
                <li className="list-row hover:bg-base-300 cursor-pointer p-3">
                  <Link
                    href={brandsAllUrl}
                    className="flex items-center gap-3"
                    onClick={closeModal}
                  >
                    <div>
                      <div className="font-semibold text-blue-500">
                        View All Brand Results
                      </div>
                      <div className="text-xs font-semibold opacity-30">
                        {brands.length === PREVIEW_LIMIT ? `${PREVIEW_LIMIT}+ matches` : `${brands.length} match${brands.length !== 1 ? "es" : ""}`}
                      </div>
                    </div>
                  </Link>
                </li>
              </>
            ) : (
              <li className="list-row p-3">
                <div>
                  <div className="font-semibold opacity-30">Nothing found</div>
                  <div className="text-xs font-semibold opacity-30">
                    0 total matches
                  </div>
                </div>
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export const SearchModal = () => {
  return (
    <>
      <button
        className="input cursor-pointer"
        onClick={() =>
          (document.getElementById(modalId) as HTMLDialogElement)?.showModal()
        }
      >
        <SearchIcon />
        <span className="opacity-50">Search for brand or flavor...</span>
      </button>

      <dialog id={modalId} className="modal">
        <div className="modal-box">
          <ModalContent />
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};
