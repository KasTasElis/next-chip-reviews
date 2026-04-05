"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button onClick={handleSignOut} className="btn btn-sm btn-outline btn-error">
      Sign Out
    </button>
  );
}
