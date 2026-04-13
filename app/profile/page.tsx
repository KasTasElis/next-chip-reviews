import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Profile" };
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts guarantees auth before this page is reached
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) notFound();

  return <ProfileForm profile={profile} />;
}
