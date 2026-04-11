import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/env";
import { Database } from "@/supabase/types";

export const supabase = createBrowserClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
