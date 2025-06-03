"use server";

import { tasks } from "@/lib/db/schemas/schema";
import { db } from "@/lib/db/server";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type TaskFormData = {
  title: string;
  description?: string;
  columnId: number;
  assigneeId?: string;
};

export async function getTasks() {
  try {
    const allTasks = await db.query.tasks.findMany({
      with: {
        column: true,
      },
      orderBy: (tasks, { asc }) => [asc(tasks.columnId), asc(tasks.order)],
    });

    return { tasks: allTasks };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { error: "Failed to fetch tasks" };
  }
}

export async function getTask(id: number) {
  try {
    const task = await db.query.tasks.findFirst({
      where: (tasks, { eq }) => eq(tasks.id, id),
      with: {
        column: true,
      },
    });

    if (!task) {
      return { error: "Task not found" };
    }

    return { task };
  } catch (error) {
    console.error("Error fetching task:", error);
    return { error: "Failed to fetch task" };
  }
}

export async function createTask(data: TaskFormData) {
  try {
    // Get the highest order number in the column
    const highestOrderTask = await db.query.tasks.findFirst({
      where: (tasks, { eq }) => eq(tasks.columnId, data.columnId),
      orderBy: (tasks, { desc }) => [desc(tasks.order)],
    });

    const newOrder = highestOrderTask ? highestOrderTask.order + 1 : 1;

    const newTask = await db
      .insert(tasks)
      .values({
        title: data.title,
        description: data.description || null,
        columnId: data.columnId,
        assigneeId: data.assigneeId || null,
        order: newOrder,
      })
      .returning();

    revalidatePath("/");
    return { task: newTask[0] };
  } catch (error) {
    console.error("Error creating task:", error);
    return { error: "Failed to create task" };
  }
}

export async function updateTask(id: number, data: Partial<TaskFormData>) {
  try {
    const updatedTask = await db
      .update(tasks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    if (!updatedTask.length) {
      return { error: "Task not found" };
    }

    revalidatePath("/");
    return { task: updatedTask[0] };
  } catch (error) {
    console.error("Error updating task:", error);
    return { error: "Failed to update task" };
  }
}

export async function deleteTask(id: number) {
  try {
    const deletedTask = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();

    if (!deletedTask.length) {
      return { error: "Task not found" };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { error: "Failed to delete task" };
  }
}

export async function moveTask(id: number, columnId: number, newOrder: number) {
  try {
    // Get the current task
    const currentTask = await db.query.tasks.findFirst({
      where: (tasks, { eq }) => eq(tasks.id, id),
    });

    if (!currentTask) {
      return { error: "Task not found" };
    }

    // Update the task with new column and order
    const updatedTask = await db
      .update(tasks)
      .set({
        columnId,
        order: newOrder,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    // Reorder other tasks in the column if needed
    if (columnId === currentTask.columnId) {
      // Same column, reorder tasks
      await db
        .update(tasks)
        .set({
          order: sql`${tasks.order} - 1`,
          updatedAt: new Date(),
        })
        .where(
          and(eq(tasks.columnId, columnId), eq(tasks.order, currentTask.order))
        );
    }

    revalidatePath("/");
    return { task: updatedTask[0] };
  } catch (error) {
    console.error("Error moving task:", error);
    return { error: "Failed to move task" };
  }
}
