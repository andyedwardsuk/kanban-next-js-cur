import { columns } from "@/lib/db/schemas/schema";
import { db } from "@/lib/db/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // First, fetch all columns
    const allColumns = await db.query.columns.findMany({
      orderBy: columns.order,
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

    return NextResponse.json(columnsWithTasks);
  } catch (error) {
    console.error("Error fetching columns:", error);
    return NextResponse.json(
      { error: "Failed to fetch columns" },
      { status: 500 }
    );
  }
}
