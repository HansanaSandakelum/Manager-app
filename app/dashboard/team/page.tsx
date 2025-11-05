"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Users, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet, apiDelete } from "@/lib/api-client";
import type { Project } from "@/types";
import InviteTeamMemberModal from "@/components/team/invite-team-member-modal";
import { useNotifications } from "@/components/notifications/notification-context";

interface TeamMemberWithUser {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  role: string;
}

interface ProjectWithMembers extends Project {
  members: TeamMemberWithUser[];
}

export default function TeamPage() {
  const [projects, setProjects] = useState<ProjectWithMembers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set()
  );
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchProjectsWithMembers();
  }, []);

  const fetchProjectsWithMembers = async () => {
    try {
      setIsLoading(true);
      // Fetch all projects
      const projectsData = await apiGet<{ projects: Project[] }>("/projects");
      const projectsList = projectsData.projects || [];

      // Fetch team members for each project
      const projectsWithMembers = await Promise.all(
        projectsList.map(async (project) => {
          try {
            const teamData = await apiGet<{
              teamMembers: TeamMemberWithUser[];
            }>(`/team/project/${project._id}`);
            return {
              ...project,
              members: teamData.teamMembers || [],
            };
          } catch (err) {
            console.error(
              `Failed to fetch members for project ${project._id}:`,
              err
            );
            return {
              ...project,
              members: [],
            };
          }
        })
      );

      setProjects(projectsWithMembers);

      // Start with all projects collapsed
      setExpandedProjects(new Set());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch team data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberAdded = () => {
    setShowModal(false);
    fetchProjectsWithMembers();
  };

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const handleRemoveMember = async (
    teamMemberId: string,
    projectId: string
  ) => {
    if (
      !confirm(
        "Are you sure you want to remove this team member from the project?"
      )
    ) {
      return;
    }

    // Get member info before deletion for notification
    const project = projects.find((p) => p._id === projectId);
    const member = project?.members.find((m) => m._id === teamMemberId);

    try {
      setDeletingMemberId(teamMemberId);
      await apiDelete(`/team/${teamMemberId}`);

      // Update local state
      setProjects(
        projects.map((project) => {
          if (project._id === projectId) {
            return {
              ...project,
              members: project.members.filter(
                (member) => member._id !== teamMemberId
              ),
            };
          }
          return project;
        })
      );

      // Add success notification
      const memberName = member?.user?.name || "Unknown User";
      const projectName = project?.name || "Unknown Project";
      addNotification({
        type: "warning",
        title: "Team Member Removed",
        message: `${memberName} has been removed from "${projectName}"`,
        operation: "delete",
        entity: "team",
        entityId: teamMemberId,
      });
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to remove team member"
      );

      // Add error notification
      addNotification({
        type: "error",
        title: "Team Member Removal Failed",
        message:
          err instanceof Error ? err.message : "Failed to remove team member",
        operation: "delete",
        entity: "team",
        entityId: teamMemberId,
      });
    } finally {
      setDeletingMemberId(null);
    }
  };

  const getTotalMembers = () => {
    const uniqueUsers = new Set<string>();
    projects.forEach((project) => {
      project.members.forEach((member) => {
        if (member.user && member.user._id) {
          uniqueUsers.add(member.user._id);
        }
      });
    });
    return uniqueUsers.size;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Members</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {getTotalMembers()} unique members · {projects.length}{" "}
            {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Invite Member
        </Button>
      </div>

      {error && (
        <Card className="bg-red-500/10 border-red-500/50">
          <CardContent className="p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-slate-400 text-sm">Loading team data...</div>
      ) : projects.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-400 mb-3" />
            <p className="text-slate-400 text-sm">
              No projects yet. Create a project first to invite team members.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => {
            const isExpanded = expandedProjects.has(project._id);
            return (
              <Card key={project._id} className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 -m-2 p-2 rounded transition-colors"
                    onClick={() => toggleProjectExpansion(project._id)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown size={20} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={20} className="text-slate-400" />
                      )}
                      <div>
                        <h2 className="text-lg font-semibold text-white">
                          {project.name}
                        </h2>
                        <p className="text-xs text-slate-400 font-normal">
                          {project.members.length}{" "}
                          {project.members.length === 1 ? "member" : "members"}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      Click to {isExpanded ? "collapse" : "expand"}
                    </div>
                  </CardTitle>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="pt-0">
                    {project.members.length === 0 ? (
                      <div className="text-slate-400 text-sm text-center py-4 border-t border-slate-700">
                        No team members in this project yet.
                      </div>
                    ) : (
                      <div className="border-t border-slate-700 pt-4">
                        <div className="grid gap-3">
                          {project.members.map((member) => (
                            <div
                              key={member._id}
                              className="bg-slate-900/50 border border-slate-600 rounded-lg p-3 flex items-center justify-between hover:border-slate-500 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-medium text-sm text-white truncate">
                                    {member.user?.name || "Unknown User"}
                                  </h3>
                                  <p className="text-xs text-slate-400 truncate">
                                    {member.user?.email || "No email"}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium uppercase tracking-wide shrink-0 ${
                                    member.role === "owner"
                                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                      : member.role === "admin"
                                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                      : "bg-green-500/20 text-green-300 border border-green-500/30"
                                  }`}
                                >
                                  {member.role}
                                </span>
                              </div>
                              {member.role !== "owner" && (
                                <button
                                  onClick={() =>
                                    handleRemoveMember(member._id, project._id)
                                  }
                                  disabled={deletingMemberId === member._id}
                                  className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-500/10 transition-colors disabled:opacity-50 shrink-0 ml-2"
                                  title="Remove member"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {showModal && (
        <InviteTeamMemberModal
          onClose={() => setShowModal(false)}
          onSuccess={handleMemberAdded}
        />
      )}
    </div>
  );
}
