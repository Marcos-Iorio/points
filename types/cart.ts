import { ProductType } from "./product";
import { Plan } from "./subscription";

export interface CartItem extends ProductType {
  quantity: number;
  selectedPlan?: Plan;
}
