export type ProductType = {
  name: string;
  description: string;
  price: number;
  stock: number;
  promotionPrice?: number;
  images: string[];
  active: boolean;
};
