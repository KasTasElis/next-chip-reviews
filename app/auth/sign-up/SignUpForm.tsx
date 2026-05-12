"use client";

import Link from "next/link";
import clsx from "clsx";
import { XCircle } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/app/lib/supabase";
import { routes } from "@/app/routes";
import { toast } from "sonner";
import { redirect } from "next/navigation";

const signUpSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

type Inputs = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({ resolver: zodResolver(signUpSchema) });

  const signUp: SubmitHandler<Inputs> = async ({ email, password }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: email,
        },
      },
    });

    if (error) {
      setError("root", { message: error.message });
      return;
    }

    reset();
    toast.success("Sign up success! You may sign in. ☺️");
    redirect(routes.signIn);
  };

  return (
    <div className="flex flex-col w-full max-w-sm">
      <h2 className="text-lg mb-3 text-center font-bold">Sign Up</h2>

      <form
        onSubmit={handleSubmit(signUp)}
        className="flex flex-col gap-3 w-[320px] mx-auto mb-11"
      >
        {errors.root && (
          <div role="alert" className="alert alert-error">
            <XCircle className="h-6 w-6 shrink-0" />
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
            "🚀 Sign Up"
          )}
        </button>
      </form>

      <div className="text-center flex flex-col gap-5">
        <Link
          className="text-sm hover:opacity-80 underline"
          href={routes.signIn}
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
