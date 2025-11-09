export type ProductType = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  promotionPrice?: number;
  images: string[];
  active: boolean;
};
