import type { PaginationMeta } from '../types/pagination'

interface PaginationProps {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function Pagination({ pagination, onPageChange, disabled = false }: PaginationProps) {
  const totalPages = Math.max(1, pagination.totalPages)
  const currentPage = Math.min(Math.max(1, pagination.page), totalPages)

  return (
    <nav className="pagination" aria-label="Paginação">
      <p>
        Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
        <span> · {pagination.total} registros</span>
      </p>
      <div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage <= 1}
        >
          Anterior
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage >= totalPages}
        >
          Próxima
        </button>
      </div>
    </nav>
  )
}
