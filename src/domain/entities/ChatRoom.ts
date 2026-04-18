export interface ChatRoom {
  id: string;
  clinicId: string;
  participants: string[];
  participantNames?: Record<string, string>;
  lastMessage: string | null;
  lastSenderId?: string | null;
  appointmentId?: string | null;
  /** Map of userId -> ISO timestamp of last read */
  readBy?: Record<string, string>;
  /** Computed client-side: number of unread messages for current user */
  unreadCount?: number;
  updatedAt: Date;
  createdAt: Date;
}
