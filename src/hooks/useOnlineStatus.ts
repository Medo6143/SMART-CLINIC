import { useEffect } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Collections } from "@/constants/collections";

/**
 * Hook to track user's online status.
 * Updates lastOnlineAt timestamp periodically when user is active.
 */
export function useOnlineStatus(userId: string | null) {
  useEffect(() => {
    if (!userId) return;

    const updateLastOnline = async () => {
      try {
        const userRef = doc(db, Collections.USERS, userId);
        await updateDoc(userRef, {
          lastOnlineAt: new Date().toISOString(),
          // Also update Firestore server timestamp for accuracy
          lastOnlineServerTime: serverTimestamp(),
        });
      } catch (err) {
        // Silently fail - don't block user experience
        console.debug("Failed to update online status:", err);
      }
    };

    // Update immediately on mount
    updateLastOnline();

    // Update every 1 minute while active
    const interval = setInterval(updateLastOnline, 1 * 60 * 1000);

    // Update on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateLastOnline();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId]);
}

/**
 * Format last online time to a human-readable string
 */
export function formatLastOnline(lastOnlineAt: string | null | undefined): string {
  if (!lastOnlineAt) return "—";

  const lastOnline = new Date(lastOnlineAt);
  const now = new Date();
  const diffMs = now.getTime() - lastOnline.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Consider online if active within last 3 minutes
  if (diffMins < 3) return "Active now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return lastOnline.toLocaleDateString();
}
