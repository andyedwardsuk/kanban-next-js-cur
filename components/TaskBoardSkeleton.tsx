import { Skeleton } from "@/components/ui/skeleton";

export function TaskBoardSkeleton() {
  // Create three columns with skeletons for tasks
  return (
    <div className="flex flex-row gap-4 overflow-x-auto pb-4">
      {/* Column 1 */}
      <ColumnSkeleton />

      {/* Column 2 */}
      <ColumnSkeleton />

      {/* Column 3 */}
      <ColumnSkeleton />
    </div>
  );
}

function ColumnSkeleton() {
  return (
    <div className="flex-shrink-0 w-80 bg-card rounded-md shadow-sm border p-3 flex flex-col">
      {/* Column header */}
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        <TaskSkeleton />
        <TaskSkeleton />
        <TaskSkeleton short />
      </div>

      {/* Add task button */}
      <div className="mt-4">
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

function TaskSkeleton({ short = false }: { short?: boolean }) {
  return (
    <div className="bg-card shadow-sm rounded-md p-3">
      {/* Task title */}
      <Skeleton className="h-5 w-4/5 mb-2" />

      {/* Task description - conditionally show based on 'short' prop */}
      {!short && (
        <div className="space-y-1 mb-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      )}

      {/* Task footer */}
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-5 w-28" />
        <div className="flex gap-1">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
