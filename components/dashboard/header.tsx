"use client";

import { useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import type { User } from "@/types";
import NotificationDropdown from "@/components/notifications/notification-dropdown";
import { useAuth } from "@/contexts/auth-context";

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
      <div className="text-slate-400">
        Welcome back,{" "}
        <span className="text-white font-semibold">{user?.name}</span>
      </div>

      <div className="flex items-center gap-4">
        <NotificationDropdown />
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
          <Settings size={20} />
        </button>
        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
