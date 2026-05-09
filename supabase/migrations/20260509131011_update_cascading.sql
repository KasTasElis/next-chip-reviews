alter table "public"."profiles" drop constraint "profiles_id_fkey";

alter table "public"."reviews" drop constraint "reviews_user_id_fkey";

alter table "public"."brands" alter column "user_id" set not null;

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."reviews" add constraint "reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_user_id_fkey";


