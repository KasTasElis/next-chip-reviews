import Link from "next/link";
import { ProfileMenu } from "./ProfileMenu";
import { createSupabaseServerClient } from "../lib/supabase-server";
import { routes } from "@/app/routes";

export const Nav = async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const avatarUrl = user
    ? ((
        await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single()
      ).data?.avatar_url ?? null)
    : null;
  const signedInMenuJSX = (
    <div className="flex-none">
      <ul className="menu menu-horizontal px-3 gap-1">
        <li>
          <Link href={routes.brandsNew}>Add Brand</Link>
        </li>
        <li>
          <Link href={routes.chipsNew}>Add Chip</Link>
        </li>
      </ul>
      <ProfileMenu avatarUrl={avatarUrl} />
    </div>
  );

  const signedOutMenuJsx = (
    <div className="navbar-end">
      <Link href={routes.signIn} className="btn btn-sm btn-primary">
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
