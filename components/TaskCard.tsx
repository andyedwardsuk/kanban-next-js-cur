"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteTask } from "@/lib/actions/tasks";
import { assignees } from "@/lib/data/assignees";
import { Task } from "@/lib/db/schemas/schema";
import { TASK_STATUS, TaskStatus } from "@/lib/db/schemas/task-schema";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import TaskDialog from "./TaskDialog";

interface TaskCardProps {
  task: Task;
}

// Define the status display configuration for UI
const statusConfig = {
  [TASK_STATUS.TODO]: { label: "To Do", variant: "secondary" as const },
  [TASK_STATUS.IN_PROGRESS]: {
    label: "In Progress",
    variant: "default" as const,
  },
  [TASK_STATUS.REVIEW]: { label: "In Review", variant: "warning" as const },
  [TASK_STATUS.DONE]: { label: "Done", variant: "success" as const },
};

export default function TaskCard({ task }: TaskCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Find the assignee for this task
  const assignee = task.assigneeId
    ? assignees.find((a) => a.id === task.assigneeId)
    : undefined;

  // Get the status configuration based on task status
  const taskStatus = (task.status || TASK_STATUS.TODO) as TaskStatus;
  const status = statusConfig[taskStatus];

  // Set up draggable functionality
  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    // Make the card draggable
    const cleanup = draggable({
      element,
      getInitialData: () => ({
        taskId: task.id,
        columnId: task.columnId,
        task: task,
      }),
      onDragStart: () => {
        setIsDragging(true);
        // Add a dragging class to the document body for global styling
        document.body.classList.add("is-dragging");

        // Dispatch custom event to notify columns about the drag
        const event = new CustomEvent("pragmatic-dnd-drag-start", {
          detail: {
            source: {
              data: {
                taskId: task.id,
                columnId: task.columnId,
              },
            },
          },
          bubbles: true,
        });
        document.dispatchEvent(event);

        // Position the cursor at the center of the element for better dragging
        return {
          element: element.cloneNode(true) as HTMLElement,
          offsetX: element.offsetWidth / 2,
          offsetY: element.offsetHeight / 2,
        };
      },
      onDrop: () => {
        setIsDragging(false);
        // Remove the dragging class
        document.body.classList.remove("is-dragging");

        // Dispatch custom event to notify columns about the drag end
        const event = new CustomEvent("pragmatic-dnd-drag-end", {
          detail: {
            source: {
              data: {
                taskId: task.id,
                columnId: task.columnId,
              },
            },
          },
          bubbles: true,
        });
        document.dispatchEvent(event);
      },
    });

    return cleanup;
  }, [task]);

  const handleDelete = async () => {
    await deleteTask(task.id);
    toast.success("Task deleted successfully");
    router.refresh();
  };

  const handleEdit = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card
        ref={cardRef}
        data-task-id={task.id}
        className={`bg-card shadow-sm hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing ${
          isDragging
            ? "opacity-60 ring-2 ring-primary shadow-lg scale-[1.02] dragging"
            : ""
        }`}
      >
        <div className="flex flex-col p-3 px-4 h-auto">
          {/* Top row with title and menu */}
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{task.title}</h3>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 -mt-3 -mr-1"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteAlertOpen(true)}
                  className="text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2 mb-3">
              {task.description}
            </p>
          )}

          {/* Bottom row with assignee and status badge */}
          <div className="flex justify-between items-center mt-auto">
            {/* Assignee display */}
            <div className="flex items-center text-xs text-muted-foreground">
              {assignee ? (
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
                    <AvatarFallback>{assignee.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{assignee.name}</span>
                </div>
              ) : (
                <span className="text-sm">Unassigned</span>
              )}
            </div>

            {/* Status badge now on the right */}
            <Badge
              variant={status.variant}
              className="px-2 py-0.5 h-5 font-medium min-w-[60px] flex justify-center"
            >
              {status.label}
            </Badge>
          </div>
        </div>
      </Card>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={task}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
