export enum OrderStatus {
  Pending = 0,
  Confirmed = 1,
  Shipped = 2,
  Delivered = 3,
  Cancelled = 4,
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'Pending',
  [OrderStatus.Confirmed]: 'Confirmed',
  [OrderStatus.Shipped]: 'Shipped',
  [OrderStatus.Delivered]: 'Delivered',
  [OrderStatus.Cancelled]: 'Cancelled',
};

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
