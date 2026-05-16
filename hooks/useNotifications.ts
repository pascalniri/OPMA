import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

export type NotificationType = "VERIFICATION" | "DEADLINE" | "COMMENT" | "ASSIGNMENT";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  payload: Record<string, unknown> | null;
  read: boolean;
  userId: string;
  createdAt: string;
}

export default function useNotifications(unreadOnly = false) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (unreadOnly) params.set("unreadOnly", "true");
      const res = await api.get(`/api/notifications?${params.toString()}`);
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async (id: string): Promise<void> => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api.patch(`/api/notifications/${id}`);
    } catch (err: any) {
      // Rollback
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
      setUnreadCount((c) => c + 1);
      toast.error(err.response?.data?.error || "Failed to mark notification as read");
      throw err;
    }
  };

  const markAllRead = async (): Promise<void> => {
    const tid = toast.loading("Marking all as read...");
    const prev = notifications;
    const prevCount = unreadCount;
    setNotifications((n) => n.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    try {
      await api.patch("/api/notifications");
      toast.success("All notifications marked as read", { id: tid });
    } catch (err: any) {
      setNotifications(prev);
      setUnreadCount(prevCount);
      toast.error(err.response?.data?.error || "Failed to mark all as read", { id: tid });
      throw err;
    }
  };

  // Called by useEvents when a new notification arrives via SSE
  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((c) => c + 1);
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markRead,
    markAllRead,
    addNotification,
    refresh: fetchNotifications,
  };
}
