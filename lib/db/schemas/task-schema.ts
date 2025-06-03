import { z } from "zod";

// Define the available task statuses
export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  DONE: "done",
} as const;

// Create a type from the object values
export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

// Define the schema for task form validation
export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.string().default(TASK_STATUS.TODO),
  columnId: z.number(),
  assigneeId: z.string().optional(),
});

// Type for the form input derived from the schema
export type TaskFormInput = z.infer<typeof taskFormSchema>;
