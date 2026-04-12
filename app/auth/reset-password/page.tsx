import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/app/routes";

export const metadata: Metadata = { title: "Reset Password" };

export default function ResetPassword() {
  return (
    <div className="flex flex-col w-full max-w-sm">
      <h2 className="text-lg mb-3 text-center">Reset Password</h2>

      <form className="flex flex-col gap-3 w-[320px] mx-auto mb-11">
        <div>
          <input type="text" placeholder="email" className="input" />
        </div>

        <button type="submit" className="btn btn-primary mt-3">
          Reset Password
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
