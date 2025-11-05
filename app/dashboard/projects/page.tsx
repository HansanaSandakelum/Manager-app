"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet } from "@/lib/api-client";
import type { Project } from "@/types";
import CreateProjectModal from "@/components/projects/create-project-modal";
import ProjectCard from "@/components/projects/project-card";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet<{ projects: Project[] }>("/projects");
      setProjects(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects([...projects, newProject]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={20} className="mr-2" />
          New Project
        </Button>
      </div>

      {error && (
        <Card className="bg-red-500/10 border-red-500/50">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-slate-400">Loading projects...</div>
      ) : projects.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-400 mb-4">
              No projects yet. Create your first project to get started.
            </p>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onRefresh={fetchProjects}
            />
          ))}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onSuccess={handleProjectCreated}
        />
      )}
    </div>
  );
}
