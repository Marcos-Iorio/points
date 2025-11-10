export type ProductType = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  promotionPrice?: number;
  images: IImages[];
  active: boolean;
};

export interface IImages {
  id: string;
  image_name: string;
  image_url: string;
  label?: string;
  size?: string;
}
