import { nanoid } from 'nanoid';
export type CartType = {
  id: string;
  items: CartItem[];
  deliveryMethodId?: number;
  paymentIntentId?: string;
  clientSecret?: string;
  coupon?: Coupon;
};

export type CartItem = {
  productName: string;
  price: number;
  pictureUrl: string;
  type: string;
  brand: string;
  productId: number;
  quantity: number;
  coupon?: Coupon;
};

export type Coupon = {
  name: string;
  amountOff?: number;
  percentOff?: number;
  promotionCode: string;
  couponId: string;
};

export class Cart implements CartType {
  id = nanoid();
  items: CartItem[] = [];
  deliveryMethodId?: number;
  paymentIntentId?: string;
  clientSecret?: string;
  coupon?: Coupon;
}
