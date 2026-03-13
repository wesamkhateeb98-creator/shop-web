export interface Product {
  id: number;
  key: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  categoryId: number;
  discountPercentage: number | null;
  discountId: number | null;
  finalPrice: number;
}

export interface CreateProductRequest {
  key: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  image: File;
  categoryId: number;
}

export interface UpdateProductRequest {
  name: string;
  price: number;
  stock: number;
  description: string;
  categoryId: number;
}

export interface ProductFilterParams {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface AddDiscountRequest {
  percentage: number;
  startDate: string;
  endDate: string;
}
