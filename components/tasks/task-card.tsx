"use client"

import { useState } from "react"
import { Trash2, Edit2, CheckCircle2, Circle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Task } from "@/types"
import { apiDelete, apiPut } from "@/lib/api-client"

interface TaskCardProps {
  task: Task
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
}

export default function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleStatus = async () => {
    try {
      setIsUpdating(true)
      const newStatus = task.status === "completed" ? "todo" : "completed"
      const updatedTask = await apiPut<Task>(`/tasks/${task._id}`, {
        status: newStatus,
      })
      onUpdate(updatedTask)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update task")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        setIsDeleting(true)
        await apiDelete(`/tasks/${task._id}`)
        onDelete(task._id)
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete task")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const priorityColors = {
    low: "text-green-400",
    medium: "text-yellow-400",
    high: "text-red-400",
  }

  const statusColors = {
    todo: "text-slate-400",
    "in-progress": "text-blue-400",
    completed: "text-green-400",
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed"

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <button
            onClick={handleToggleStatus}
            disabled={isUpdating}
            className="mt-1 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            {task.status === "completed" ? <CheckCircle2 size={20} className="text-green-400" /> : <Circle size={20} />}
          </button>

          <div className="flex-1">
            <div
              className={`font-semibold ${task.status === "completed" ? "text-slate-500 line-through" : "text-white"}`}
            >
              {task.title}
            </div>
            {task.description && <p className="text-sm text-slate-400 mt-1">{task.description}</p>}

            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className={`text-xs font-semibold uppercase ${statusColors[task.status]}`}>
                {task.status.replace("-", " ")}
              </span>
              <span className={`text-xs font-semibold uppercase ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              {task.dueDate && (
                <span className={`text-xs ${isOverdue ? "text-red-400" : "text-slate-400"}`}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
              <Edit2 size={16} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
