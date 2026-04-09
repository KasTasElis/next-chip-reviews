import { z } from "zod";

export const profileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  avatar_url: z.string().optional(),
});

export type ProfileInputs = z.infer<typeof profileSchema>;
