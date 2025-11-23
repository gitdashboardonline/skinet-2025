import { nanoid } from 'nanoid';
export type CartType = {
  id: string;
  items: CartItem[];
};

export type CartItem = {
  productName: string;
  price: number;
  pictureUrl: string;
  type: string;
  brand: string;
  productId: number;
  quantity: number;
};

export class Cart implements CartType {
  id = nanoid();
  items: CartItem[] = [];
}
