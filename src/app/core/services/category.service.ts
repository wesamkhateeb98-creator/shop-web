import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PagedResponse, IdResponse } from '../models/pagination.model';
import {
  Category,
  CreateCategoryRequest,
  CategoryFilterParams,
} from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = inject(ApiService);

  getCategories(filters?: CategoryFilterParams): Observable<PagedResponse<Category>> {
    let params = new HttpParams();
    if (filters) {
      if (filters.name) params = params.set('name', filters.name);
      if (filters.pageNumber != null) params = params.set('pageNumber', filters.pageNumber);
      if (filters.pageSize != null) params = params.set('pageSize', filters.pageSize);
    }
    return this.api.get<PagedResponse<Category>>('/categories', params);
  }

  createCategory(data: CreateCategoryRequest): Observable<IdResponse> {
    return this.api.post<IdResponse>('/categories', data);
  }

  updateCategory(id: number, data: CreateCategoryRequest): Observable<IdResponse> {
    return this.api.put<IdResponse>(`/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<void> {
    return this.api.delete<void>(`/categories/${id}`);
  }
}
