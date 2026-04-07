import { z } from "zod";

// Used by the client form — slug is derived, not user input
export const brandFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type BrandFormInputs = z.infer<typeof brandFormSchema>;

const RESERVED_SLUGS = ["new"];

// Used by the server action — includes slug
export const brandSchema = brandFormSchema.extend({
  slug: z.string().min(1).refine((s) => !RESERVED_SLUGS.includes(s), {
    message: "That name is reserved — please choose a different one",
  }),
});

export type BrandInputs = z.infer<typeof brandSchema>;
