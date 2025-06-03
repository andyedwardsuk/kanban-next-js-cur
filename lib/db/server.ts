import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schemas/schema";

// For server-side usage in Next.js server components and API routes
const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/team_tasks";

// Create a postgres.js client
const client = postgres(connectionString);

// Create a Drizzle client
export const db = drizzle(client, { schema });
