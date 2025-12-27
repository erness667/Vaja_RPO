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
  isFriend?: boolean; // Whether the user is still a friend
}

export interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  readAt?: string | null;
  isMessageRequest?: boolean;
  sender?: UserInfo | null;
  receiver?: UserInfo | null;
}

export interface MessageRequest {
  userId: string;
  user: UserInfo | null;
  lastMessage: {
    id: number;
    content: string;
    sentAt: string;
    isRead: boolean;
  };
  unreadCount: number;
  totalCount: number;
}

