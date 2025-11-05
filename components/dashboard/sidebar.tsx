"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  BarChart3,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: FolderOpen },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/team", label: "Team", icon: Users },
  // { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-700">
        <h1 className="text-3xl font-bold text-blue-400 ">PM</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {/* <div className="p-4 border-t border-slate-700">
        <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors text-sm font-medium">
          Sign Out
        </button>
      </div> */}
    </aside>
  );
}
