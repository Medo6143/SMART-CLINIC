import type { ChatRoom } from "../entities/ChatRoom";
import type { Message } from "../entities/Message";

export interface ChatRepository {
  getRooms(userId: string): Promise<ChatRoom[]>;
  getOrCreateRoom(
    participants: string[],
    clinicId: string,
    opts?: { participantNames?: Record<string, string> }
  ): Promise<string>;
  sendMessage(roomId: string, senderId: string, text: string, imageUrl?: string): Promise<void>;
  markRoomRead(roomId: string, userId: string): Promise<void>;
  toggleReaction(roomId: string, messageId: string, emoji: string, userId: string): Promise<void>;
  deleteMessage(roomId: string, messageId: string): Promise<void>;
  deleteRoom(roomId: string): Promise<void>;
  subscribeToMessages(
    roomId: string,
    callback: (messages: Message[]) => void
  ): () => void;
  subscribeToRooms(
    userId: string,
    callback: (rooms: ChatRoom[]) => void
  ): () => void;
}
