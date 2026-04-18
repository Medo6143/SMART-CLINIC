export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName?: string;
  text: string;
  imageUrl: string | null;
  type?: "text" | "image" | "system";
  deleted?: boolean;
  deletedAt?: Date | null;
  /** Map of emoji -> array of user UIDs who reacted */
  reactions?: Record<string, string[]>;
  createdAt: Date;
}
