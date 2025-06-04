# ✨ Team Tasks - Kanban Board Application 🚀

A modern, responsive Kanban board application built with Next.js 15 and React 19. Team Tasks enables teams to efficiently manage tasks, track progress, and collaborate on projects through an intuitive drag-and-drop interface. ⚡

## ✅ Features

- **🔄 Drag and Drop Task Management**: Seamlessly move tasks between columns with smooth animations
- **👁️ Real-time Visual Feedback**: Interactive skeleton placeholders show where tasks will be placed
- **📊 Multiple Task States**: Organize tasks as To Do, In Progress, In Review, and Done
- **👥 Task Assignment**: Assign team members to specific tasks
- **🛠️ Custom Column Creation**: Create, rename, and delete columns to fit your workflow
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🌓 Dark Mode Support**: Built-in light and dark theme

## 🧰 Technology Stack

- **Frontend**:

  - 🔥 Next.js 15 with React 19
  - ⚛️ React Server Components
  - 🎨 Tailwind CSS for styling
  - 🧩 Shadcn/ui component library
  - 🖱️ Atlaskit Pragmatic Drag and Drop library

- **Backend**:
  - ⚙️ Next.js Server Actions for data mutations
  - 🗄️ SQLite database (via Drizzle ORM)
  - 📝 TypeScript for type safety

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application. 🎉

## 🔍 How It Works

### 📋 Kanban Board Structure

The application uses a column-based layout where:

- Each column represents a stage in your workflow
- Tasks are displayed as cards within columns
- Users can drag tasks between columns to update their status

### 🔄 Drag and Drop Functionality

The drag and drop system provides a smooth user experience:

1. When dragging a task, a skeleton placeholder appears showing where the task will be placed ✨
2. The skeleton fades out quickly after dropping 💨
3. Other cards in the column smoothly animate to their new positions 🎭
4. The task database is updated in real-time via server actions ⚡

### 🗄️ Database Schema

The application uses a relational database structure with:

- `columns` table to store board columns
- `tasks` table to store individual tasks with relations to columns
- Task order is maintained to preserve positioning

### 🧩 Component Architecture

- `TaskBoard`: Main container component
- `TaskColumn`: Manages individual columns and drop targets
- `TaskCard`: Individual task cards with drag functionality
- `TaskCardSkeleton`: Placeholder during drag operations
- `TaskDialog`: Modal for creating and editing tasks

## 🎨 Customization

You can customize the application by:

- 🎭 Modifying the theme in `app/globals.css`
- 📊 Extending the database schema in `lib/db/schema.ts`
- 🧩 Adding new components with `npx shadcn@latest add [component-name]`

## 📚 Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) 📘
- [React Documentation](https://react.dev) ⚛️
- [Tailwind CSS](https://tailwindcss.com/docs) 🎨
- [Shadcn/ui](https://ui.shadcn.com) 🧩
- [Atlaskit Pragmatic Drag and Drop](https://atlaskit.atlassian.com/packages/pragmatic-drag-and-drop/docs) 🖱️

## 📄 License

[MIT](LICENSE) ⚖️
