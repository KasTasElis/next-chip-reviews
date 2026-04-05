"use client";

import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";

type Inputs = {
  email: string;
  password: string;
};

export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  return (
    <div className="flex flex-col w-full max-w-sm">
      <h2 className="text-lg mb-3 text-center">Sign Up</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3 w-[320px] mx-auto mb-11"
      >
        <div>
          <input
            {...register("email", { required: true })}
            type="email"
            placeholder="email"
            className="input"
          />
        </div>
        <div>
          <input
            {...register("password", { required: true })}
            type="password"
            placeholder="password"
            className="input"
          />
        </div>

        <button type="submit" className="btn btn-primary mt-3">
          Sign Up
        </button>
      </form>

      <div className="text-center flex flex-col gap-5">
        <Link
          className="text-sm hover:opacity-80 underline"
          href="/auth/sign-in"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
