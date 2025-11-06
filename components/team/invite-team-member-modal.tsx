"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { User, Project } from "@/types";
import { apiPost, apiGet } from "@/lib/api-client";
import { useNotifications } from "@/components/notifications/notification-context";
import { useAuth } from "@/contexts/auth-context";

interface InviteTeamMemberModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export default function InviteTeamMemberModal({
  onClose,
  onSuccess,
}: InviteTeamMemberModalProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState("member");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { addNotification } = useNotifications();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiGet<{ users: User[] }>("/users");
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await apiGet<{ projects: Project[] }>("/projects");
      const allProjects = data.projects || [];

      // Get current user from auth context
      if (currentUser) {
        // Filter to only show projects owned by current user
        const ownedProjects = allProjects.filter((project) => {
          // Handle both string owner ID and populated owner object
          const ownerId =
            typeof project.owner === "string"
              ? project.owner
              : (project.owner as any)?._id;
          return ownerId === currentUser._id;
        });
        setProjects(ownedProjects);
      } else {
        setProjects(allProjects);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedUserId) {
      setError("Please select a user to invite");
      return;
    }

    if (!projectId) {
      setError("Please select a project");
      return;
    }

    // Get selected user details
    const selectedUser = users.find((u) => u._id === selectedUserId);
    if (!selectedUser) {
      setError("Selected user not found");
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiPost<{ teamMember: any }>("/team/invite", {
        email: selectedUser.email,
        projectId: projectId,
        role,
      });
      onSuccess(response.teamMember.user);

      // Add success notification
      const projectName =
        projects.find((p) => p._id === projectId)?.name || "Unknown Project";
      addNotification({
        type: "success",
        title: "Team Member Invited",
        message: `${selectedUser.name} has been invited to join "${projectName}" as ${role}`,
        operation: "create",
        entity: "team",
        entityId: response.teamMember._id,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to invite team member";
      setError(errorMessage);

      // Add error notification with more context
      addNotification({
        type: "error",
        title: "Team Invitation Failed",
        message:
          errorMessage === "You do not have permission to invite team members"
            ? "You must be a project owner or admin to invite team members. Only projects you created or manage allow invitations."
            : errorMessage,
        operation: "create",
        entity: "team",
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
            <h2 className="text-xl font-bold text-white">Invite Team Member</h2>
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
                Select User to Invite
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full p-2 border border-slate-600 bg-slate-900/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full p-2 border border-slate-600 bg-slate-900/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a project </option>
                {projects.length === 0 ? (
                  <option value="" disabled>
                    No projects found - Create a project first
                  </option>
                ) : (
                  projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))
                )}
              </select>
              {projects.length === 0 && (
                <p className="text-xs text-yellow-400 mt-1">
                  ⚠️ You need to create a project first to invite team members
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border border-slate-600 bg-slate-900/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
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
                {isLoading ? "Inviting..." : "Send Invite"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
