export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: string;
  teamMembers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  project: string;
  assignedTo: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  _id: string;
  user: string;
  project: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

export interface Analytics {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  teamMembersCount: number;
  tasksOverdue: number;
}

export interface Notification {
  _id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  operation: "create" | "update" | "delete";
  entity: "project" | "task" | "team" | "user";
  entityId?: string;
  timestamp: string;
  read: boolean;
}
