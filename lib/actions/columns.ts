"use server";

import { columns, tasks } from "@/lib/db/schemas/schema";
import { db } from "@/lib/db/server";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getColumns() {
  try {
    // Just use the SQL builder directly to avoid query building issues
    const allColumns = await db
      .select({
        id: columns.id,
        title: columns.title,
        order: columns.order,
        createdAt: columns.createdAt,
        updatedAt: columns.updatedAt,
      })
      .from(columns)
      .orderBy(columns.order);

    // Get all tasks
    const allTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        columnId: tasks.columnId,
        assigneeId: tasks.assigneeId,
        order: tasks.order,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .orderBy(tasks.columnId, tasks.order);

    // Group tasks by column
    const columnsWithTasks = allColumns.map((column) => {
      const columnTasks = allTasks
        .filter((task) => task.columnId === column.id)
        .sort((a, b) => a.order - b.order); // Explicitly sort by order

      return {
        ...column,
        tasks: columnTasks,
      };
    });

    return { columns: columnsWithTasks };
  } catch (error) {
    console.error("Error fetching columns:", error);
    return { error: "Failed to fetch columns" };
  }
}

export async function getColumn(id: number) {
  try {
    const column = await db
      .select()
      .from(columns)
      .where(eq(columns.id, id))
      .limit(1);

    if (!column.length) {
      return { error: "Column not found" };
    }

    // Fetch tasks for this column separately
    const columnTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.columnId, id))
      .orderBy(tasks.order);

    return {
      column: {
        ...column[0],
        tasks: columnTasks,
      },
    };
  } catch (error) {
    console.error("Error fetching column:", error);
    return { error: "Failed to fetch column" };
  }
}

export async function createColumn(title: string) {
  try {
    // Get the highest order number
    const highestOrderColumn = await db
      .select()
      .from(columns)
      .orderBy(desc(columns.order))
      .limit(1);

    const newOrder = highestOrderColumn.length
      ? highestOrderColumn[0].order + 1
      : 1;

    const newColumn = await db
      .insert(columns)
      .values({
        title,
        order: newOrder,
      })
      .returning();

    revalidatePath("/");
    return { column: newColumn[0] };
  } catch (error) {
    console.error("Error creating column:", error);
    return { error: "Failed to create column" };
  }
}

export async function updateColumn(id: number, title: string) {
  try {
    const updatedColumn = await db
      .update(columns)
      .set({
        title,
        updatedAt: new Date(),
      })
      .where(eq(columns.id, id))
      .returning();

    if (!updatedColumn.length) {
      return { error: "Column not found" };
    }

    revalidatePath("/");
    return { column: updatedColumn[0] };
  } catch (error) {
    console.error("Error updating column:", error);
    return { error: "Failed to update column" };
  }
}

export async function deleteColumn(id: number) {
  try {
    const deletedColumn = await db
      .delete(columns)
      .where(eq(columns.id, id))
      .returning();

    if (!deletedColumn.length) {
      return { error: "Column not found" };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting column:", error);
    return { error: "Failed to delete column" };
  }
}
