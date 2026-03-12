import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PagedResponse, IdResponse } from '../models/pagination.model';
import {
  Product,
  ProductFilterParams,
  UpdateProductRequest,
  AddDiscountRequest,
} from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  getProducts(filters?: ProductFilterParams): Observable<PagedResponse<Product>> {
    let params = new HttpParams();
    if (filters) {
      if (filters.name) params = params.set('name', filters.name);
      if (filters.minPrice != null) params = params.set('minPrice', filters.minPrice);
      if (filters.maxPrice != null) params = params.set('maxPrice', filters.maxPrice);
      if (filters.categoryId != null) params = params.set('categoryId', filters.categoryId);
      if (filters.pageNumber != null) params = params.set('pageNumber', filters.pageNumber);
      if (filters.pageSize != null) params = params.set('pageSize', filters.pageSize);
    }
    return this.api.get<PagedResponse<Product>>('/products', params);
  }

  createProduct(formData: FormData): Observable<IdResponse> {
    return this.api.post<IdResponse>('/products', formData);
  }

  updateProduct(id: number, data: UpdateProductRequest): Observable<IdResponse> {
    return this.api.put<IdResponse>(`/products/${id}`, data);
  }

  deleteProduct(id: number): Observable<void> {
    return this.api.delete<void>(`/products/${id}`);
  }

  addDiscount(productId: number, data: AddDiscountRequest): Observable<IdResponse> {
    return this.api.post<IdResponse>(`/products/${productId}/discounts`, data);
  }

  removeDiscount(productId: number, discountId: number): Observable<void> {
    return this.api.delete<void>(`/products/${productId}/discounts/${discountId}`);
  }
}
