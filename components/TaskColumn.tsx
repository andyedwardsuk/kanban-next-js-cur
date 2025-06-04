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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { deleteColumn, updateColumn } from "@/lib/actions/columns";
import { moveTask, reorderTasks } from "@/lib/actions/tasks";
import { Column, Task } from "@/lib/db/schemas/schema";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Edit, MoreHorizontal, PlusCircle, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import TaskCard from "./TaskCard";
import TaskCardSkeleton from "./TaskCardSkeleton";
import TaskDialog from "./TaskDialog";

interface TaskColumnProps {
  column: Column & { tasks?: Task[] };
  onUpdate?: () => void;
}

export default function TaskColumn({ column, onUpdate }: TaskColumnProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(column.tasks || []);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Update tasks state when column.tasks changes
  useEffect(() => {
    setTasks(column.tasks || []);
  }, [column.tasks]);

  // Setup drop target functionality
  useEffect(() => {
    const element = columnRef.current;
    const contentElement = contentRef.current;
    if (!element || !contentElement) return;

    // Function to get the insertion index based on mouse position
    const getInsertionIndex = (y: number): number => {
      if (!contentElement) return 0;

      const taskElements = contentElement.querySelectorAll("[data-task-id]");
      if (!taskElements.length) return 0;

      // Check each task element's position
      for (let i = 0; i < taskElements.length; i++) {
        const rect = taskElements[i].getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        // If cursor is above the midpoint of this card, insert before it
        if (y < midpoint) {
          return i;
        }
      }

      // If we got here, insert at the end
      return taskElements.length;
    };

    // Add listener for global drag events to update skeleton even for same-column reordering
    const handleDragStart = (event: CustomEvent) => {
      if (event.detail?.source?.data?.taskId) {
        const taskId = event.detail.source.data.taskId as number;
        const sourceColumnId = event.detail.source.data.columnId as number;

        // Set dragged task ID
        setDraggedTaskId(taskId);

        // If drag starts in this column, mark it as a drop target immediately
        if (sourceColumnId === column.id) {
          setIsDropTarget(true);
        }
      }
    };

    // Handle drag end events to clean up skeletons
    const handleDragEnd = () => {
      // Add fade-out class to all skeleton cards in this column
      const skeletonCards =
        columnRef.current?.querySelectorAll(".skeleton-card");
      if (skeletonCards) {
        skeletonCards.forEach((card) => {
          card.classList.add("fade-out");
        });
      }

      // Delay clearing visual states to allow for animation
      setTimeout(() => {
        setIsDropTarget(false);
        setDropIndex(null);
        setDraggedTaskId(null);
      }, 200); // Match animation duration
    };

    // Listen for drag start events from Pragmatic drag and drop
    document.addEventListener(
      "pragmatic-dnd-drag-start",
      handleDragStart as EventListener
    );

    // Listen for drag end events
    document.addEventListener(
      "pragmatic-dnd-drag-end",
      handleDragEnd as EventListener
    );

    const cleanup = dropTargetForElements({
      element,
      getData: () => ({
        columnId: column.id,
      }),
      canDrop: (args) => {
        // Only accept task objects
        return args.source.data?.taskId !== undefined;
      },
      onDragEnter: () => {
        setIsDropTarget(true);
      },
      onDragLeave: () => {
        // Don't clear isDropTarget if we're dragging a card from this column
        // since onDragLeave fires when we drag over the card we're dragging
        const draggingInSameColumn = tasks.some((t) => t.id === draggedTaskId);
        if (!draggingInSameColumn) {
          setIsDropTarget(false);
        }
        setDropIndex(null);
      },
      onDrag: (args) => {
        if (!contentElement) return;

        // Track the position and update the skeleton indicator
        const y = args.location.current.input.clientY;

        // For empty columns, always set index to 0
        const index = tasks.length === 0 ? 0 : getInsertionIndex(y);

        // Check if this is a reordering within the same column
        const taskId = args.source.data?.taskId as number;
        const sourceColumnId = args.source.data?.columnId as number;
        const isSameColumnReordering = sourceColumnId === column.id;

        // If reordering within the same column, don't show skeleton at the current card position
        if (isSameColumnReordering) {
          const currentTasks = tasks || [];
          const currentIndex = currentTasks.findIndex((t) => t.id === taskId);

          // Set drop index, but avoid the current position of the dragged card
          // to prevent the skeleton from appearing at the card's original position
          if (index !== currentIndex) {
            setDropIndex(index);
          } else {
            // Clear drop index if it's the same as the current position
            setDropIndex(null);
          }
        } else {
          // For cross-column moves, set the index normally
          setDropIndex(index);
        }

        // Store the dragged task ID
        if (args.source.data?.taskId) {
          setDraggedTaskId(args.source.data.taskId as number);
        }
      },
      onDrop: async (args) => {
        // Save the final drop index before clearing state
        const finalDropIndex = dropIndex;

        // Add fade-out class to all skeleton cards in this column
        const skeletonCards =
          columnRef.current?.querySelectorAll(".skeleton-card");
        if (skeletonCards) {
          skeletonCards.forEach((card) => {
            card.classList.add("fade-out");
          });
        }

        // Delay clearing visual states to allow for animation
        setTimeout(() => {
          setIsDropTarget(false);
          setDropIndex(null);
          setDraggedTaskId(null);
        }, 200); // Match animation duration

        const sourceData = args.source.data;
        if (!sourceData) {
          return;
        }

        const taskId = sourceData.taskId as number;
        const sourceColumnId = sourceData.columnId as number;

        if (typeof taskId !== "number") {
          return;
        }

        try {
          // Use the stored finalDropIndex to ensure consistency with what the user saw
          let targetIndex =
            finalDropIndex !== null
              ? finalDropIndex
              : getInsertionIndex(args.location.current.input.clientY);

          if (sourceColumnId === column.id) {
            // Reordering within the same column
            const currentTasks = tasks || [];
            const taskIds = currentTasks.map((t) => t.id);

            // Get current index
            const currentIndex = taskIds.indexOf(taskId);

            // If dropping at the same position or no valid drop position, do nothing
            if (
              currentIndex === -1 ||
              currentIndex === targetIndex ||
              targetIndex === null
            )
              return;

            // When moving down in the same column, we need to adjust the target index
            // to account for the removal of the card from its original position
            if (currentIndex < targetIndex) {
              targetIndex--;
            }

            // Create new order of task IDs
            const newTaskIds = [...taskIds];
            newTaskIds.splice(currentIndex, 1);
            newTaskIds.splice(targetIndex, 0, taskId);

            // Update the order in the database
            await reorderTasks(column.id, newTaskIds);
          } else {
            // Moving task between columns
            // For cross-column moves, we need to translate the visual index to an order value
            // Visual index is 0-based (position between cards) while order in DB is 1-based

            let orderToUse: number;

            if (targetIndex === 0) {
              // If dropping at the beginning, use order 1
              orderToUse = 1;
            } else if (targetIndex >= tasks.length) {
              // If dropping at the end, use order = last task's order + 1
              const lastTask = tasks[tasks.length - 1];
              orderToUse = lastTask ? lastTask.order + 1 : 1;
            } else {
              // If dropping between two tasks, use the order of the task at the target index
              // This ensures the card appears exactly where the skeleton was shown
              orderToUse = tasks[targetIndex].order;
            }

            console.log("Cross-column move:", {
              taskId,
              targetColumn: column.id,
              visualIndex: targetIndex,
              orderToUse,
              tasksInColumn: tasks.map((t) => ({ id: t.id, order: t.order })),
            });

            await moveTask(taskId, column.id, orderToUse);
          }

          // Refresh the board
          if (onUpdate) onUpdate();
        } catch (error) {
          console.error("Error handling drop:", error);
          toast.error("Failed to move task");
        }
      },
    });

    return () => {
      document.removeEventListener(
        "pragmatic-dnd-drag-start",
        handleDragStart as EventListener
      );
      document.removeEventListener(
        "pragmatic-dnd-drag-end",
        handleDragEnd as EventListener
      );
      cleanup();
    };
  }, [column.id, tasks, onUpdate]);

  const handleUpdateColumnTitle = async () => {
    if (!columnTitle.trim() || columnTitle === column.title) {
      setColumnTitle(column.title);
      setIsEditingTitle(false);
      return;
    }

    await updateColumn(column.id, columnTitle.trim());
    toast.success("Column renamed");
    setIsEditingTitle(false);
    router.refresh();
    if (onUpdate) onUpdate();
  };

  const handleDeleteColumn = async () => {
    await deleteColumn(column.id);
    toast.success("Column deleted");
    router.refresh();
    if (onUpdate) onUpdate();
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    // If dialog is closed, trigger an update to refresh tasks
    if (!open && onUpdate) {
      onUpdate();
    }
  };

  return (
    <>
      <Card
        ref={columnRef}
        data-column-id={column.id}
        className="flex-shrink-0 w-[330px] h-[calc(100vh-200px)] flex flex-col"
      >
        <CardHeader className="p-3 pb-0">
          <div className="flex justify-between items-center">
            {!isEditingTitle ? (
              <CardTitle className="text-xl truncate">{column.title}</CardTitle>
            ) : (
              <Input
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
                onBlur={handleUpdateColumnTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateColumnTitle();
                  if (e.key === "Escape") {
                    setColumnTitle(column.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="text-xl h-8"
                autoFocus
              />
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs p-1 text-muted-foreground"
                onClick={() => setIsDialogOpen(true)}
              >
                <PlusCircle className="mr-1 h-3.5 w-3.5" />
                Add Task
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 -mt-6 -mr-1"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Rename</span>
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
          </div>
        </CardHeader>
        <CardContent ref={contentRef} className="p-3 flex-grow overflow-y-auto">
          <div className="relative task-container">
            {tasks.map((task, index) => {
              // Add skeleton placeholder before this task if this is the drop position
              const isDropPosition = dropIndex === index;
              const isDraggedTask = task.id === draggedTaskId;
              const showSkeleton =
                isDropPosition && !isDraggedTask && isDropTarget;

              return (
                <React.Fragment key={task.id}>
                  {showSkeleton && (
                    <div className="mb-2">
                      <TaskCardSkeleton />
                    </div>
                  )}
                  <div
                    className={`relative ${
                      isDraggedTask ? "opacity-40" : ""
                    } transition-all duration-300`}
                  >
                    <TaskCard task={task} />
                  </div>
                </React.Fragment>
              );
            })}

            {/* Skeleton placeholder at the end if dropping at the end of the list */}
            {tasks.length > 0 && dropIndex === tasks.length && isDropTarget && (
              <div className="mt-2">
                <TaskCardSkeleton />
              </div>
            )}

            {/* Empty state when no tasks and not dragging */}
            {tasks.length === 0 && !isDropTarget && (
              <div className="text-center p-4 text-muted-foreground italic">
                No tasks yet
              </div>
            )}

            {/* Empty column with skeleton when dragging into empty column */}
            {tasks.length === 0 && isDropTarget && (
              <div className="mt-2">
                <TaskCardSkeleton />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Task dialog */}
      <TaskDialog
        open={isDialogOpen}
        onOpenChange={handleDialogChange}
        defaultColumnId={column.id}
      />

      {/* Delete column alert dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the column and all its tasks. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteColumn}
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
