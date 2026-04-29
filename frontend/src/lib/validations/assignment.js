import { z } from "zod";

export const assignExamSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  exam_id: z.string().min(1, "Exam is required"),
});
