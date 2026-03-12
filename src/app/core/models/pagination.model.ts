export interface PagedResponse<T> {
  pageNumber: number;
  pageSize: number;
  content: T[];
  countPages: number;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface IdResponse {
  id: number;
}
