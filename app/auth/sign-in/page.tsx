"use client";

import type { Route } from "next";
import Link from "next/link";
import clsx from "clsx";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/app/lib/supabase";
import { toast } from "sonner";
import { use } from "react";
import { useRouter } from "next/navigation";

const signInSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type Inputs = z.infer<typeof signInSchema>;

export default function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const router = useRouter();
  const { next } = use(searchParams);
  const nextPath = typeof next === "string" ? next : undefined;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({ resolver: zodResolver(signInSchema) });

  const signIn: SubmitHandler<Inputs> = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("root", { message: error.message });
      return;
    }

    toast.success("Signed in!");
    router.push((nextPath ?? "/") as unknown as Route<string>);
    router.refresh();
  };

  return (
    <div className="flex flex-col w-full max-w-sm">
      <h2 className="text-lg mb-3 text-center font-bold">Sign In</h2>

      <form
        onSubmit={handleSubmit(signIn)}
        className="flex flex-col gap-3 w-[320px] mx-auto mb-11"
      >
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

        <div>
          <input
            {...register("email")}
            type="email"
            placeholder="email"
            className={clsx("input", errors.email && "input-error")}
            autoFocus
          />
          {errors.email && (
            <p className="text-error text-xs mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <input
            {...register("password")}
            type="password"
            placeholder="password"
            className={clsx("input", errors.password && "input-error")}
          />
          {errors.password && (
            <p className="text-error text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          disabled={isSubmitting}
          type="submit"
          className={clsx(
            "btn btn-primary mt-3",
            isSubmitting && "btn-disabled",
          )}
        >
          {isSubmitting ? (
            <span className="loading loading-spinner" />
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="text-center flex flex-col gap-5">
        <Link
          className="text-sm hover:opacity-80 underline"
          href="/auth/reset-password"
        >
          Forgot Password?
        </Link>

        <Link
          className="text-sm hover:opacity-80 underline"
          href="/auth/sign-up"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
