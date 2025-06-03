import { relations } from "drizzle-orm";
import { columns, tasks } from "./schemas/schema";

// Prepare the schema for Drizzle
export const schema = {
  columns,
  tasks,
};

// Prepare relations
export const relationSchema = {
  columnsRelations: relations(columns, ({ many }) => ({
    tasks: many(tasks),
  })),
  tasksRelations: relations(tasks, ({ one }) => ({
    column: one(columns, {
      fields: [tasks.columnId],
      references: [columns.id],
    }),
  })),
};
