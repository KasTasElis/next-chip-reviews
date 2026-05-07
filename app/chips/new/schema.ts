import { z } from "zod";

// Used by the client form — slug is derived, not user input
export const chipFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  brand_id: z.string("Brand is required").min(1, "Brand name required"),
});

export type ChipFormInputs = z.infer<typeof chipFormSchema>;

const RESERVED_SLUGS = ["new"];

// Used by the server action — includes slug and photo file
export const submitChipSchema = chipFormSchema.extend({
  slug: z
    .string()
    .min(1)
    .refine((s) => !RESERVED_SLUGS.includes(s), {
      message: "That name is reserved — please choose a different one",
    }),
  photo: z
    .instanceof(File, { message: "Photo is required" })
    .refine((f) => f.size > 0, "Photo is required")
    .refine(
      (f) => ["image/png", "image/jpeg", "image/webp"].includes(f.type),
      "Photo must be a PNG, JPG, or WebP image",
    ),
});

export type SubmitChipInputs = z.infer<typeof submitChipSchema>;
