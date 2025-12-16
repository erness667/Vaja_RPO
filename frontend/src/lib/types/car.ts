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
  createdAt: string;
  updatedAt: string;
  mainImageUrl?: string | null;
  imageUrls?: string[];
}


