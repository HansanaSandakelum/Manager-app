"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { Notification } from "@/types";

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "_id" | "timestamp" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notificationData: Omit<Notification, "_id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notificationData,
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Auto-remove after 5 seconds for success notifications
      if (notificationData.type === "success") {
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((n) => n._id !== newNotification._id)
          );
        }, 5000);
      }
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification._id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification._id !== id)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
