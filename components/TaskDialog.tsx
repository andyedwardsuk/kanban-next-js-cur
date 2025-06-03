/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addTask, updateTask } from "@/lib/actions/task-actions";
import { assignees } from "@/lib/data/assignees";
import { Task } from "@/lib/db/schemas/schema";
import { TASK_STATUS } from "@/lib/db/schemas/task-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  defaultColumnId?: number;
};

// Define the status options for the UI
const statusOptions = [
  { value: TASK_STATUS.TODO, label: "To Do" },
  { value: TASK_STATUS.IN_PROGRESS, label: "In Progress" },
  { value: TASK_STATUS.REVIEW, label: "In Review" },
  { value: TASK_STATUS.DONE, label: "Done" },
];

// Form schema with looser types
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.string().default(TASK_STATUS.TODO),
  columnId: z.number(),
  assigneeId: z.string().optional(),
});

export default function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultColumnId = 1,
}: TaskDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get default status - wrapped in useCallback to avoid re-creation on each render
  const getDefaultStatus = useCallback(() => {
    return task?.status || TASK_STATUS.TODO;
  }, [task?.status]);

  // Using any type to bypass TypeScript errors
  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: getDefaultStatus(),
      columnId: task?.columnId || defaultColumnId,
      assigneeId: task?.assigneeId || undefined,
    },
  });

  // Reset form when dialog opens/closes or task changes
  useEffect(() => {
    if (open) {
      form.reset({
        title: task?.title || "",
        description: task?.description || "",
        status: getDefaultStatus(),
        columnId: task?.columnId || defaultColumnId,
        assigneeId: task?.assigneeId || undefined,
      });
    }
  }, [open, task, defaultColumnId, form, getDefaultStatus]);

  // Form submission handler
  const onSubmit = async (data: any) => {
    console.log("Submitting form data:", data);
    setIsSubmitting(true);

    try {
      let response;

      if (task) {
        // Update existing task
        response = await updateTask(task.id, data);
      } else {
        // Create new task
        response = await addTask(data);
      }

      if (response.success) {
        toast.success(
          task ? "Task updated successfully" : "Task created successfully"
        );
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(response.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error submitting task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  const isEditing = !!task;

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          form.reset();
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[400px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Task description (optional)"
                      className="resize-none min-h-[120px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }: any) => (
                <FormItem className="w-full">
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }: any) => (
                <FormItem className="w-full">
                  <FormLabel>Assignee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an assignee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assignees.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={user.avatarUrl}
                                alt={user.name}
                              />
                              <AvatarFallback>{user.initials}</AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <div className="grid grid-cols-2 w-full gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting
                    ? "Saving..."
                    : isEditing
                    ? "Save Changes"
                    : "Create Task"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
