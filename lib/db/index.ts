import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schemas/schema";

// For server-side usage
const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/team_tasks";

// Connection for migrations (using postgres.js)
const migrationClient = postgres(connectionString, { max: 1 });

// Connection for queries
const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, { schema });

// Migrations function - can be called from a script
export const runMigrations = async () => {
  await migrate(drizzle(migrationClient), {
    migrationsFolder: "./lib/db/migrations",
  });
};

// Helper function to close connections
export const closeConnections = async () => {
  await queryClient.end();
  await migrationClient.end();
};
