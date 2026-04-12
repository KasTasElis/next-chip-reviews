import type { Route } from "next";

export const routes = {
  home: "/",
  brands: "/brands",
  brandsNew: "/brands/new",
  chips: "/chips",
  chipsNew: "/chips/new",
  profile: "/profile",
  signIn: "/auth/sign-in",
  signUp: "/auth/sign-up",
  resetPassword: "/auth/reset-password",
} satisfies Record<string, Route>;

export const protectedPaths: Route[] = [
  routes.brandsNew,
  routes.chipsNew,
  routes.profile,
];
