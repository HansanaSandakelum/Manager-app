"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Project, User } from "@/types";
import { apiPut, apiGet, apiPost, apiDelete } from "@/lib/api-client";
import { useNotifications } from "@/components/notifications/notification-context";

interface TeamMemberWithUser {
  _id: string;
  user: User;
  role: string;
}

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

export default function EditProjectModal({
  project,
  onClose,
  onSuccess,
}: EditProjectModalProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isDeletingMember, setIsDeletingMember] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchUsers();
    fetchProjectMembers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiGet<{ users: User[] }>("/users");
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchProjectMembers = async () => {
    try {
      const data = await apiGet<{ teamMembers: TeamMemberWithUser[] }>(
        `/team/project/${project._id}`
      );
      setTeamMembers(data.teamMembers || []);
    } catch (err) {
      console.error("Failed to fetch project members:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    if (!description.trim()) {
      setError("Project description is required");
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiPut<{ project: Project }>(
        `/projects/${project._id}`,
        {
          name,
          description,
        }
      );
      onSuccess(response.project);

      // Add success notification
      addNotification({
        type: "success",
        title: "Project Updated",
        message: `Project "${name}" has been updated successfully`,
        operation: "update",
        entity: "project",
        entityId: project._id,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");

      // Add error notification
      addNotification({
        type: "error",
        title: "Project Update Failed",
        message:
          err instanceof Error ? err.message : "Failed to update project",
        operation: "update",
        entity: "project",
        entityId: project._id,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) {
      setError("Please select a user to add");
      return;
    }

    const selectedUser = users.find((u) => u._id === selectedUserId);
    if (!selectedUser) return;

    // Check if user is already a member
    if (teamMembers.some((member) => member.user._id === selectedUserId)) {
      setError("User is already a member of this project");
      return;
    }

    try {
      setIsAddingMember(true);
      setError("");

      const response = await apiPost<{ teamMember: TeamMemberWithUser }>(
        "/team/invite",
        {
          email: selectedUser.email,
          projectId: project._id,
          role: "member",
        }
      );

      // Add to local state
      setTeamMembers([...teamMembers, response.teamMember]);
      setSelectedUserId("");

      // Add success notification
      addNotification({
        type: "success",
        title: "Team Member Added",
        message: `${selectedUser.name} has been added to "${project.name}"`,
        operation: "create",
        entity: "team",
        entityId: response.teamMember._id,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");

      // Add error notification
      addNotification({
        type: "error",
        title: "Team Member Addition Failed",
        message:
          err instanceof Error ? err.message : "Failed to add team member",
        operation: "create",
        entity: "team",
      });
    } finally {
      setIsAddingMember(false);
    }
  };

  const availableUsers = users.filter(
    (user) => !teamMembers.some((member) => member.user._id === user._id)
  );

  const handleRemoveMember = async (teamMemberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) {
      return;
    }

    // Get member info before deletion for notification
    const member = teamMembers.find((m) => m._id === teamMemberId);

    try {
      setIsDeletingMember(teamMemberId);
      await apiDelete(`/team/${teamMemberId}`);

      // Remove from local state
      setTeamMembers(
        teamMembers.filter((member) => member._id !== teamMemberId)
      );

      // Add success notification
      const memberName = member?.user?.name || "Unknown User";
      addNotification({
        type: "warning",
        title: "Team Member Removed",
        message: `${memberName} has been removed from "${project.name}"`,
        operation: "delete",
        entity: "team",
        entityId: teamMemberId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");

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
      setIsDeletingMember(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Edit Project</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">
                Project Details
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Project Name
                </label>
                <Input
                  type="text"
                  placeholder="My Awesome Project"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-slate-600 bg-slate-900/50 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Description
                </label>
                <textarea
                  placeholder="Project description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-slate-600 bg-slate-900/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Team Members</h3>

              {/* Add Member */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Add Team Member
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="flex-1 p-2 border border-slate-600 bg-slate-900/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a user</option>
                    {availableUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={handleAddMember}
                    disabled={isAddingMember || !selectedUserId}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              {/* Current Members */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Current Members ({teamMembers.length})
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {teamMembers.length === 0 ? (
                    <p className="text-slate-400 text-sm">
                      No team members yet
                    </p>
                  ) : (
                    teamMembers.map((teamMember) => (
                      <div
                        key={teamMember._id}
                        className="flex items-center justify-between p-2 bg-slate-700 rounded"
                      >
                        <div>
                          <p className="text-white font-medium">
                            {teamMember.user.name}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {teamMember.user.email}
                          </p>
                          <p className="text-slate-500 text-xs capitalize">
                            {teamMember.role}
                          </p>
                        </div>
                        {teamMember.role !== "owner" && (
                          <button
                            onClick={() => handleRemoveMember(teamMember._id)}
                            disabled={isDeletingMember === teamMember._id}
                            className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
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
                {isLoading ? "Updating..." : "Update Project"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
