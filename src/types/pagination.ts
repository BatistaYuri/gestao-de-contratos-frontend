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

export function normalizePaginatedResponse<T>(
  response: unknown,
  query: PaginationQuery,
): PaginatedResponse<T> {
  const body = response as {
    data?: unknown
    pagination?: Partial<PaginationMeta>
  } | null
  const data = Array.isArray(body) ? body : body?.data

  if (!Array.isArray(data)) {
    throw new Error('A API retornou uma lista paginada inválida.')
  }

  const pagination = body && !Array.isArray(body) ? body.pagination : undefined
  const total = Number.isFinite(pagination?.total) ? Number(pagination?.total) : data.length
  const pageSize = Number.isFinite(pagination?.pageSize)
    ? Math.max(1, Number(pagination?.pageSize))
    : query.pageSize

  return {
    data: data as T[],
    pagination: {
      page: Number.isFinite(pagination?.page) ? Math.max(1, Number(pagination?.page)) : query.page,
      pageSize,
      total,
      totalPages: Number.isFinite(pagination?.totalPages)
        ? Math.max(0, Number(pagination?.totalPages))
        : Math.ceil(total / pageSize),
    },
  }
}
