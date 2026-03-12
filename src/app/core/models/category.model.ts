export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  description: string | null;
}

export interface CategoryFilterParams {
  name?: string;
  pageNumber?: number;
  pageSize?: number;
}
