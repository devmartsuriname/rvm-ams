import { Button, Spinner } from 'react-bootstrap'
import { useUpdateTaskStatus } from '@/hooks/useTasks'
import { useUserRoles } from '@/hooks/useUserRoles'
import { getErrorMessage } from '@/utils/rls-error'
import { toast } from 'react-toastify'
import { useState } from 'react'
import type { Enums } from '@/integrations/supabase/types'

type TaskStatus = Enums<'task_status'>

const TRANSITIONS: Record<TaskStatus, { status: TaskStatus; label: string; variant: string }[]> = {
  todo: [
    { status: 'in_progress', label: 'Start', variant: 'primary' },
    { status: 'blocked', label: 'Block', variant: 'danger' },
    { status: 'cancelled', label: 'Cancel', variant: 'outline-danger' },
  ],
  in_progress: [
    { status: 'done', label: 'Done', variant: 'success' },
    { status: 'blocked', label: 'Block', variant: 'danger' },
    { status: 'cancelled', label: 'Cancel', variant: 'outline-danger' },
  ],
  blocked: [
    { status: 'in_progress', label: 'Resume', variant: 'primary' },
    { status: 'cancelled', label: 'Cancel', variant: 'outline-danger' },
  ],
  done: [],
  cancelled: [],
}

type Props = {
  taskId: string
  currentStatus: TaskStatus | null
  hasAssignee: boolean
}

export default function TaskStatusActions({ taskId, currentStatus, hasAssignee }: Props) {
  const { canTransitionTask } = useUserRoles()
  const updateStatus = useUpdateTaskStatus()
  const [confirmCancel, setConfirmCancel] = useState(false)

  if (!canTransitionTask || !currentStatus) return null
  const actions = TRANSITIONS[currentStatus] ?? []
  if (actions.length === 0) return null

  const handleTransition = async (status: TaskStatus) => {
    if (status === 'cancelled' && !confirmCancel) {
      setConfirmCancel(true)
      return
    }
    setConfirmCancel(false)

    if (status === 'in_progress' && !hasAssignee) {
      toast.error('A user must be assigned before setting task to In Progress.')
      return
    }

    try {
      await updateStatus.mutateAsync({ id: taskId, status })
      toast.success(`Task status updated to ${status.replace('_', ' ')}`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="d-flex gap-1">
      {actions.map(action => (
        <Button key={action.status} variant={action.status === 'cancelled' && confirmCancel ? 'danger' : action.variant}
          size="sm" disabled={updateStatus.isPending}
          onClick={() => handleTransition(action.status)}>
          {updateStatus.isPending ? <Spinner size="sm" /> : (
            action.status === 'cancelled' && confirmCancel ? 'Confirm?' : action.label
          )}
        </Button>
      ))}
    </div>
  )
}
