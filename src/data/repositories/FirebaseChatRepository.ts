import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { app } from "@/lib/firebase/config";
import { ChatRoom } from "@/domain/entities/ChatRoom";
import { Message } from "@/domain/entities/Message";
import { ChatRepository } from "@/domain/repositories/ChatRepository";

export class FirebaseChatRepository implements ChatRepository {
  private db = getFirestore(app);
  private roomsCollection = "chatRooms";
  private messagesCollection = "messages";

  async getRooms(userId: string): Promise<ChatRoom[]> {
    const colRef = collection(this.db, this.roomsCollection);
    const q = query(colRef, where("participants", "array-contains", userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => this.mapDocToRoom(d.id, d.data()));
  }

  async getOrCreateRoom(
    participants: string[],
    clinicId: string,
    opts?: { participantNames?: Record<string, string> }
  ): Promise<string> {
    const colRef = collection(this.db, this.roomsCollection);
    const sorted = [...participants].sort();
    const q = query(
      colRef,
      where("participants", "==", sorted),
      where("clinicId", "==", clinicId)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      return snap.docs[0].id;
    }

    const docRef = await addDoc(colRef, {
      participants: sorted,
      participantNames: opts?.participantNames ?? {},
      clinicId,
      lastMessage: null,
      lastSenderId: null,
      readBy: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  }

  async sendMessage(
    roomId: string,
    senderId: string,
    text: string,
    imageUrl: string | null = null
  ): Promise<void> {
    const messagesRef = collection(this.db, this.roomsCollection, roomId, this.messagesCollection);
    await addDoc(messagesRef, {
      senderId,
      text,
      imageUrl,
      createdAt: serverTimestamp(),
    });

    const roomRef = doc(this.db, this.roomsCollection, roomId);
    await updateDoc(roomRef, {
      lastMessage: text,
      lastSenderId: senderId,
      updatedAt: serverTimestamp(),
    });
  }

  /** Mark a room as read by a user. */
  async markRoomRead(roomId: string, userId: string): Promise<void> {
    await updateDoc(doc(this.db, this.roomsCollection, roomId), {
      [`readBy.${userId}`]: new Date().toISOString(),
    });
  }

  /** Toggle an emoji reaction on a message. */
  async toggleReaction(roomId: string, messageId: string, emoji: string, userId: string): Promise<void> {
    const msgRef = doc(this.db, this.roomsCollection, roomId, this.messagesCollection, messageId);
    const msgSnap = await getDoc(msgRef);
    if (!msgSnap.exists()) return;
    const reactions: Record<string, string[]> = msgSnap.data().reactions || {};
    const users = reactions[emoji] || [];
    if (users.includes(userId)) {
      await updateDoc(msgRef, { [`reactions.${emoji}`]: arrayRemove(userId) });
    } else {
      await updateDoc(msgRef, { [`reactions.${emoji}`]: arrayUnion(userId) });
    }
  }

  /** Soft-delete a message (marks as deleted for both sides). */
  async deleteMessage(roomId: string, messageId: string): Promise<void> {
    const msgRef = doc(this.db, this.roomsCollection, roomId, this.messagesCollection, messageId);
    await updateDoc(msgRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      text: "",
      imageUrl: null,
    });
  }

  /** Delete an entire chat room and all its messages. */
  async deleteRoom(roomId: string): Promise<void> {
    const msgsRef = collection(this.db, this.roomsCollection, roomId, this.messagesCollection);
    const msgsSnap = await getDocs(msgsRef);
    const batch = writeBatch(this.db);
    msgsSnap.docs.forEach(d => batch.delete(d.ref));
    if (!msgsSnap.empty) await batch.commit();
    await deleteDoc(doc(this.db, this.roomsCollection, roomId));
  }

  subscribeToMessages(roomId: string, callback: (messages: Message[]) => void): () => void {
    const colRef = collection(this.db, this.roomsCollection, roomId, this.messagesCollection);
    const q = query(colRef, orderBy("createdAt", "asc"));

    return onSnapshot(q, (snap) => {
      const messages = snap.docs.map((d) => this.mapDocToMessage(d.id, d.data()));
      callback(messages);
    }, () => {});
  }

  subscribeToRooms(userId: string, callback: (rooms: ChatRoom[]) => void): () => void {
    const colRef = collection(this.db, this.roomsCollection);
    const q = query(
      colRef,
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(q, (snap) => {
      const rooms = snap.docs.map((d) => {
        const room = this.mapDocToRoom(d.id, d.data());
        // Compute unreadCount: room is unread if lastSenderId != userId
        // AND readBy[userId] is absent or older than updatedAt
        if (room.lastSenderId && room.lastSenderId !== userId) {
          const readAt = room.readBy?.[userId];
          const isUnread = !readAt || new Date(readAt) < room.updatedAt;
          room.unreadCount = isUnread ? 1 : 0;
        } else {
          room.unreadCount = 0;
        }
        return room;
      });
      callback(rooms);
    }, () => {});
  }

  private mapDocToRoom(id: string, data: Record<string, unknown>): ChatRoom {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = data as Record<string, any>;
    return {
      ...payload,
      id,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    } as ChatRoom;
  }

  private mapDocToMessage(id: string, data: Record<string, unknown>): Message {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = data as Record<string, any>;
    return {
      ...payload,
      id,
      deleted: payload.deleted ?? false,
      reactions: payload.reactions ?? {},
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    } as Message;
  }
}
