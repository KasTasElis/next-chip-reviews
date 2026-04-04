import Link from "next/link";

export default function ResetPassword() {
  return (
    <div className="container mx-auto flex flex-col">
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
          href="/auth/sign-in"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
