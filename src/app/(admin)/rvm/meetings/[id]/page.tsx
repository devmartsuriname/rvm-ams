import { useState } from 'react'
import Footer from '@/components/layout/Footer'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, Row, Col, Table, Badge, Button } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { useMeeting, useUpdateMeeting } from '@/hooks/useMeetings'
import { useDecisionsByMeeting } from '@/hooks/useDecisions'
import { useUserRoles } from '@/hooks/useUserRoles'
import { MeetingStatusBadge, UrgencyBadge, DecisionLifecycleBadge } from '@/components/rvm/StatusBadges'
import { LoadingState, ErrorState } from '@/components/rvm/StateComponents'
import MeetingStatusActions from '@/components/rvm/MeetingStatusActions'
import EditMeetingForm from '@/components/rvm/EditMeetingForm'
import CreateDecisionModal from '@/components/rvm/CreateDecisionModal'
import DecisionManagementModal from '@/components/rvm/DecisionManagementModal'
import { getErrorMessage } from '@/utils/rls-error'
import { toast } from 'react-toastify'
import type { Enums } from '@/integrations/supabase/types'

const MeetingDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data: meeting, isLoading, error, refetch } = useMeeting(id)
  const { data: decisions } = useDecisionsByMeeting(id)
  const { canEditMeeting, canCreateDecision, canEditDecision, canApproveDecision } = useUserRoles()
  const updateMeeting = useUpdateMeeting()
  const [editMode, setEditMode] = useState(false)

  // Decision modal state
  const [createDecisionAgendaId, setCreateDecisionAgendaId] = useState<string | null>(null)
  const [manageDecisionAgendaId, setManageDecisionAgendaId] = useState<string | null>(null)
  const [manageDecisionAgendaNum, setManageDecisionAgendaNum] = useState<number>(0)

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getMeetingTypeLabel = (type: string | null | undefined) => {
    switch (type) {
      case 'regular': return 'Regular'
      case 'urgent': return 'Urgent'
      case 'special': return 'Special'
      default: return type || '-'
    }
  }

  const getAgendaStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case 'scheduled': return <Badge bg="primary">Scheduled</Badge>
      case 'presented': return <Badge bg="success">Presented</Badge>
      case 'withdrawn': return <Badge bg="secondary">Withdrawn</Badge>
      case 'moved': return <Badge bg="info">Moved</Badge>
      default: return null
    }
  }

  const isEditDisabled = meeting?.status === 'closed'
  const showEditButton = canEditMeeting && !isEditDisabled && !editMode

  const handleSave = async (formData: {
    meeting_date: string
    meeting_type: Enums<'meeting_type'>
    location: string
  }) => {
    if (!meeting) return
    try {
      await updateMeeting.mutateAsync({
        id: meeting.id,
        data: {
          meeting_date: formData.meeting_date,
          meeting_type: formData.meeting_type,
          location: formData.location || null,
        },
      })
      toast.success('Meeting updated successfully')
      await refetch()
      setEditMode(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  // Check if an agenda item has a decision
  const getItemDecision = (item: any) => {
    return item.rvm_decision && item.rvm_decision[0] ? item.rvm_decision[0] : null
  }

  // Determine which action button to show for an agenda item
  const renderActionButtons = (item: any) => {
    const decision = getItemDecision(item)
    const isFinal = decision?.is_final === true

    // No actions when finalized
    if (isFinal) return <Badge bg="dark">Final</Badge>

    // Chair: Manage button if decision exists
    if (canApproveDecision && decision) {
      return (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => { setManageDecisionAgendaId(item.id); setManageDecisionAgendaNum(item.agenda_number) }}
        >
          Manage
        </Button>
      )
    }

    // Secretary: Create or Edit/Manage
    if (canCreateDecision && !decision) {
      return (
        <Button
          variant="outline-success"
          size="sm"
          onClick={() => setCreateDecisionAgendaId(item.id)}
        >
          Create Decision
        </Button>
      )
    }

    if (canEditDecision && decision && !isFinal) {
      return (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => { setManageDecisionAgendaId(item.id); setManageDecisionAgendaNum(item.agenda_number) }}
        >
          Edit
        </Button>
      )
    }

    return <span className="text-muted small">—</span>
  }

  if (isLoading) {
    return (
      <>
        <PageTitle subName="RVM Core" title="Meeting Details" />
        <LoadingState message="Loading meeting..." />
        <Footer />
      </>
    )
  }

  if (error || !meeting) {
    return (
      <>
        <PageTitle subName="RVM Core" title="Meeting Details" />
        <ErrorState message="Failed to load meeting" onRetry={() => refetch()} />
        <Footer />
      </>
    )
  }

  const agendaItems = meeting.rvm_agenda_item || []

  return (
    <>
      <PageTitle subName="RVM Core" title={`Meeting - ${formatDate(meeting.meeting_date)}`} />

      <Row className="mb-3">
        <Col className="d-flex justify-content-between align-items-center">
          <Link to="/rvm/meetings" className="btn btn-outline-secondary btn-sm">
            ← Back to Meetings
          </Link>
          <MeetingStatusActions meetingId={meeting.id} currentStatus={meeting.status} />
        </Col>
      </Row>

      <Row>
        {/* Meeting Info Card */}
        <Col lg={4}>
          <Card className="mb-3">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Meeting Info</h5>
              <div className="d-flex align-items-center gap-2">
                <MeetingStatusBadge status={meeting.status} />
                {showEditButton && (
                  <Button variant="outline-primary" size="sm" onClick={() => setEditMode(true)}>
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              {editMode ? (
                <EditMeetingForm
                  meeting={meeting}
                  onSave={handleSave}
                  onCancel={() => setEditMode(false)}
                  isLoading={updateMeeting.isPending}
                />
              ) : (
                <ul className="list-unstyled mb-0">
                  <li className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Date</span>
                    <span className="fw-medium">{formatDate(meeting.meeting_date)}</span>
                  </li>
                  <li className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Type</span>
                    <Badge bg={meeting.meeting_type === 'urgent' ? 'warning' : meeting.meeting_type === 'special' ? 'danger' : 'secondary'}>
                      {getMeetingTypeLabel(meeting.meeting_type)}
                    </Badge>
                  </li>
                  <li className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Location</span>
                    <span>{meeting.location || '-'}</span>
                  </li>
                  <li className="d-flex justify-content-between py-2">
                    <span className="text-muted">Agenda Items</span>
                    <Badge bg="primary">{agendaItems.length}</Badge>
                  </li>
                </ul>
              )}
            </CardBody>
          </Card>

          {/* Decisions Summary */}
          <Card>
            <CardHeader>
              <h6 className="card-title mb-0">Decisions Summary</h6>
            </CardHeader>
            <CardBody className="p-0">
              {!decisions || decisions.length === 0 ? (
                <div className="text-center text-muted py-3">
                  <small>No decisions recorded</small>
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {decisions.map((decision: any) => (
                    <li key={decision.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="text-truncate" style={{ maxWidth: '150px' }}>
                        #{decision.rvm_agenda_item?.agenda_number}
                      </span>
                      <DecisionLifecycleBadge status={decision.decision_status} isFinal={decision.is_final} />
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* Agenda Items */}
        <Col lg={8}>
          <Card>
            <CardHeader>
              <h5 className="card-title mb-0">Agenda Items</h5>
            </CardHeader>
            <CardBody className="p-0">
              {agendaItems.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <p className="mb-0">No items on the agenda yet</p>
                </div>
              ) : (
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '60px' }}>#</th>
                      <th>Dossier</th>
                      <th>Title</th>
                      <th>Urgency</th>
                      <th>Status</th>
                      <th>Decision</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendaItems
                      .sort((a: any, b: any) => a.agenda_number - b.agenda_number)
                      .map((item: any) => (
                        <tr key={item.id}>
                          <td className="fw-medium">{item.agenda_number}</td>
                          <td>
                            <Link to={`/rvm/dossiers/${item.rvm_dossier?.id}`} className="text-primary">
                              {item.rvm_dossier?.dossier_number}
                            </Link>
                          </td>
                          <td className="text-truncate" style={{ maxWidth: '200px' }}>
                            {item.title_override || item.rvm_dossier?.title || '-'}
                          </td>
                          <td><UrgencyBadge urgency={item.rvm_dossier?.urgency} /></td>
                          <td>{getAgendaStatusBadge(item.status)}</td>
                          <td>
                            {getItemDecision(item) ? (
                              <DecisionLifecycleBadge status={getItemDecision(item).decision_status} isFinal={getItemDecision(item).is_final} />
                            ) : (
                              <span className="text-muted small">-</span>
                            )}
                          </td>
                          <td>{renderActionButtons(item)}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Create Decision Modal */}
      {createDecisionAgendaId && (
        <CreateDecisionModal
          show={!!createDecisionAgendaId}
          onHide={() => setCreateDecisionAgendaId(null)}
          agendaItemId={createDecisionAgendaId}
        />
      )}

      {/* Decision Management Modal */}
      {manageDecisionAgendaId && (
        <DecisionManagementModal
          show={!!manageDecisionAgendaId}
          onHide={() => { setManageDecisionAgendaId(null); setManageDecisionAgendaNum(0) }}
          agendaItemId={manageDecisionAgendaId}
          agendaNumber={manageDecisionAgendaNum}
        />
      )}

      <Footer />
    </>
  )
}

export default MeetingDetailPage
