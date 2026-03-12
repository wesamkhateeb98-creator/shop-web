import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PagedResponse, IdResponse } from '../models/pagination.model';
import { Coupon, CreateCouponRequest } from '../models/coupon.model';
import { PaginationParams } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly api = inject(ApiService);

  getCoupons(filters?: PaginationParams): Observable<PagedResponse<Coupon>> {
    let params = new HttpParams();
    if (filters) {
      if (filters.pageNumber != null) params = params.set('pageNumber', filters.pageNumber);
      if (filters.pageSize != null) params = params.set('pageSize', filters.pageSize);
    }
    return this.api.get<PagedResponse<Coupon>>('/coupons', params);
  }

  createCoupon(data: CreateCouponRequest): Observable<IdResponse> {
    return this.api.post<IdResponse>('/coupons', data);
  }

  deleteCoupon(id: number): Observable<void> {
    return this.api.delete<void>(`/coupons/${id}`);
  }
}
