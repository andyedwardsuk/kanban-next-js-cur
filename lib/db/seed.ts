import { closeConnections, db } from "./index";
import { columns, tasks } from "./schemas/schema";

async function seed() {
  console.log("Seeding database...");

  try {
    // Insert columns
    const insertedColumns = await db
      .insert(columns)
      .values([
        { title: "To Do", order: 1 },
        { title: "In Progress", order: 2 },
        { title: "Done", order: 3 },
      ])
      .returning();

    console.log("Inserted columns:", insertedColumns);

    // Insert tasks
    if (insertedColumns.length > 0) {
      const toDoColumnId = insertedColumns[0].id;
      const inProgressColumnId = insertedColumns[1].id;
      const doneColumnId = insertedColumns[2].id;

      const insertedTasks = await db
        .insert(tasks)
        .values([
          {
            title: "Design task board UI",
            description: "Create wireframes for the task board interface",
            columnId: toDoColumnId,
            assigneeId: "1",
            order: 1,
          },
          {
            title: "Implement drag and drop",
            description:
              "Add drag and drop functionality for tasks between columns",
            columnId: inProgressColumnId,
            assigneeId: "2",
            order: 1,
          },
          {
            title: "Set up database schema",
            description:
              "Design and implement the database schema for tasks and columns",
            columnId: doneColumnId,
            assigneeId: "3",
            order: 1,
          },
        ])
        .returning();

      console.log("Inserted tasks:", insertedTasks);
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close database connections
    await closeConnections();
    process.exit(0);
  }
}

seed();
