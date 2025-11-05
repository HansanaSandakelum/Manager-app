"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet } from "@/lib/api-client";
import type { Task } from "@/types";
import CreateTaskModal from "@/components/tasks/create-task-modal";
import TaskCard from "@/components/tasks/task-card";

type FilterStatus = "all" | "todo" | "in-progress" | "completed";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter((t) => t.status === filterStatus));
    }
  }, [tasks, filterStatus]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet<{ tasks: Task[] }>("/tasks");
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks([...tasks, newTask]);
    setShowModal(false);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks(tasks.filter((t) => t._id !== taskId));
  };

  const statusCounts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Tasks</h1>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={20} className="mr-2" />
          New Task
        </Button>
      </div>

      {error && (
        <Card className="bg-red-500/10 border-red-500/50">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "todo", "in-progress", "completed"] as FilterStatus[]).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filterStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {status} ({statusCounts[status]})
            </button>
          )
        )}
      </div>

      {isLoading ? (
        <div className="text-slate-400">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-400 mb-4">
              No tasks found. Create your first task to get started.
            </p>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onUpdate={handleTaskUpdated}
              onDelete={handleTaskDeleted}
            />
          ))}
        </div>
      )}

      {showModal && (
        <CreateTaskModal
          onClose={() => setShowModal(false)}
          onSuccess={handleTaskCreated}
        />
      )}
    </div>
  );
}
