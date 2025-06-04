"use client";

import { Column, Task } from "@/lib/db/schemas/schema";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TaskBoardSkeleton } from "./TaskBoardSkeleton";

// Use dynamic import with no SSR for client components
const TaskBoard = dynamic(() => import("./TaskBoard"), {
  ssr: false,
  loading: () => <TaskBoardSkeleton />,
});

interface TaskBoardWrapperProps {
  initialColumns: (Column & { tasks?: Task[] })[];
}

export default function TaskBoardWrapper({
  initialColumns,
}: TaskBoardWrapperProps) {
  const router = useRouter();

  // Set up an effect to periodically refresh the data
  // This helps ensure UI is updated when database changes
  useEffect(() => {
    // Refresh once after component mounts
    const timeoutId = setTimeout(() => {
      router.refresh();
    }, 100);

    // Clean up timeout on unmount
    return () => clearTimeout(timeoutId);
  }, [router]);

  return (
    <div className="h-full flex-1 flex flex-col">
      <TaskBoard initialColumns={initialColumns} />
    </div>
  );
}
