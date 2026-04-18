export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "message" | "appointment" | "system";
  link?: string;
  read: boolean;
  createdAt: Date;
}

export type CreateNotificationInput = Omit<Notification, "id" | "createdAt">;
