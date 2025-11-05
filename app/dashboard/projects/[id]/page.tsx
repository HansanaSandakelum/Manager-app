"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiGet } from "@/lib/api-client"
import type { Project } from "@/types"

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true)
        const data = await apiGet<Project>(`/projects/${projectId}`)
        setProject(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch project")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  if (isLoading) {
    return <div className="text-slate-400">Loading project...</div>
  }

  if (error) {
    return <div className="text-red-400">{error}</div>
  }

  if (!project) {
    return <div className="text-slate-400">Project not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <button className="p-2 hover:bg-slate-700 rounded transition-colors">
            <ArrowLeft className="text-slate-400" size={20} />
          </button>
        </Link>
        <h1 className="text-3xl font-bold text-white">{project.name}</h1>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-400">Description</p>
            <p className="text-white">{project.description}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Team Members</p>
            <p className="text-white">{project.teamMembers.length} members</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Created</p>
            <p className="text-white">{new Date(project.createdAt).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Tasks</CardTitle>
          <CardDescription>Tasks in this project will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">No tasks yet</p>
        </CardContent>
      </Card>
    </div>
  )
}
