import { useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useRecordChairApproval, useUpdateDecision } from '@/hooks/useDecisions'
import { useUserRoles } from '@/hooks/useUserRoles'
import { getErrorMessage } from '@/utils/rls-error'
import { toast } from 'react-toastify'
import type { Decision } from '@/services/decisionService'

type Props = {
  decisionId: string
  decision: Decision
}

export default function ChairApprovalActions({ decisionId, decision }: Props) {
  const { canFinalizeDecision, userId } = useUserRoles()
  const recordApproval = useRecordChairApproval()
  const updateDecision = useUpdateDecision()
  const [confirmFinalize, setConfirmFinalize] = useState(false)

  if (!canFinalizeDecision) return null
  if (decision.is_final) return null
  if (decision.decision_status !== 'approved') return null

  const isPending = recordApproval.isPending || updateDecision.isPending

  const handleFinalize = async () => {
    if (!confirmFinalize) {
      setConfirmFinalize(true)
      return
    }

    try {
      // Step 1: Record chair approval (if not already recorded)
      if (!decision.chair_approved_by && userId) {
        await recordApproval.mutateAsync({ id: decisionId, chairUserId: userId })
      }

      // Step 2: Set is_final = true
      await updateDecision.mutateAsync({
        id: decisionId,
        data: { is_final: true },
      })

      toast.success('Decision finalized successfully')
      setConfirmFinalize(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
      setConfirmFinalize(false)
    }
  }

  return (
    <div className="d-flex gap-2">
      <Button
        variant={confirmFinalize ? 'outline-success' : 'success'}
        size="sm"
        disabled={isPending}
        onClick={handleFinalize}
      >
        {isPending ? (
          <><Spinner size="sm" className="me-1" /> Finalizing...</>
        ) : confirmFinalize ? (
          'Confirm Finalization?'
        ) : (
          'Finalize Decision'
        )}
      </Button>
      {confirmFinalize && (
        <Button variant="secondary" size="sm" onClick={() => setConfirmFinalize(false)} disabled={isPending}>
          Cancel
        </Button>
      )}
    </div>
  )
}
