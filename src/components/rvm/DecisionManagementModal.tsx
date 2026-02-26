import { useState } from 'react'
import { Modal, Badge, Spinner } from 'react-bootstrap'
import { useDecision, useUpdateDecision } from '@/hooks/useDecisions'
import { useUserRoles } from '@/hooks/useUserRoles'
import { DecisionStatusBadge } from '@/components/rvm/StatusBadges'
import EditDecisionForm from '@/components/rvm/EditDecisionForm'
import DecisionStatusActions from '@/components/rvm/DecisionStatusActions'
import ChairApprovalActions from '@/components/rvm/ChairApprovalActions'
import { getErrorMessage } from '@/utils/rls-error'
import { toast } from 'react-toastify'

type Props = {
  show: boolean
  onHide: () => void
  agendaItemId: string
  agendaNumber: number
}

export default function DecisionManagementModal({ show, onHide, agendaItemId, agendaNumber }: Props) {
  const { data: decision, isLoading } = useDecision(agendaItemId)
  const { canEditDecision, canApproveDecision, canFinalizeDecision } = useUserRoles()
  const updateDecision = useUpdateDecision()
  const [editMode, setEditMode] = useState(false)

  const handleSave = async (formData: { decision_text: string }) => {
    if (!decision) return
    try {
      await updateDecision.mutateAsync({
        id: decision.id,
        data: { decision_text: formData.decision_text },
      })
      toast.success('Decision updated successfully')
      setEditMode(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleClose = () => { setEditMode(false); onHide() }

  const isFinal = decision?.is_final ?? false
  const showEditButton = canEditDecision && !isFinal && !editMode

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Decision — Agenda Item #{agendaNumber}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading decision...
          </div>
        ) : !decision ? (
          <div className="text-center text-muted py-4">No decision found for this agenda item.</div>
        ) : (
          <>
            {/* Status header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-medium">Status:</span>
                <DecisionStatusBadge status={decision.decision_status} />
                {isFinal && <Badge bg="dark">Final</Badge>}
              </div>
              {showEditButton && (
                <button className="btn btn-outline-primary btn-sm" onClick={() => setEditMode(true)}>
                  Edit Text
                </button>
              )}
            </div>

            {/* Decision text or edit form */}
            {editMode ? (
              <EditDecisionForm
                decision={decision}
                onSave={handleSave}
                onCancel={() => setEditMode(false)}
                isLoading={updateDecision.isPending}
              />
            ) : (
              <div className="border rounded p-3 mb-3">
                <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{decision.decision_text}</p>
              </div>
            )}

            {/* Chair approval info (read-only) */}
            {decision.chair_approved_by && (
              <div className="mb-3">
                <small className="text-muted">
                  Chair approved at: {decision.chair_approved_at
                    ? new Date(decision.chair_approved_at).toLocaleString('nl-NL')
                    : '-'}
                </small>
              </div>
            )}

            {/* Chair status transition actions */}
            {canApproveDecision && !isFinal && (
              <div className="mb-3">
                <small className="text-muted d-block mb-2">Status Actions (Chair only):</small>
                <DecisionStatusActions
                  decisionId={decision.id}
                  currentStatus={decision.decision_status}
                  isFinal={decision.is_final}
                />
              </div>
            )}

            {/* Chair finalization actions */}
            {canFinalizeDecision && !isFinal && decision.decision_status === 'approved' && (
              <div className="mb-3">
                <small className="text-muted d-block mb-2">Finalization (Chair only):</small>
                <ChairApprovalActions decisionId={decision.id} decision={decision} />
              </div>
            )}

            {/* Final read-only indicator */}
            {isFinal && (
              <div className="alert alert-success mb-0">
                <small>This decision has been finalized and is now immutable.</small>
              </div>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  )
}
