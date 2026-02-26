import { Button, Spinner } from 'react-bootstrap'
import { useUpdateDecisionStatus } from '@/hooks/useDecisions'
import { useUserRoles } from '@/hooks/useUserRoles'
import { getErrorMessage } from '@/utils/rls-error'
import { toast } from 'react-toastify'
import type { Enums } from '@/integrations/supabase/types'

type DecisionStatus = Enums<'decision_status'>

const TRANSITIONS: Record<DecisionStatus, { status: DecisionStatus; label: string; variant: string }[]> = {
  pending: [
    { status: 'approved', label: 'Approve', variant: 'success' },
    { status: 'deferred', label: 'Defer', variant: 'info' },
    { status: 'rejected', label: 'Reject', variant: 'danger' },
  ],
  deferred: [
    { status: 'approved', label: 'Approve', variant: 'success' },
    { status: 'pending', label: 'Re-submit to Pending', variant: 'warning' },
  ],
  approved: [],
  rejected: [],
}

type Props = {
  decisionId: string
  currentStatus: DecisionStatus | null
  isFinal: boolean | null
}

export default function DecisionStatusActions({ decisionId, currentStatus, isFinal }: Props) {
  const { canApproveDecision } = useUserRoles()
  const updateStatus = useUpdateDecisionStatus()

  if (!canApproveDecision || !currentStatus || isFinal) return null

  const actions = TRANSITIONS[currentStatus] ?? []
  if (actions.length === 0) return null

  const handleTransition = async (status: DecisionStatus) => {
    try {
      await updateStatus.mutateAsync({ id: decisionId, status })
      toast.success(`Decision status updated to ${status}`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="d-flex gap-2 flex-wrap">
      {actions.map(action => (
        <Button
          key={action.status}
          variant={action.variant}
          size="sm"
          disabled={updateStatus.isPending}
          onClick={() => handleTransition(action.status)}
        >
          {updateStatus.isPending ? <Spinner size="sm" /> : action.label}
        </Button>
      ))}
    </div>
  )
}
