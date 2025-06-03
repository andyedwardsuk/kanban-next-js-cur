# Team Tasks Database Setup

This project uses PostgreSQL with Drizzle ORM for data management. Follow these steps to set up and work with the database.

## Setup Instructions

### 1. Start the Database

```bash
# Start PostgreSQL and pgAdmin using Docker
docker compose up -d
```

PostgreSQL will be available at `localhost:5432` with the following credentials:

- Username: postgres
- Password: postgres
- Database: team_tasks

pgAdmin will be available at `http://localhost:5050` with:

- Email: admin@admin.com
- Password: admin

### 2. Generate Migrations

```bash
# Generate migrations based on your schema
npm run db:generate
```

This will create migration files in the `lib/db/migrations` directory.

### 3. Apply Migrations

```bash
# Push migrations to the database
npm run db:push
```

### 4. Seed the Database

```bash
# Seed the database with initial data
npm run db:seed
```

### 5. Explore with Drizzle Studio

```bash
# Open Drizzle Studio to explore and manage your data
npm run db:studio
```

## Database Schema

The database consists of the following tables:

### Columns Table

| Column    | Type      | Description           |
| --------- | --------- | --------------------- |
| id        | Serial    | Primary key           |
| title     | Varchar   | Column title          |
| order     | Serial    | Display order         |
| createdAt | Timestamp | Creation timestamp    |
| updatedAt | Timestamp | Last update timestamp |

### Tasks Table

| Column      | Type      | Description             |
| ----------- | --------- | ----------------------- |
| id          | Serial    | Primary key             |
| title       | Varchar   | Task title              |
| description | Text      | Task description        |
| columnId    | Serial    | Foreign key to columns  |
| assigneeId  | Varchar   | ID of the assigned user |
| order       | Serial    | Display order           |
| createdAt   | Timestamp | Creation timestamp      |
| updatedAt   | Timestamp | Last update timestamp   |

## API Endpoints

### Columns

- `GET /api/columns` - Get all columns with their tasks
- `GET /api/columns/:id` - Get a specific column
- `PATCH /api/columns/:id` - Update a column
- `DELETE /api/columns/:id` - Delete a column

### Tasks

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Development

When working with the database, you can import the necessary modules from:

```typescript
// For server components and API routes
import { db } from "@/lib/db/server";
import { columns, tasks } from "@/lib/db/schema";
```

Example usage:

```typescript
// Fetch all columns with their tasks
const allColumns = await db.query.columns.findMany({
  with: {
    tasks: true,
  },
});

// Create a new task
const newTask = await db
  .insert(tasks)
  .values({
    title: "New Task",
    description: "Task description",
    columnId: 1,
    assigneeId: "1",
    order: 1,
  })
  .returning();
```
