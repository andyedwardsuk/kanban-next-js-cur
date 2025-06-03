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
import { Column, Task } from "@/lib/db/schemas/schema";
import { MoreHorizontal, Pencil, PlusCircle, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import TaskCard from "./TaskCard";
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
  const router = useRouter();

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
      <Card className="flex-shrink-0 w-80 max-h-[calc(100vh-10rem)] flex flex-col">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
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
        </CardHeader>
        <CardContent className="p-3 flex-grow overflow-y-auto">
          <div className="space-y-2">
            {column.tasks?.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-muted-foreground"
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </CardContent>
      </Card>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={handleDialogChange}
        defaultColumnId={column.id}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this column and all its tasks?
              This action cannot be undone.
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
