export interface Coupon {
  id: number;
  code: string;
  percentage: number;
  expiryDate: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
}

export interface CreateCouponRequest {
  code: string;
  percentage: number;
  expiryDate: string;
  maxUses: number;
}
