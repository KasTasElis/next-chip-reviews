import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";

export const metadata: Metadata = { title: "Add a Chip" };
import ChipForm from "./ChipForm";

export default async function AddChipPage() {
  const supabase = await createSupabaseServerClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  return <ChipForm brands={brands ?? []} />;
}
