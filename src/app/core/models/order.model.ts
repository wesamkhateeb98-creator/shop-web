export enum OrderStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

export interface OrderSummary {
  id: number;
  accountId: number;
  status: OrderStatus;
  totalPrice: number;
  couponDiscount: number;
  createdAt: string;
  itemCount: number;
}

export interface OrderDetail {
  id: number;
  accountId: number;
  status: OrderStatus;
  totalPrice: number;
  couponDiscount: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreateOrderRequest {
  items: { productId: number; quantity: number }[];
  couponCode: string | null;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface OrderFilterParams {
  status?: OrderStatus;
  pageNumber?: number;
  pageSize?: number;
}
