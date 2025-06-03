import { columns } from "@/lib/db/schemas/schema";
import { db } from "@/lib/db/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid column ID" }, { status: 400 });
    }

    const column = await db.query.columns.findFirst({
      where: (columns, { eq }) => eq(columns.id, id),
    });

    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    // Fetch tasks for this column separately
    const columnTasks = await db.query.tasks.findMany({
      where: (tasks, { eq }) => eq(tasks.columnId, column.id),
      orderBy: (tasks, { asc }) => [asc(tasks.order)],
    });

    return NextResponse.json({
      ...column,
      tasks: columnTasks,
    });
  } catch (error) {
    console.error("Error fetching column:", error);
    return NextResponse.json(
      { error: "Failed to fetch column" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid column ID" }, { status: 400 });
    }

    const updatedColumn = await db
      .update(columns)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(columns.id, id))
      .returning();

    if (!updatedColumn.length) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    return NextResponse.json(updatedColumn[0]);
  } catch (error) {
    console.error("Error updating column:", error);
    return NextResponse.json(
      { error: "Failed to update column" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid column ID" }, { status: 400 });
    }

    const deletedColumn = await db
      .delete(columns)
      .where(eq(columns.id, id))
      .returning();

    if (!deletedColumn.length) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    return NextResponse.json(deletedColumn[0]);
  } catch (error) {
    console.error("Error deleting column:", error);
    return NextResponse.json(
      { error: "Failed to delete column" },
      { status: 500 }
    );
  }
}
