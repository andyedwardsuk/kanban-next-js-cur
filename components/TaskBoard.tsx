"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createColumn } from "@/lib/actions/columns";
import { Column, Task } from "@/lib/db/schemas/schema";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import TaskColumn from "./TaskColumn";

interface TaskBoardProps {
  initialColumns: (Column & { tasks?: Task[] })[];
}

export default function TaskBoard({ initialColumns }: TaskBoardProps) {
  const [columns, setColumns] =
    useState<(Column & { tasks?: Task[] })[]>(initialColumns);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Update columns state when initialColumns prop changes
  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  // Setup drag and drop monitoring
  useEffect(() => {
    const boardElement = boardRef.current;
    if (!boardElement) return;

    // Setup global drag monitoring
    const monitorCleanup = monitorForElements({
      onDrop: (args) => {
        if (!args.source.data) return;

        // Task data from the source
        const taskId = args.source.data.taskId as number;
        const sourceColumnId = args.source.data.columnId as number;

        if (!taskId || !sourceColumnId) return;

        // If no drop target, the drop operation is handled by the column component
        if (!args.location.current.dropTargets.length) return;

        // Get drop target information
        const dropTarget = args.location.current.dropTargets[0];
        if (!dropTarget || !dropTarget.data) return;

        const targetColumnId = dropTarget.data.columnId as number;

        if (!targetColumnId || targetColumnId === sourceColumnId) return;

        // Only logging and refreshing as the actual move is handled in TaskColumn
        console.log(
          `Dropped task ${taskId} from column ${sourceColumnId} to column ${targetColumnId}`
        );
      },
    });

    return () => {
      monitorCleanup();
    };
  }, []);

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;

    try {
      const result = await createColumn(newColumnTitle.trim());
      if (result.column) {
        setColumns([...columns, result.column]);
        setNewColumnTitle("");
        setIsAddingColumn(false);
        toast.success("Column created");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create column");
      }
    } catch (error) {
      console.error("Error creating column:", error);
      toast.error("An unexpected error occurred");
    }
  };

  // Handler for when columns need a refresh
  const handleColumnUpdate = () => {
    router.refresh();
  };

  return (
    <div className="p-6" ref={boardRef}>
      <div className="flex space-x-4 overflow-x-auto pb-6">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            column={column}
            onUpdate={handleColumnUpdate}
          />
        ))}

        {/* Add column button or form */}
        {!isAddingColumn ? (
          <Button
            variant="outline"
            className="flex-shrink-0 h-[calc(100vh-200px)] w-[330px] flex flex-col border-dashed relative"
            onClick={() => setIsAddingColumn(true)}
          >
            <div className="absolute top-8 inset-x-0 flex items-center justify-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Add Column</span>
            </div>
          </Button>
        ) : (
          <div className="flex-shrink-0 w-[330px] h-[calc(100vh-200px)] flex flex-col bg-card rounded-lg border border-border p-4">
            <div className="mb-4">
              <Input
                placeholder="Column title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddColumn();
                  if (e.key === "Escape") setIsAddingColumn(false);
                }}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 w-full">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingColumn(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddColumn} className="min-w-24">
                Add Column
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
