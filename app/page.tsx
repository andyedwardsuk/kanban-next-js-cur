import { AppLayout } from "@/components/AppLayout";
import { TaskBoardSkeleton } from "@/components/TaskBoardSkeleton";
import TaskBoardWrapper from "@/components/TaskBoardWrapper";
import { Button } from "@/components/ui/button";
import { getColumns } from "@/lib/actions/columns";
import Link from "next/link";
import { Suspense } from "react";

export default async function Home() {
  return (
    <AppLayout
      title="Team Kanban Board"
      subtitle="Collaborate and track progress efficiently"
    >
      <Suspense fallback={<TaskBoardSkeleton />}>
        <BoardContent />
      </Suspense>
    </AppLayout>
  );
}

async function BoardContent() {
  const { columns, error } = await getColumns();

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 rounded-lg border border-destructive/20 bg-destructive/5">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link href="/">Retry</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <TaskBoardWrapper initialColumns={columns || []} />;
}
