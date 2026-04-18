import { useState, useEffect } from "react";
import { notificationRepository } from "@/data/repositories/FirebaseNotificationRepository";
import type { Notification } from "@/domain/entities/Notification";

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = notificationRepository.subscribeToUserNotifications(
      userId,
      (data) => {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = async (id: string) => {
    await notificationRepository.markAsRead(id);
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    await notificationRepository.markAllAsRead(userId);
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
