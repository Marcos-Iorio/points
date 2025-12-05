import { ProductType } from "./product";

export interface CartItem extends ProductType {
  quantity: number;
}
