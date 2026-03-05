import { Badge } from 'react-bootstrap'
import type { Enums } from '@/integrations/supabase/types'

type DossierStatus = Enums<'dossier_status'>
type MeetingStatus = Enums<'meeting_status'>
type TaskStatus = Enums<'task_status'>
type DecisionStatus = Enums<'decision_status'>
type UrgencyLevel = Enums<'urgency_level'>
type TaskPriority = Enums<'task_priority'>

const dossierStatusMap: Record<DossierStatus, { variant: string; label: string }> = {
  draft: { variant: 'secondary', label: 'Draft' },
  registered: { variant: 'info', label: 'Registered' },
  in_preparation: { variant: 'primary', label: 'In Preparation' },
  scheduled: { variant: 'warning', label: 'Scheduled' },
  decided: { variant: 'success', label: 'Decided' },
  archived: { variant: 'dark', label: 'Archived' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
}

const meetingStatusMap: Record<MeetingStatus, { variant: string; label: string }> = {
  draft: { variant: 'secondary', label: 'Draft' },
  published: { variant: 'primary', label: 'Published' },
  closed: { variant: 'success', label: 'Closed' },
}

const taskStatusMap: Record<TaskStatus, { variant: string; label: string }> = {
  todo: { variant: 'secondary', label: 'To Do' },
  in_progress: { variant: 'primary', label: 'In Progress' },
  blocked: { variant: 'danger', label: 'Blocked' },
  done: { variant: 'success', label: 'Done' },
  cancelled: { variant: 'dark', label: 'Cancelled' },
}

const decisionStatusMap: Record<DecisionStatus, { variant: string; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  approved: { variant: 'success', label: 'Approved' },
  deferred: { variant: 'info', label: 'Deferred' },
  rejected: { variant: 'danger', label: 'Rejected' },
}

const urgencyMap: Record<UrgencyLevel, { variant: string; label: string }> = {
  regular: { variant: 'secondary', label: 'Regular' },
  urgent: { variant: 'warning', label: 'Urgent' },
  special: { variant: 'danger', label: 'Special' },
}

const priorityMap: Record<TaskPriority, { variant: string; label: string }> = {
  normal: { variant: 'secondary', label: 'Normal' },
  high: { variant: 'warning', label: 'High' },
  urgent: { variant: 'danger', label: 'Urgent' },
}

export function DossierStatusBadge({ status }: { status: DossierStatus | null | undefined }) {
  if (!status) return null
  const config = dossierStatusMap[status]
  return <Badge bg={config.variant}>{config.label}</Badge>
}

export function MeetingStatusBadge({ status }: { status: MeetingStatus | null | undefined }) {
  if (!status) return null
  const config = meetingStatusMap[status]
  return <Badge bg={config.variant}>{config.label}</Badge>
}

export function TaskStatusBadge({ status }: { status: TaskStatus | null | undefined }) {
  if (!status) return null
  const config = taskStatusMap[status]
  return <Badge bg={config.variant}>{config.label}</Badge>
}

export function DecisionStatusBadge({ status }: { status: DecisionStatus | null | undefined }) {
  if (!status) return null
  const config = decisionStatusMap[status]
  return <Badge bg={config.variant}>{config.label}</Badge>
}

export function UrgencyBadge({ urgency }: { urgency: UrgencyLevel | null | undefined }) {
  if (!urgency) return null
  const config = urgencyMap[urgency]
  return <Badge bg={config.variant}>{config.label}</Badge>
}

export function PriorityBadge({ priority }: { priority: TaskPriority | null | undefined }) {
  if (!priority) return null
  const config = priorityMap[priority]
  return <Badge bg={config.variant}>{config.label}</Badge>
}

export function ConfidentialityBadge({ level }: { level: Enums<'confidentiality_level'> | null | undefined }) {
  if (!level) return null
  const map: Record<string, { variant: string; label: string }> = {
    standard_confidential: { variant: 'secondary', label: 'Standard' },
    restricted: { variant: 'warning', label: 'Restricted' },
    highly_restricted: { variant: 'danger', label: 'Highly Restricted' },
  }
  const config = map[level] ?? { variant: 'secondary', label: level }
  return <Badge bg={config.variant}>{config.label}</Badge>
}

export function ServiceTypeBadge({ type }: { type: 'proposal' | 'missive' | null | undefined }) {
  if (!type) return null
  return (
    <Badge bg={type === 'proposal' ? 'primary' : 'info'}>
      {type === 'proposal' ? 'Proposal' : 'Missive'}
    </Badge>
  )
}

/**
 * Unified decision lifecycle badge.
 * Renders one badge representing the full lifecycle state of a decision.
 *
 * States:
 *  - Finalized (is_final = true) → success
 *  - Awaiting Chair Gate (approved but not final) → warning
 *  - Pending → secondary
 *  - Deferred → info
 *  - Rejected → danger
 */
type AgendaItemStatus = Enums<'agenda_item_status'>

const agendaItemStatusMap: Record<AgendaItemStatus, { variant: string; label: string }> = {
  scheduled: { variant: 'primary', label: 'Scheduled' },
  presented: { variant: 'success', label: 'Presented' },
  withdrawn: { variant: 'secondary', label: 'Withdrawn' },
  moved: { variant: 'info', label: 'Moved' },
}

export function AgendaItemStatusBadge({ status }: { status: AgendaItemStatus | null | undefined }) {
  if (!status) return null
  const config = agendaItemStatusMap[status]
  return <Badge bg={config.variant}>{config.label}</Badge>
}

export function DecisionLifecycleBadge({
  status,
  isFinal,
}: {
  status: DecisionStatus | null | undefined
  isFinal: boolean | null | undefined
}) {
  if (isFinal) return <Badge bg="success">Finalized</Badge>
  if (status === 'approved') return <Badge bg="warning" text="dark">Awaiting Chair Gate</Badge>
  if (status === 'pending') return <Badge bg="secondary">Pending</Badge>
  if (status === 'deferred') return <Badge bg="info">Deferred</Badge>
  if (status === 'rejected') return <Badge bg="danger">Rejected</Badge>
  return null
}