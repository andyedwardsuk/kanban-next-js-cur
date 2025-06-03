import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Define the columns table
export const columns = pgTable("columns", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  order: serial("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define the tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("todo").notNull(),
  columnId: serial("column_id")
    .references(() => columns.id, { onDelete: "cascade" })
    .notNull(),
  assigneeId: varchar("assignee_id", { length: 255 }),
  order: serial("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations between tables
export const columnsRelations = relations(columns, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  column: one(columns, {
    fields: [tasks.columnId],
    references: [columns.id],
  }),
}));

// Types based on the schema
export type Column = typeof columns.$inferSelect;
export type NewColumn = typeof columns.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
