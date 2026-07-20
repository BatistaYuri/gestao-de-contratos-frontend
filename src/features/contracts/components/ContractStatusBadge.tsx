import { approvalStatusLabels, contractStatusLabels } from '../presentation'
import type { ApprovalStatus, ContractStatus } from '../types/contract'

type ContractStatusBadgeProps =
  | { kind: 'term'; status: ContractStatus }
  | { kind: 'approval'; status: ApprovalStatus }

export function ContractStatusBadge(props: ContractStatusBadgeProps) {
  const label = props.kind === 'term'
    ? contractStatusLabels[props.status]
    : approvalStatusLabels[props.status]

  return (
    <span className={`status-badge status-${props.status.toLowerCase()}`}>
      {label}
    </span>
  )
}
