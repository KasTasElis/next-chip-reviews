/* eslint-disable react-hooks/purity */
"use client";

import clsx from "clsx";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { profileSchema, type ProfileInputs } from "./schema";
import { updateProfile } from "./actions";
import { supabase } from "@/app/lib/supabase";
import type { Profile } from "@/supabase/types";
import { Timestamps } from "@/app/components/Timestamps";
import PhotoUpload from "@/app/components/PhotoUpload";

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile.username ?? "",
      avatar_url: profile.avatar_url ?? "",
    },
  });

  const onSubmit: SubmitHandler<ProfileInputs> = async ({ username }) => {
    let avatar_url: string | undefined = profile.avatar_url ?? undefined;

    if (avatarFile) {
      const path = `${profile.id}/avatar.webp`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });

      if (uploadError) {
        setError("root", { message: uploadError.message });
        return;
      }

      avatar_url =
        supabase.storage.from("avatars").getPublicUrl(uploadData.path).data
          .publicUrl + `?t=${Date.now()}`;
    }

    const result = await updateProfile({ username, avatar_url });
    if (result?.error) {
      setError("root", { message: result.error });
      return;
    }
    toast.success("Profile updated!");
  };

  return (
    <div className="w-full max-w-lg min-w-80 mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-6">Your Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {errors.root && (
          <div role="alert" className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{errors.root.message}</span>
          </div>
        )}

        <PhotoUpload
          label="Avatar"
          optional
          initialUrl={profile.avatar_url}
          onChange={setAvatarFile}
        />

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Username</legend>
          <input
            {...register("username")}
            type="text"
            placeholder="e.g. chipfan99"
            className={clsx("input w-full", errors.username && "input-error")}
          />
          {errors.username && (
            <p className="text-error text-xs mt-1">{errors.username.message}</p>
          )}
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Email</legend>
          <input
            type="text"
            value={profile.email ?? ""}
            disabled
            className="input w-full opacity-60 cursor-not-allowed"
          />
          <p className="text-base-content/50 text-xs mt-1">
            Email cannot be changed here
          </p>
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className={clsx(
            "btn btn-primary mt-2",
            isSubmitting && "btn-disabled",
          )}
        >
          {isSubmitting ? (
            <span className="loading loading-spinner" />
          ) : (
            "Save Changes"
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Timestamps created_at={profile.created_at} updated_at={profile.updated_at} />
      </div>
    </div>
  );
}
