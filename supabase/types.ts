import type { Database as DatabaseGenerated, Tables } from "./generated.types";
import { MergeDeep } from "type-fest";

// generated null types is a known PostgreSQL issue, this is the recommended way to deal with it, taken from Supabase docs.
// https://supabase.com/docs/guides/api/rest/generating-types
export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Views: {
        chips_with_stats: {
          Row: {
            average_rating: number;
            brand_id_fk: number;
            created_at: string;
            description: string | null;
            id: number;
            name: string;
            photo_url: string | null;
            review_count: number;
            slug: string;
            updated_at: string | null;
            user_id_fk: string;
          };
        };
      };
    };
  }
>;

export type Chip = Tables<"chips">;
export type Brand = Tables<"brands">;
export type Review = Tables<"reviews">;
export type Profile = Tables<"profiles">;
