"use client";

import clsx from "clsx";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { profileSchema, type ProfileInputs } from "./schema";
import { updateProfile } from "./actions";
import { supabase } from "@/app/lib/supabase";

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/svg+xml": "svg",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mimeType] ?? "jpg";
}

type Profile = {
  id: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
};

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profile.avatar_url ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== profile.avatar_url) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, profile.avatar_url]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl && previewUrl !== profile.avatar_url) {
      URL.revokeObjectURL(previewUrl);
    }
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

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
      const ext = getExtension(avatarFile.type);
      const path = `${profile.id}/avatar.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });

      if (uploadError) {
        setError("root", { message: uploadError.message });
        return;
      }

      // Append a timestamp to bust CDN/browser cache after each upload (file path stays the same via upsert)
      avatar_url = supabase.storage
        .from("avatars")
        // eslint-disable-next-line react-hooks/purity
        .getPublicUrl(uploadData.path).data.publicUrl + `?t=${Date.now()}`;

      console.log({ avatar_url, uploadError, uploadData });
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

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Avatar</legend>
          <label
            className={clsx(
              "flex flex-col items-center justify-center w-full border-2 border-dashed rounded-box cursor-pointer hover:border-primary hover:bg-base-200 transition-colors overflow-hidden",
              previewUrl ? "h-auto p-2" : "h-40 border-base-300",
            )}
          >
            {previewUrl ? (
              <div className="relative flex flex-col items-center gap-2 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="max-h-48 max-w-full object-contain rounded-full"
                />
                <span className="text-xs text-base-content/50">
                  Click to change
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-base-content/50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <span className="text-sm">
                  Drop photo here or{" "}
                  <span className="text-primary">browse</span>
                </span>
                <span className="text-xs">PNG, JPG, WebP up to 5MB</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </fieldset>

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
    </div>
  );
}
