import { Button, Spinner } from 'react-bootstrap'
import { useUpdateDossierStatus } from '@/hooks/useDossiers'
import { useUserRoles } from '@/hooks/useUserRoles'
import { getErrorMessage } from '@/utils/rls-error'
import { toast } from 'react-toastify'
import { useState } from 'react'
import type { Enums } from '@/integrations/supabase/types'

type DossierStatus = Enums<'dossier_status'>

const TRANSITIONS: Record<DossierStatus, { status: DossierStatus; label: string; variant: string }[]> = {
  draft: [{ status: 'registered', label: 'Register', variant: 'primary' }],
  registered: [
    { status: 'in_preparation', label: 'Start Preparation', variant: 'primary' },
    { status: 'cancelled', label: 'Cancel', variant: 'danger' },
  ],
  in_preparation: [
    { status: 'scheduled', label: 'Schedule', variant: 'warning' },
    { status: 'cancelled', label: 'Cancel', variant: 'danger' },
  ],
  scheduled: [
    { status: 'decided', label: 'Mark Decided', variant: 'success' },
    { status: 'cancelled', label: 'Cancel', variant: 'danger' },
  ],
  decided: [{ status: 'archived', label: 'Archive', variant: 'dark' }],
  archived: [],
  cancelled: [],
}

type Props = {
  dossierId: string
  currentStatus: DossierStatus | null
}

export default function DossierStatusActions({ dossierId, currentStatus }: Props) {
  const { canTransitionDossier } = useUserRoles()
  const updateStatus = useUpdateDossierStatus()
  const [confirmCancel, setConfirmCancel] = useState(false)

  if (!canTransitionDossier || !currentStatus) return null

  const actions = TRANSITIONS[currentStatus] ?? []
  if (actions.length === 0) return null

  const handleTransition = async (status: DossierStatus) => {
    if (status === 'cancelled' && !confirmCancel) {
      setConfirmCancel(true)
      return
    }
    setConfirmCancel(false)

    try {
      await updateStatus.mutateAsync({ id: dossierId, status })
      toast.success(`Dossier status updated to ${status.replace('_', ' ')}`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="d-flex gap-2 flex-wrap">
      {actions.map(action => (
        <Button
          key={action.status}
          variant={action.status === 'cancelled' && confirmCancel ? 'outline-danger' : action.variant}
          size="sm"
          disabled={updateStatus.isPending}
          onClick={() => handleTransition(action.status)}
        >
          {updateStatus.isPending ? <Spinner size="sm" /> : (
            action.status === 'cancelled' && confirmCancel ? 'Confirm Cancel?' : action.label
          )}
        </Button>
      ))}
    </div>
  )
}
