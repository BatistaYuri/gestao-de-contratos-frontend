import type { ContractSummary as ContractSummaryData } from '../types/contract'

interface ContractSummaryProps {
  summary: ContractSummaryData | null
  isLoading: boolean
  errorMessage: string
}

const summaryItems = [
  { key: 'active', label: 'Ativos', className: 'summary-active' },
  { key: 'expired', label: 'Vencidos', className: 'summary-expired' },
  { key: 'closed', label: 'Encerrados', className: 'summary-closed' },
  { key: 'total', label: 'Total', className: 'summary-total' },
] as const

export function ContractSummary({
  summary,
  isLoading,
  errorMessage,
}: ContractSummaryProps) {
  if (isLoading) return <p>Carregando resumo...</p>
  if (errorMessage) {
    return (
      <p className="form-message error" role="alert">
        {errorMessage}
      </p>
    )
  }
  if (!summary) return null

  return (
    <dl className="contract-summary">
      {summaryItems.map((item) => (
        <div className={`summary-card ${item.className}`} key={item.key}>
          <dt>{item.label}</dt>
          <dd>{summary[item.key]}</dd>
        </div>
      ))}
    </dl>
  )
}
