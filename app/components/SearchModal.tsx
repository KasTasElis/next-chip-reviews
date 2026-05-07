"use client";

import Link from "next/link";
import Image from "next/image";

const ModalContent = () => {
  return (
    <div>
      <label className="input input-lg w-full bg-base-200 border-none shadow-none rounded-box">
        <svg
          className="h-[1em] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
        <input
          type="search"
          required
          placeholder="Search for brand or flavor"
        />
      </label>

      <div className="p-3 bg-base-100 rounded-box my-3 flex items-center gap-3">
        <span className="loading loading-ring loading-sm"></span>
        <span className="opacity-50">
          Searching<span className="skeleton skeleton-text">...</span>
        </span>
      </div>

      <ul className="list bg-base-200 rounded-box my-3">
        <li className="p-3 pb-2 text-xs opacity-60 tracking-wide">
          Potato Chips
        </li>

        {[1, 2, 3].map((k) => (
          <li
            className="list-row hover:bg-base-300 cursor-pointer px-4 py-3"
            key={k}
          >
            <Link href="#" className="flex items-center gap-3">
              <div>
                <Image
                  className="size-10 rounded-box"
                  src="https://img.daisyui.com/images/profile/demo/1@94.webp"
                  alt="Spicy Tomato"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <div>Spicy Tomato</div>
                <div className="text-xs font-semibold opacity-60">Pringles</div>
              </div>
            </Link>
          </li>
        ))}

        <li className="list-row hover:bg-base-300 cursor-pointer p-3">
          <Link href="#" className="flex items-center gap-3">
            <div>
              <div className="font-semibold text-blue-500">
                View All Chip Results
              </div>
              <div className="text-xs font-semibold opacity-30">
                13 total matches
              </div>
            </div>
          </Link>
        </li>

        <li className="list-row p-3">
          <div>
            <div className="font-semibold opacity-30">Nothing found</div>
            <div className="text-xs font-semibold opacity-30">
              0 total matches
            </div>
          </div>
        </li>
      </ul>

      <ul className="list bg-base-200 rounded-box my-3">
        <li className="p-3 pb-2 text-xs opacity-60 tracking-wide">Brands</li>

        {[1, 2, 3].map((k) => (
          <li
            className="list-row hover:bg-base-300 cursor-pointer px-4 py-3"
            key={k}
          >
            <Link href="#" className="flex items-center gap-3">
              <div>
                <Image
                  className="size-10 rounded-box"
                  src="https://img.daisyui.com/images/profile/demo/1@94.webp"
                  alt="Spicy Tomato"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <div className="text-xs font-semibold opacity-60">Pringles</div>
              </div>
            </Link>
          </li>
        ))}

        <li className="list-row hover:bg-base-300 cursor-pointer p-3">
          <Link href="#" className="flex items-center gap-3">
            <div>
              <div className="font-semibold text-blue-500">
                View All Brand Results
              </div>
              <div className="text-xs font-semibold opacity-30">
                7 total matches
              </div>
            </div>
          </Link>
        </li>
      </ul>
    </div>
  );
};

const modalId = "search-modal";

export const SearchModal = () => {
  return (
    <>
      <button
        className="input cursor-pointer"
        onClick={() =>
          (document.getElementById(modalId) as HTMLDialogElement)?.showModal()
        }
      >
        <svg
          className="h-[1em] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
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
