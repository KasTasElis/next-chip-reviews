import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, email, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <ProfileForm
      profile={{
        id: user.id,
        username: profile?.username ?? null,
        email: profile?.email ?? user.email ?? null,
        avatar_url: profile?.avatar_url ?? null,
      }}
    />
  );
}
