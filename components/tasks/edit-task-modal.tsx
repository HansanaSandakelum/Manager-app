"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Task, Project, User } from "@/types";
import { apiPut, apiGet } from "@/lib/api-client";
import { useNotifications } from "@/components/notifications/notification-context";

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
  onSuccess: (task: Task) => void;
}

export default function EditTaskModal({
  task,
  onClose,
  onSuccess,
}: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    task.priority
  );
  const [status, setStatus] = useState<"todo" | "in-progress" | "completed">(
    task.status
  );
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );
  const [project, setProject] = useState(
    typeof task.project === "string"
      ? task.project
      : (task.project as any)?._id || ""
  );
  const [assignedTo, setAssignedTo] = useState(
    typeof task.assignedTo === "string"
      ? task.assignedTo
      : (task.assignedTo as any)?._id || ""
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await apiGet<{ projects: Project[] }>("/projects");
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiGet<{ users: User[] }>("/users");
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    if (!description.trim()) {
      setError("Task description is required");
      return;
    }

    if (!dueDate) {
      setError("Due date is required");
      return;
    }

    if (!project) {
      setError("Please select a project");
      return;
    }

    if (!assignedTo) {
      setError("Please select an assigned user");
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiPut<{ task: Task }>(`/tasks/${task._id}`, {
        title,
        description,
        priority,
        status,
        dueDate: new Date(dueDate).toISOString(),
        project: project,
        assignedTo: assignedTo,
      });

      // Add success notification
      addNotification({
        type: "success",
        title: "Task Updated",
        message: `Task "${title}" has been updated successfully`,
        operation: "update",
        entity: "task",
        entityId: task._id,
      });

      onSuccess(response.task);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update task";
      setError(errorMessage);

      // Add error notification
      addNotification({
        type: "error",
        title: "Task Update Failed",
        message: errorMessage,
        operation: "update",
        entity: "task",
        entityId: task._id,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Edit Task</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Task Title <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                className="border-slate-600 bg-slate-900 text-white placeholder:text-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                rows={3}
                className="w-full px-3 py-2 border border-slate-600 bg-slate-900 text-white placeholder:text-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as "low" | "medium" | "high")
                  }
                  className="w-full px-3 py-2 border border-slate-600 bg-slate-900 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value as "todo" | "in-progress" | "completed"
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-600 bg-slate-900 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Due Date <span className="text-red-400">*</span>
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border-slate-600 bg-slate-900 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Project <span className="text-red-400">*</span>
              </label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-600 bg-slate-900 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a project</option>
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Assigned To <span className="text-red-400">*</span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-600 bg-slate-900 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? "Updating..." : "Update Task"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
