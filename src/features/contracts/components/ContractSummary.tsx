import type { ContractSummary as ContractSummaryData } from '../types/contract'

interface ContractSummaryProps {
  summary: ContractSummaryData | null
  isLoading: boolean
  errorMessage: string
}

const summaryItems = [
  { key: 'active', label: 'Ativos' },
  { key: 'expired', label: 'Vencidos' },
  { key: 'closed', label: 'Encerrados' },
  { key: 'total', label: 'Total' },
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
        <div className="summary-card" key={item.key}>
          <dt>{item.label}</dt>
          <dd>{summary[item.key]}</dd>
        </div>
      ))}
    </dl>
  )
}
