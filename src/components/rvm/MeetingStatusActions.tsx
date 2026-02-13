import { Button, Spinner } from 'react-bootstrap'
import { useUpdateMeetingStatus } from '@/hooks/useMeetings'
import { useUserRoles } from '@/hooks/useUserRoles'
import { getErrorMessage } from '@/utils/rls-error'
import { toast } from 'react-toastify'
import type { Enums } from '@/integrations/supabase/types'

type MeetingStatus = Enums<'meeting_status'>

const TRANSITIONS: Record<MeetingStatus, { status: MeetingStatus; label: string; variant: string }[]> = {
  draft: [{ status: 'published', label: 'Publish', variant: 'primary' }],
  published: [{ status: 'closed', label: 'Close Meeting', variant: 'success' }],
  closed: [],
}

type Props = { meetingId: string; currentStatus: MeetingStatus | null }

export default function MeetingStatusActions({ meetingId, currentStatus }: Props) {
  const { canTransitionMeeting } = useUserRoles()
  const updateStatus = useUpdateMeetingStatus()

  if (!canTransitionMeeting || !currentStatus) return null
  const actions = TRANSITIONS[currentStatus] ?? []
  if (actions.length === 0) return null

  const handleTransition = async (status: MeetingStatus) => {
    try {
      await updateStatus.mutateAsync({ id: meetingId, status })
      toast.success(`Meeting status updated to ${status}`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="d-flex gap-2">
      {actions.map(action => (
        <Button key={action.status} variant={action.variant} size="sm"
          disabled={updateStatus.isPending} onClick={() => handleTransition(action.status)}>
          {updateStatus.isPending ? <Spinner size="sm" /> : action.label}
        </Button>
      ))}
    </div>
  )
}
