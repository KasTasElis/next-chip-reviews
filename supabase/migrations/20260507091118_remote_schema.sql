


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."find_similar_brands"("query" "text", "threshold" double precision DEFAULT 0.3) RETURNS TABLE("id" "uuid", "name" "text", "slug" "text", "logo_url" "text", "score" double precision)
    LANGUAGE "sql" STABLE
    AS $$
  SELECT
    b.id,
    b.name,
    b.slug,
    b.logo_url,
    GREATEST(
      similarity(b.slug, query),
      CASE
        WHEN b.slug ILIKE query || '%' THEN 0.99
        ELSE 0
      END
    ) AS score
  FROM public.brands AS b
  WHERE
    similarity(b.slug, query) > threshold
    OR b.slug ILIKE query || '%'
  ORDER BY score DESC
  LIMIT 6;
$$;


ALTER FUNCTION "public"."find_similar_brands"("query" "text", "threshold" double precision) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."find_similar_chips"("chip_slug" "text", "brand_id" "uuid", "threshold" double precision DEFAULT 0.4) RETURNS TABLE("id" "uuid", "name" "text", "slug" "text", "photo_url" "text", "score" double precision)
    LANGUAGE "sql" STABLE
    AS $$
  SELECT
    c.id,
    c.name,
    c.slug,
    c.photo_url,
    similarity(c.slug, find_similar_chips.chip_slug) AS score
  FROM public.chips c
  WHERE c.brand_id = find_similar_chips.brand_id
    AND similarity(c.slug, find_similar_chips.chip_slug) > threshold
  ORDER BY score DESC, c.created_at DESC
  LIMIT 5;
$$;


ALTER FUNCTION "public"."find_similar_chips"("chip_slug" "text", "brand_id" "uuid", "threshold" double precision) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  insert into public.profiles (id, email, username, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."brands" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "name" "text" NOT NULL,
    "description" "text",
    "logo_url" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."brands" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chips" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "name" "text" NOT NULL,
    "description" "text",
    "photo_url" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."chips" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."chips_with_stats" AS
SELECT
    NULL::timestamp with time zone AS "created_at",
    NULL::timestamp with time zone AS "updated_at",
    NULL::"text" AS "name",
    NULL::"text" AS "description",
    NULL::"text" AS "photo_url",
    NULL::"text" AS "slug",
    NULL::"uuid" AS "id",
    NULL::"uuid" AS "brand_id",
    NULL::"uuid" AS "user_id",
    NULL::bigint AS "review_count",
    NULL::numeric AS "average_rating";


ALTER VIEW "public"."chips_with_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "updated_at" timestamp with time zone,
    "username" "text" NOT NULL,
    "email" "text" NOT NULL,
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "review" "text" NOT NULL,
    "photo_url" "text",
    "rating" smallint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chip_id" "uuid" NOT NULL
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."chips"
    ADD CONSTRAINT "chips_brand_slug_unique" UNIQUE ("brand_id", "slug");



ALTER TABLE ONLY "public"."chips"
    ADD CONSTRAINT "chips_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_chip_user_unique" UNIQUE ("chip_id", "user_id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE VIEW "public"."chips_with_stats" AS
 SELECT "c"."created_at",
    "c"."updated_at",
    "c"."name",
    "c"."description",
    "c"."photo_url",
    "c"."slug",
    "c"."id",
    "c"."brand_id",
    "c"."user_id",
    "count"("r"."id") AS "review_count",
    "round"("avg"("r"."rating"), 1) AS "average_rating"
   FROM ("public"."chips" "c"
     LEFT JOIN "public"."reviews" "r" ON (("r"."chip_id" = "c"."id")))
  GROUP BY "c"."id";



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chips"
    ADD CONSTRAINT "chips_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chips"
    ADD CONSTRAINT "chips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_chip_id_fkey" FOREIGN KEY ("chip_id") REFERENCES "public"."chips"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



CREATE POLICY "Enable delete for users based on user_id" ON "public"."reviews" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."brands" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."chips" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."reviews" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."brands" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."chips" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."brands" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "can update own review" ON "public"."reviews" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."chips" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



















































































































































































































































GRANT ALL ON FUNCTION "public"."find_similar_brands"("query" "text", "threshold" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."find_similar_brands"("query" "text", "threshold" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_similar_brands"("query" "text", "threshold" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."find_similar_chips"("chip_slug" "text", "brand_id" "uuid", "threshold" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."find_similar_chips"("chip_slug" "text", "brand_id" "uuid", "threshold" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_similar_chips"("chip_slug" "text", "brand_id" "uuid", "threshold" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."brands" TO "anon";
GRANT ALL ON TABLE "public"."brands" TO "authenticated";
GRANT ALL ON TABLE "public"."brands" TO "service_role";



GRANT ALL ON TABLE "public"."chips" TO "anon";
GRANT ALL ON TABLE "public"."chips" TO "authenticated";
GRANT ALL ON TABLE "public"."chips" TO "service_role";



GRANT ALL ON TABLE "public"."chips_with_stats" TO "anon";
GRANT ALL ON TABLE "public"."chips_with_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."chips_with_stats" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Anyone can view 15kep2a_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'brand-logos'::text));



  create policy "Anyone can view and3c2_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'chip-photos'::text));



  create policy "Authenticated users can upload 15kep2a_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'brand-logos'::text));



  create policy "Authenticated users can upload and3c2_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'chip-photos'::text));



  create policy "anyone can view 1tsy3yu_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'review-photos'::text));



  create policy "authenticated users can delete 15kep2a_0"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'brand-logos'::text));



  create policy "authenticated users can delete and3c2_1"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'chip-photos'::text));



  create policy "only signed in users can add  1tsy3yu_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'review-photos'::text));



  create policy "ownership 1oj01fe_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "ownership 1oj01fe_1"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "ownership 1oj01fe_2"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "ownership 1oj01fe_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



