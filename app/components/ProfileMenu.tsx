"use client";

import Link from "next/link";
import Image from "next/image";
import { SignOutButton } from "./SignOutButton";
import { routes } from "@/app/routes";

export const ProfileMenu = ({ avatarUrl }: { avatarUrl: string | null }) => (
  <div className="dropdown dropdown-end">
    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
      <div className="w-10 rounded-full relative">
        <Image
          src={
            avatarUrl ??
            "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
          }
          alt="user profile photo"
          className="object-cover"
          fill
          sizes="40px"
        />
      </div>
    </div>
    <ul
      tabIndex={-1}
      onClick={() => (document.activeElement as HTMLElement)?.blur()}
      className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow gap-3"
    >
      <li>
        <Link className="btn btn-sm btn-outline btn-primary" href={routes.profile}>
          My Profile
        </Link>
      </li>
      <li>
        <SignOutButton />
      </li>
    </ul>
  </div>
);
