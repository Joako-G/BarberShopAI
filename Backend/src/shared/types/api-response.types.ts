export interface ApiResponse<T> {
  success: true;
  data: T;
  statusCode: number;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    details?: unknown;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}