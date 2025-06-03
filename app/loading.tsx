import { AppLayout } from "@/components/AppLayout";
import { TaskBoardSkeleton } from "@/components/TaskBoardSkeleton";

export default function Loading() {
  return (
    <AppLayout title="Team Tasks">
      <TaskBoardSkeleton />
    </AppLayout>
  );
}
