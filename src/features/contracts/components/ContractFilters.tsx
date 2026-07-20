import { useState, type FormEvent } from 'react'
import type { Client } from '../../clients/types/client'
import { approvalStatusLabels, contractStatusLabels, contractTypeLabels } from '../presentation'
import type { ApprovalStatus, ContractFilters as Filters, ContractStatus, ContractType } from '../types/contract'

interface Props { clients: Client[]; filters: Filters; onApply: (filters: Filters) => void }

export function ContractFilters({ clients, filters, onApply }: Props) {
  const [draft, setDraft] = useState(filters)
  function submit(event: FormEvent) { event.preventDefault(); onApply(draft) }
  function clear() { setDraft({}); onApply({}) }

  return (
    <form className="filters-form" onSubmit={submit}>
      <div className="form-field"><label htmlFor="filter-status">Vigência</label><select id="filter-status" value={draft.status ?? ''} onChange={(e) => setDraft({ ...draft, status: e.target.value as ContractStatus || undefined })}><option value="">Todas</option>{Object.entries(contractStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div className="form-field"><label htmlFor="filter-type">Tipo</label><select id="filter-type" value={draft.type ?? ''} onChange={(e) => setDraft({ ...draft, type: e.target.value as ContractType || undefined })}><option value="">Todos</option>{Object.entries(contractTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div className="form-field"><label htmlFor="filter-approval">Aprovação</label><select id="filter-approval" value={draft.approvalStatus ?? ''} onChange={(e) => setDraft({ ...draft, approvalStatus: e.target.value as ApprovalStatus || undefined })}><option value="">Todas</option>{Object.entries(approvalStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div className="form-field"><label htmlFor="filter-client">Cliente</label><select id="filter-client" value={draft.clientId ?? ''} onChange={(e) => setDraft({ ...draft, clientId: e.target.value || undefined })}><option value="">Todos</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></div>
      <div className="form-actions filter-actions">
        <button type="submit" className="icon-button" aria-label="Aplicar filtros" title="Aplicar filtros">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M4 5h16l-6.25 7.15v5.35l-3.5 1.75v-7.1L4 5Z" />
          </svg>
        </button>
        <button type="button" className="secondary-button icon-button" onClick={clear} aria-label="Limpar filtros" title="Limpar filtros">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="m7 7 10 10M17 7 7 17" />
          </svg>
        </button>
      </div>
    </form>
  )
}
