"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiGet } from "@/lib/api-client";
import type { Analytics, Project, Task } from "@/types";
import {
  TrendingUp,
  CheckCircle,
  Users,
  AlertCircle,
  Calendar,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch analytics
        const analyticsData = await apiGet<Analytics>("/analytics");
        setAnalytics(analyticsData);

        // Fetch recent projects (last 5 updated)
        const projectsData = await apiGet<{ projects: Project[] }>(
          "/projects?limit=5"
        );
        setRecentProjects(projectsData.projects || []);

        // Fetch upcoming tasks (non-completed tasks, limit 10, then filter on frontend)
        const tasksData = await apiGet<{ tasks: Task[] }>(
          "/tasks?status=todo&status=in-progress&limit=20&sortBy=dueDate&sortOrder=asc"
        );
        const allTasks = tasksData.tasks || [];

        // Filter tasks due in next 7 days on frontend
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const upcoming = allTasks
          .filter((task) => {
            const dueDate = new Date(task.dueDate);
            return dueDate <= nextWeek;
          })
          .slice(0, 5); // Take only first 5

        setUpcomingTasks(upcoming);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch dashboard data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="text-slate-400">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <TrendingUp className="text-blue-400" size={18} />
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {analytics?.totalProjects || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <CheckCircle className="text-green-400" size={18} />
              Completed Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {analytics?.completedTasks || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <Users className="text-purple-400" size={18} />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {analytics?.teamMembersCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <AlertCircle className="text-orange-400" size={18} />
              Overdue Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {analytics?.tasksOverdue || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects and Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FolderOpen className="text-blue-400" size={20} />
              Recent Projects
            </CardTitle>
            <CardDescription>Your recently updated projects</CardDescription>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <p className="text-slate-400">No recent projects</p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Link
                    key={project._id}
                    href={`/dashboard/projects/${project._id}`}
                    className="block p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-white hover:text-blue-400">
                          {project.name}
                        </h4>
                        <p className="text-sm text-slate-400 line-clamp-1">
                          {project.description}
                        </p>
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="text-orange-400" size={20} />
              Upcoming Tasks
            </CardTitle>
            <CardDescription>Tasks due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-slate-400">No upcoming tasks</p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => {
                  const isOverdue = new Date(task.dueDate) < new Date();
                  return (
                    <div
                      key={task._id}
                      className="p-3 bg-slate-700/50 rounded-lg border-l-4 border-orange-400"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">
                            {task.title}
                          </h4>
                          <p className="text-sm text-slate-400 line-clamp-1">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                task.priority === "high"
                                  ? "bg-red-500/20 text-red-300"
                                  : task.priority === "medium"
                                  ? "bg-yellow-500/20 text-yellow-300"
                                  : "bg-green-500/20 text-green-300"
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span
                              className={`text-xs ${
                                isOverdue ? "text-red-400" : "text-slate-400"
                              }`}
                            >
                              📅 {new Date(task.dueDate).toLocaleDateString()}
                              {isOverdue && " (Overdue)"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
