export interface PaginationQuery {
  page: number
  pageSize: number
}

export interface PaginationMeta extends PaginationQuery {
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}
