"use client";

import { useEffect, useRef } from "react";
import { FieldErrors } from "react-hook-form";

export function useScrollToError(errors: FieldErrors, submitCount: number) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (submitCount === 0 || !formRef.current) return;
    const el = formRef.current.querySelector<HTMLElement>(
      '[role="alert"], .text-error',
    );
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [submitCount]);

  useEffect(() => {
    if (!errors.root || !formRef.current) return;
    const el = formRef.current.querySelector<HTMLElement>('[role="alert"]');
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [errors.root]);

  return formRef;
}
