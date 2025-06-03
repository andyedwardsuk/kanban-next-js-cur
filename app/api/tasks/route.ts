import { tasks } from "@/lib/db/schemas/schema";
import { db } from "@/lib/db/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allTasks = await db.query.tasks.findMany({
      orderBy: [tasks.order],
    });

    return NextResponse.json(allTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, columnId, assigneeId } = body;

    // Get the highest order number in the column
    const highestOrderTask = await db.query.tasks.findFirst({
      where: (tasks, { eq }) => eq(tasks.columnId, columnId),
      orderBy: (tasks, { desc }) => [desc(tasks.order)],
    });

    const newOrder = highestOrderTask ? highestOrderTask.order + 1 : 1;

    // Create the new task
    const newTask = await db
      .insert(tasks)
      .values({
        title,
        description,
        columnId,
        assigneeId,
        order: newOrder,
      })
      .returning();

    return NextResponse.json(newTask[0]);
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
