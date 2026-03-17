import { z } from "zod";

// Schema untuk Insert Task
export const InsertTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  organizationId: z.string().min(1, "OrganizationId is required"),
  status: z.enum(["open","in_progress","done"]).optional()
});

// Schema untuk Update Task
export const UpdateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["open","in_progress","done"]).optional(),
  updatedAt: z.string().optional()
});