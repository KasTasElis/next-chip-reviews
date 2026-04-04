import Link from "next/link";

export default function SignIn() {
  return (
    <div className="container mx-auto flex flex-col">
      <h2 className="text-lg mb-3 text-center">Sign In</h2>

      <form className="flex flex-col gap-3 w-[320px] mx-auto mb-11">
        <div>
          <input type="text" placeholder="email" className="input" />
        </div>
        <div>
          <input type="password" placeholder="password" className="input" />
        </div>

        <button type="submit" className="btn btn-primary mt-3">
          Sign In
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
