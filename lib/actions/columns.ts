"use server";

import { columns } from "@/lib/db/schemas/schema";
import { db } from "@/lib/db/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getColumns() {
  try {
    // First, fetch all columns
    const allColumns = await db.query.columns.findMany({
      orderBy: (columns, { asc }) => [asc(columns.order)],
    });

    // Then, for each column, fetch its tasks separately
    const columnsWithTasks = await Promise.all(
      allColumns.map(async (column) => {
        const columnTasks = await db.query.tasks.findMany({
          where: (tasks, { eq }) => eq(tasks.columnId, column.id),
          orderBy: (tasks, { asc }) => [asc(tasks.order)],
        });

        return {
          ...column,
          tasks: columnTasks,
        };
      })
    );

    return { columns: columnsWithTasks };
  } catch (error) {
    console.error("Error fetching columns:", error);
    return { error: "Failed to fetch columns" };
  }
}

export async function getColumn(id: number) {
  try {
    const column = await db.query.columns.findFirst({
      where: (columns, { eq }) => eq(columns.id, id),
    });

    if (!column) {
      return { error: "Column not found" };
    }

    // Fetch tasks for this column separately
    const columnTasks = await db.query.tasks.findMany({
      where: (tasks, { eq }) => eq(tasks.columnId, column.id),
      orderBy: (tasks, { asc }) => [asc(tasks.order)],
    });

    return {
      column: {
        ...column,
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
    const highestOrderColumn = await db.query.columns.findFirst({
      orderBy: (columns, { desc }) => [desc(columns.order)],
    });

    const newOrder = highestOrderColumn ? highestOrderColumn.order + 1 : 1;

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
