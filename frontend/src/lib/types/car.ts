export interface Car {
  id: number;
  sellerId: string;
  brand: string;
  model: string;
  year: number;
  firstRegistrationDate: string;
  mileage: number;
  previousOwners: number;
  fuelType: string;
  enginePower: number;
  transmission: string;
  color: string;
  equipmentAndDetails?: string | null;
  price: number;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
  mainImageUrl?: string | null;
  imageUrls?: string[];
  seller?: SellerInfo | null;
}

export interface SellerInfo {
  name: string;
  surname: string;
  phoneNumber: string;
  avatarImageUrl?: string | null;
}

export interface CommentAuthor {
  name: string;
  surname: string;
  avatarImageUrl?: string | null;
}

export interface Comment {
  id: number;
  carId: number;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string | null;
  author?: CommentAuthor | null;
}

export interface FavouriteItem {
  id: number;
  carId: number;
  createdAt: string;
  car?: Car | null;
}

export interface ViewHistoryItem {
  id: number;
  carId: number;
  viewedAt: string;
  car?: Car | null;
}

