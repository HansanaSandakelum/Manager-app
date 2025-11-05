"use client"

import { useState } from "react"
import Link from "next/link"
import { Trash2, Edit2, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Project } from "@/types"
import { apiDelete } from "@/lib/api-client"

interface ProjectCardProps {
  project: Project
  onRefresh: () => void
}

export default function ProjectCard({ project, onRefresh }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        setIsDeleting(true)
        await apiDelete(`/projects/${project._id}`)
        onRefresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete project")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/dashboard/projects/${project._id}`}>
              <CardTitle className="text-white hover:text-blue-400 cursor-pointer">{project.name}</CardTitle>
            </Link>
            <CardDescription className="text-slate-400">{project.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Users size={16} />
            <span className="text-sm">{project.teamMembers.length} members</span>
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
