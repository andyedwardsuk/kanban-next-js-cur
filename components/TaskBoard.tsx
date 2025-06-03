"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createColumn } from "@/lib/actions/columns";
import { Column } from "@/lib/db/schemas/schema";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import TaskColumn from "./TaskColumn";

interface TaskBoardProps {
  initialColumns: Column[];
}

export default function TaskBoard({ initialColumns }: TaskBoardProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const router = useRouter();

  // Update columns state when initialColumns prop changes
  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

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

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            column={column}
            onUpdate={() => router.refresh()}
          />
        ))}

        <div className="flex-shrink-0 w-80">
          {!isAddingColumn ? (
            <Button
              variant="outline"
              className="w-full h-12 flex items-center justify-center border-dashed"
              onClick={() => setIsAddingColumn(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Column
            </Button>
          ) : (
            <div className="bg-card rounded-md p-3 shadow-sm border">
              <Input
                placeholder="Column title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                className="mb-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddColumn();
                  if (e.key === "Escape") {
                    setNewColumnTitle("");
                    setIsAddingColumn(false);
                  }
                }}
              />
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingColumn(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddColumn}>
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
