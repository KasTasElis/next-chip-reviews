import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import ChipForm from "./chip-form";

export default async function AddChipPage() {
  const supabase = await createSupabaseServerClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("id, name")
    .order("name");

  return <ChipForm brands={brands ?? []} />;
}
