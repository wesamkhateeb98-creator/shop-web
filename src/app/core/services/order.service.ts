import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PagedResponse, IdResponse } from '../models/pagination.model';
import {
  OrderSummary,
  OrderDetail,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderFilterParams,
} from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);

  getOrders(filters?: OrderFilterParams): Observable<PagedResponse<OrderSummary>> {
    let params = new HttpParams();
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.pageNumber != null) params = params.set('pageNumber', filters.pageNumber);
      if (filters.pageSize != null) params = params.set('pageSize', filters.pageSize);
    }
    return this.api.get<PagedResponse<OrderSummary>>('/orders', params);
  }

  getOrderById(id: number): Observable<OrderDetail> {
    return this.api.get<OrderDetail>(`/orders/${id}`);
  }

  createOrder(data: CreateOrderRequest): Observable<IdResponse> {
    return this.api.post<IdResponse>('/orders', data);
  }

  cancelOrder(id: number): Observable<void> {
    return this.api.put<void>(`/orders/${id}/cancel`, {});
  }

  updateOrderStatus(id: number, data: UpdateOrderStatusRequest): Observable<void> {
    return this.api.put<void>(`/orders/${id}/status`, data);
  }
}
