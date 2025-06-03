import { Task } from "@/lib/db/schemas/schema";
import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
}

export function KanbanColumn({ title, tasks }: KanbanColumnProps) {
  return (
    <div className="flex flex-col flex-1 bg-muted/60 p-4 rounded-lg min-h-[400px] max-h-[calc(100vh-200px)]">
      <h2 className="text-xl font-semibold mb-6 text-center text-foreground/90 sticky top-0 bg-muted/60 py-2 z-10">
        {title}
      </h2>
      <div className="space-y-4 overflow-y-auto flex-grow pr-1">
        {" "}
        {/* Added pr-1 for scrollbar spacing */}
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <p className="text-sm text-muted-foreground text-center pt-4">
            No tasks in this column.
          </p>
        )}
      </div>
    </div>
  );
}
