import { tasks } from "@/lib/db/schemas/schema";
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
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const task = await db.query.tasks.findFirst({
      where: (tasks, { eq }) => eq(tasks.id, id),
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Fetch the column separately
    const column = await db.query.columns.findFirst({
      where: (columns, { eq }) => eq(columns.id, task.columnId),
    });

    return NextResponse.json({
      ...task,
      column,
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const updatedTask = await db
      .update(tasks)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    if (!updatedTask.length) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTask[0]);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const deletedTask = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();

    if (!deletedTask.length) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(deletedTask[0]);
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
