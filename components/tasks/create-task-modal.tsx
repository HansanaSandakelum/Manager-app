"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Task, Project, User } from "@/types";
import { apiPost, apiGet } from "@/lib/api-client";
import { useNotifications } from "@/components/notifications/notification-context";

interface CreateTaskModalProps {
  onClose: () => void;
  onSuccess: (task: Task) => void;
}

export default function CreateTaskModal({
  onClose,
  onSuccess,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [project, setProject] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
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
      const response = await apiPost<{ task: Task }>("/tasks", {
        title,
        description,
        priority,
        dueDate: new Date(dueDate).toISOString(),
        project: project,
        assignedTo: assignedTo,
      });
      onSuccess(response.task);

      // Add success notification
      addNotification({
        type: "success",
        title: "Task Created",
        message: `Task "${title}" has been created and assigned successfully`,
        operation: "create",
        entity: "task",
        entityId: response.task._id,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");

      // Add error notification
      addNotification({
        type: "error",
        title: "Task Creation Failed",
        message: err instanceof Error ? err.message : "Failed to create task",
        operation: "create",
        entity: "task",
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
            <h2 className="text-xl font-bold text-white">Create New Task</h2>
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Task Title
              </label>
              <Input
                type="text"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-slate-600 bg-slate-900/50 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Description
              </label>
              <textarea
                placeholder="Task description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-slate-600 bg-slate-900/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Project
              </label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full p-2 border border-slate-600 bg-slate-900/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Assigned To
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full p-2 border border-slate-600 bg-slate-900/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select user to assign</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as "low" | "medium" | "high")
                  }
                  className="w-full p-2 border border-slate-600 bg-slate-900/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="border-slate-600 bg-slate-900/50 text-white"
                  required
                />
              </div>
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
                {isLoading ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
