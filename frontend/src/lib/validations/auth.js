import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Use a valid email"),
});
