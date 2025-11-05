"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X, Check, CheckCheck, Trash2 } from "lucide-react";
import { useNotifications } from "./notification-context";
import type { Notification } from "@/types";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "error":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "warning":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "info":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 className="text-white font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Clear all
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-xs mt-1">CRUD operations will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-slate-700/50 transition-colors ${
                      !notification.read ? "bg-slate-700/20" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        <span className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white truncate">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${getNotificationColor(
                                  notification.type
                                )}`}
                              >
                                {notification.operation.toUpperCase()}{" "}
                                {notification.entity}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {formatTime(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="text-slate-400 hover:text-white p-1"
                                title="Mark as read"
                              >
                                <Check size={12} />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                clearNotification(notification._id)
                              }
                              className="text-slate-400 hover:text-red-400 p-1"
                              title="Delete notification"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
