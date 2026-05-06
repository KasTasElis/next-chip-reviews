import { z } from "zod";

export const brandFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type BrandFormInputs = z.infer<typeof brandFormSchema>;

export const submitBrandSchema = brandFormSchema.extend({
  logo: z
    .instanceof(File, { message: "Logo is required" })
    .refine((f) => f.size > 0, "Logo is required")
    .refine(
      (f) => ["image/png", "image/jpeg", "image/webp"].includes(f.type),
      "Logo must be a PNG, JPG, or WebP image",
    ),
});
