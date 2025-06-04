"use server";

import { columns, tasks } from "@/lib/db/schemas/schema";
import { db } from "@/lib/db/server";
import { and, desc, eq, gt, gte, lt, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type TaskFormData = {
  title: string;
  description?: string;
  columnId: number;
  assigneeId?: string;
};

export async function getTasks() {
  try {
    // This is a simplified version that doesn't join with columns
    // If you need column data, you'll need to fetch it separately
    const allTasks = await db
      .select()
      .from(tasks)
      .orderBy(tasks.columnId, tasks.order);

    return { tasks: allTasks };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { error: "Failed to fetch tasks" };
  }
}

export async function getTask(id: number) {
  try {
    const task = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);

    if (!task.length) {
      return { error: "Task not found" };
    }

    // Get the column info separately if needed
    const taskColumn = await db
      .select()
      .from(columns)
      .where(eq(columns.id, task[0].columnId))
      .limit(1);

    return {
      task: {
        ...task[0],
        column: taskColumn.length ? taskColumn[0] : null,
      },
    };
  } catch (error) {
    console.error("Error fetching task:", error);
    return { error: "Failed to fetch task" };
  }
}

export async function createTask(data: TaskFormData) {
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
    console.log("moveTask called with:", { id, columnId, newOrder });

    // Get the current task
    const currentTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    if (!currentTask.length) {
      return { error: "Task not found" };
    }

    const originalColumnId = currentTask[0].columnId;
    const originalOrder = currentTask[0].order;

    console.log("Current task info:", {
      taskId: id,
      originalColumnId,
      originalOrder,
      newColumnId: columnId,
      newOrder,
    });

    // If moving to a new column, we need to update orders in both columns
    if (columnId !== originalColumnId) {
      // Log target column tasks before updates
      const targetColumnTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.columnId, columnId))
        .orderBy(tasks.order);

      console.log(
        "Target column tasks before update:",
        targetColumnTasks.map((t) => ({ id: t.id, order: t.order }))
      );

      // 1. First decrease order of tasks in the original column that come after the moved task
      await db
        .update(tasks)
        .set({
          order: sql`${tasks.order} - 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(tasks.columnId, originalColumnId),
            gt(tasks.order, originalOrder)
          )
        );

      // 2. Increase order of tasks in the target column to make room for the new task
      // We need to make space at the exact position specified by newOrder
      await db
        .update(tasks)
        .set({
          order: sql`${tasks.order} + 1`,
          updatedAt: new Date(),
        })
        .where(and(eq(tasks.columnId, columnId), gte(tasks.order, newOrder)));
    } else {
      // Same column reordering logic (unchanged)
      if (originalOrder < newOrder) {
        // Moving down
        await db
          .update(tasks)
          .set({
            order: sql`${tasks.order} - 1`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(tasks.columnId, columnId),
              gt(tasks.order, originalOrder),
              lte(tasks.order, newOrder)
            )
          );
      } else if (originalOrder > newOrder) {
        // Moving up
        await db
          .update(tasks)
          .set({
            order: sql`${tasks.order} + 1`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(tasks.columnId, columnId),
              lt(tasks.order, originalOrder),
              gte(tasks.order, newOrder)
            )
          );
      }
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

    // Log final state of the column after all updates
    const finalTargetColumnTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.columnId, columnId))
      .orderBy(tasks.order);

    console.log(
      "Target column tasks AFTER update:",
      finalTargetColumnTasks.map((t) => ({ id: t.id, order: t.order }))
    );

    revalidatePath("/");
    return { task: updatedTask[0] };
  } catch (error) {
    console.error("Error moving task:", error);
    return { error: "Failed to move task" };
  }
}

/**
 * Reorder tasks within a column
 * @param columnId The column containing the tasks
 * @param taskIds Array of task IDs in their new order
 */
export async function reorderTasks(columnId: number, taskIds: number[]) {
  try {
    // Update the order of each task based on its position in the taskIds array
    for (let i = 0; i < taskIds.length; i++) {
      await db
        .update(tasks)
        .set({
          order: i + 1, // Order starts at 1
          updatedAt: new Date(),
        })
        .where(and(eq(tasks.id, taskIds[i]), eq(tasks.columnId, columnId)));
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error reordering tasks:", error);
    return { error: "Failed to reorder tasks" };
  }
}
