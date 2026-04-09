import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { ProfileMenu } from "./ProfileMenu";

export const Nav = ({ user }: { user: User | null }) => {
  const signedInMenuJSX = (
    <div className="flex-none">
      <ul className="menu menu-horizontal px-3 gap-1">
        <li>
          <Link href="/brands/new">Add Brand</Link>
        </li>
        <li>
          <Link href="/chips/new">Add Chip</Link>
        </li>
      </ul>
      <ProfileMenu />
    </div>
  );

  const signedOutMenuJsx = (
    <div className="navbar-end">
      <Link href="/auth/sign-in" className="btn btn-sm btn-primary">
        Sign In
      </Link>
    </div>
  );

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          Chip Review
        </Link>
      </div>

      {user ? signedInMenuJSX : signedOutMenuJsx}
    </div>
  );
};
