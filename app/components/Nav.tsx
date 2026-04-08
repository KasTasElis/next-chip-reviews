import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { SignOutButton } from "./SignOutButton";

export const Nav = ({ user }: { user: User | null }) => {
  return (
    <div className="bg-base-200 shadow-sm w-full rounded-md">
      <input id="navbar-1-toggle" className="peer hidden" type="checkbox" />
      <label
        htmlFor="navbar-1-toggle"
        className="fixed inset-0 hidden max-lg:peer-checked:block"
      ></label>

      <div className="navbar">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost text-xl">
            🥔 Chipper
          </Link>
        </div>
        <div className="navbar-center flex">
          <input
            type="text"
            placeholder="🤤 Looking for something?"
            className="input input-bordered w-64"
          />
        </div>
        <div className="navbar-end">
          <ul className="menu menu-horizontal px-1 gap-3">
            {user ? (
              <>
                <li>
                  <Link
                    href="/brands/new"
                    className="btn btn-sm btn-outline btn-error"
                  >
                    Add Brand
                  </Link>
                </li>
                <li>
                  <Link
                    href="/chips/new"
                    className="btn btn-sm btn-outline btn-error"
                  >
                    Add Chips
                  </Link>
                </li>
                <li>
                  <button className="btn btn-sm btn-ghost btn-primary">
                    🙋‍♂️ {user.email}
                  </button>
                </li>
                <li>
                  <SignOutButton />
                </li>
              </>
            ) : (
              <li>
                <Link
                  className="btn btn-sm btn-outline btn-primary"
                  href="/auth/sign-in"
                >
                  Sign In
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
