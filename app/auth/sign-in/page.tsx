import type { Metadata } from "next";
import SignInForm from "./SignInForm";

export const metadata: Metadata = { title: "Sign In" };

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <SignInForm searchParams={searchParams} />;
}
