"use server";

import { tasks } from "@/lib/db/schemas/schema";
import { TaskFormInput, taskFormSchema } from "@/lib/db/schemas/task-schema";
import { db } from "@/lib/db/server";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Add a new task directly from the dialog component
 */
export async function addTask(formData: TaskFormInput) {
  console.log("Adding task:", formData);

  // Validate the input data using the schema
  const validationResult = taskFormSchema.safeParse(formData);

  if (!validationResult.success) {
    console.error("Validation failed:", validationResult.error);
    return {
      success: false,
      error: "Invalid form data",
      issues: validationResult.error.issues,
    };
  }

  const data = validationResult.data;

  try {
    // Get the highest order number in the column
    const highestOrderTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.columnId, data.columnId))
      .orderBy(desc(tasks.order))
      .limit(1);

    const newOrder = highestOrderTask.length
      ? highestOrderTask[0].order + 1
      : 1;

    console.log("Creating task with order:", newOrder);

    // Insert the new task
    const newTask = await db
      .insert(tasks)
      .values({
        title: data.title,
        description: data.description || null,
        status: data.status,
        columnId: data.columnId,
        assigneeId: data.assigneeId || null,
        order: newOrder,
      })
      .returning();

    console.log("Task created:", newTask[0]);

    // Revalidate the page to show the new task - use "layout" to force a complete refresh
    revalidatePath("/", "layout");

    return {
      success: true,
      task: newTask[0],
    };
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      success: false,
      error:
        "Failed to create task: " +
        (error instanceof Error ? error.message : String(error)),
    };
  }
}

/**
 * Update an existing task directly from the dialog component
 */
export async function updateTask(taskId: number, formData: TaskFormInput) {
  console.log("Updating task:", taskId, formData);

  // Validate the input data using the schema
  const validationResult = taskFormSchema.safeParse(formData);

  if (!validationResult.success) {
    console.error("Validation failed:", validationResult.error);
    return {
      success: false,
      error: "Invalid form data",
      issues: validationResult.error.issues,
    };
  }

  const data = validationResult.data;

  try {
    // Update the task
    const updatedTask = await db
      .update(tasks)
      .set({
        title: data.title,
        description: data.description || null,
        status: data.status,
        columnId: data.columnId,
        assigneeId: data.assigneeId || null,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask.length) {
      return {
        success: false,
        error: "Task not found",
      };
    }

    console.log("Task updated:", updatedTask[0]);

    // Revalidate the page to show the updated task - use "layout" to force a complete refresh
    revalidatePath("/", "layout");

    return {
      success: true,
      task: updatedTask[0],
    };
  } catch (error) {
    console.error("Error updating task:", error);
    return {
      success: false,
      error:
        "Failed to update task: " +
        (error instanceof Error ? error.message : String(error)),
    };
  }
}
