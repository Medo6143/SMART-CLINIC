import { 
  getFirestore,
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp,
  orderBy,
  onSnapshot,
  Timestamp,
  limit
} from "firebase/firestore";
import { app } from "@/lib/firebase/config";
import type { Notification, CreateNotificationInput } from "../../domain/entities/Notification";

export class FirebaseNotificationRepository {
  private db = getFirestore(app);
  private collectionName = "notifications";

  async create(data: CreateNotificationInput): Promise<string> {
    const docRef = doc(collection(this.db, this.collectionName));
    await setDoc(docRef, {
      ...data,
      id: docRef.id,
      createdAt: serverTimestamp(),
      read: false,
    });
    return docRef.id;
  }

  async markAsRead(id: string): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await updateDoc(docRef, {
      read: true,
      updatedAt: serverTimestamp(),
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      collection(this.db, this.collectionName),
      where("userId", "==", userId),
      where("read", "==", false)
    );
    const snap = await getDocs(q);
    const promises = snap.docs.map(d => updateDoc(d.ref, { read: true, updatedAt: serverTimestamp() }));
    await Promise.all(promises);
  }

  subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
    const q = query(
      collection(this.db, this.collectionName),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    return onSnapshot(q, (snap) => {
      const results = snap.docs.map(d => this.mapDocToNotification(d.id, d.data()));
      callback(results);
    }, () => {});
  }

  private mapDocToNotification(id: string, data: any): Notification {
    return {
      ...data,
      id,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt ?? Date.now()),
    } as Notification;
  }
}

export const notificationRepository = new FirebaseNotificationRepository();
