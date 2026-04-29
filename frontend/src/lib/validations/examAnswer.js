import { z } from "zod";

export const examAnswerSchema = z.object({
  selected_answer: z.enum(["NO", "PARTIAL", "YES"], {
    message: "Select an answer",
  }),
  image: z
    .any()
    .refine((file) => file instanceof File || typeof file === "string", "Image proof is required"),
});
