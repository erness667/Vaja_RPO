export interface UserInfo {
  id: string;
  email: string;
  name: string;
  surname: string;
  username: string;
  phoneNumber: string;
  avatarImageUrl?: string | null;
  role: number;
}

export interface Friend {
  userId: string;
  user: UserInfo;
  friendsSince: string;
}

export interface FriendRequest {
  id: number;
  requesterId: string;
  addresseeId: string;
  status: number; // 0 = Pending, 1 = Accepted, 2 = Rejected
  createdAt: string;
  updatedAt?: string | null;
  requester?: UserInfo | null;
  addressee?: UserInfo | null;
}

