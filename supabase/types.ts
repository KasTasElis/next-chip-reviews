import type {
  Database as DatabaseGenerated,
  Tables,
  TablesInsert,
} from "./generated.types";
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
            brand_id: string;
            created_at: string;
            description: string | null;
            id: string;
            name: string;
            photo_url: string;
            review_count: number;
            slug: string;
            updated_at: string | null;
            user_id: string;
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
export type ChipsWithStats =
  Database["public"]["Views"]["chips_with_stats"]["Row"];

export type BrandInsert = TablesInsert<"brands">;
export type ChipInsert = TablesInsert<"chips">;
export type ReviewInsert = TablesInsert<"reviews">;
export type ProfileInsert = TablesInsert<"profiles">;
export type SimilarBrand =
  Database["public"]["Functions"]["find_similar_brands"]["Returns"][number];
export type SimilarChip =
  Database["public"]["Functions"]["find_similar_chips"]["Returns"][number];
