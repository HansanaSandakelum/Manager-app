"use client";

import { useState } from "react";
import { Trash2, CheckCircle2, Circle, Edit2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Task } from "@/types";
import { apiDelete, apiPut } from "@/lib/api-client";
import { useNotifications } from "@/components/notifications/notification-context";
import EditTaskModal from "./edit-task-modal";

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { addNotification } = useNotifications();

  const handleToggleStatus = async () => {
    try {
      setIsUpdating(true);
      const newStatus = task.status === "completed" ? "todo" : "completed";
      const response = await apiPut<{ task: Task }>(`/tasks/${task._id}`, {
        status: newStatus,
      });
      onUpdate(response.task);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (
    newStatus: "todo" | "in-progress" | "completed"
  ) => {
    if (newStatus === task.status) return;

    try {
      setIsUpdating(true);
      const response = await apiPut<{ task: Task }>(`/tasks/${task._id}`, {
        status: newStatus,
      });
      onUpdate(response.task);

      // Add success notification
      addNotification({
        type: "success",
        title: "Task Status Updated",
        message: `Task "${task.title}" status changed to ${newStatus.replace(
          "-",
          " "
        )}`,
        operation: "update",
        entity: "task",
        entityId: task._id,
      });
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to update task status"
      );

      // Add error notification
      addNotification({
        type: "error",
        title: "Task Update Failed",
        message:
          err instanceof Error ? err.message : "Failed to update task status",
        operation: "update",
        entity: "task",
        entityId: task._id,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        setIsDeleting(true);
        await apiDelete(`/tasks/${task._id}`);
        onDelete(task._id);

        // Add success notification
        addNotification({
          type: "warning",
          title: "Task Deleted",
          message: `Task "${task.title}" has been deleted`,
          operation: "delete",
          entity: "task",
          entityId: task._id,
        });
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete task");

        // Add error notification
        addNotification({
          type: "error",
          title: "Task Deletion Failed",
          message: err instanceof Error ? err.message : "Failed to delete task",
          operation: "delete",
          entity: "task",
          entityId: task._id,
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const priorityColors = {
    low: "bg-green-500/20 text-green-300 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    high: "bg-red-500/20 text-red-300 border-red-500/30",
  };

  const statusColors = {
    todo: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    "in-progress": "bg-blue-500/20 text-blue-300 border-blue-500/30",
    completed: "bg-green-500/20 text-green-300 border-green-500/30",
  };

  const isOverdue =
    new Date(task.dueDate) < new Date() && task.status !== "completed";

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
      <CardContent className="p-3 relative">
        <div className="flex items-start gap-3">
          <button
            onClick={handleToggleStatus}
            disabled={isUpdating}
            className="mt-0.5 text-slate-400 hover:text-white transition-colors disabled:opacity-50 shrink-0"
          >
            {task.status === "completed" ? (
              <CheckCircle2 size={18} className="text-green-400" />
            ) : (
              <Circle size={18} />
            )}
          </button>

          <div className="flex-1 min-w-0 pr-8">
            <h3
              className={`font-semibold text-sm mb-1 ${
                task.status === "completed"
                  ? "text-slate-500 line-through"
                  : "text-white"
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={task.status}
                onChange={(e) =>
                  handleStatusChange(
                    e.target.value as "todo" | "in-progress" | "completed"
                  )
                }
                disabled={isUpdating}
                className={`text-[10px] font-medium uppercase px-2 py-0.5 border rounded bg-slate-900 text-slate-300 border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50`}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase border ${
                  priorityColors[task.priority]
                }`}
              >
                {task.priority}
              </span>

              {task.dueDate && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                    isOverdue
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  📅{" "}
                  {new Date(task.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-1 right-2 flex gap-1">
          <button
            onClick={() => setShowEditModal(true)}
            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors shrink-0"
            title="Edit task"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50 shrink-0"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </CardContent>

      {showEditModal && (
        <EditTaskModal
          task={task}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updatedTask) => {
            setShowEditModal(false);
            onUpdate(updatedTask);
          }}
        />
      )}
    </Card>
  );
}
