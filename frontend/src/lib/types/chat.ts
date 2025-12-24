import type { UserInfo } from "./friend";

export interface Conversation {
  userId: string;
  user: UserInfo;
  lastMessage: {
    content: string;
    sentAt: string;
    isRead: boolean;
  };
  unreadCount: number;
}

export interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  readAt?: string | null;
  sender?: UserInfo | null;
  receiver?: UserInfo | null;
}

