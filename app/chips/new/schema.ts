import { z } from "zod";

// Used by the client form — slug is derived, not user input
export const chipFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  brand_id_fk: z.string().min(1, "Brand is required"),
});

export type ChipFormInputs = z.infer<typeof chipFormSchema>;

const RESERVED_SLUGS = ["new"];

// Used by the server action — includes slug
export const chipSchema = chipFormSchema.extend({
  slug: z.string().min(1).refine((s) => !RESERVED_SLUGS.includes(s), {
    message: "That name is reserved — please choose a different one",
  }),
});

export type ChipInputs = z.infer<typeof chipSchema>;
