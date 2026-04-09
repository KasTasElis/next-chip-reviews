"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto my-10 text-center">
      <h2 className="text-lg font-bold mb-3">
        Something went wrong, try again later.
      </h2>
      <Link href="/" className="underline hover:opacity-80">
        Go home
      </Link>
    </div>
  );
}
