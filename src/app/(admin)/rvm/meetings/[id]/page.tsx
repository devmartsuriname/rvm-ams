import { useState, useRef } from 'react'
import Footer from '@/components/layout/Footer'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, Row, Col, Table, Badge, Button, Tabs, Tab } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { useMeeting, useUpdateMeeting } from '@/hooks/useMeetings'
import { useDecisionsByMeeting } from '@/hooks/useDecisions'
import { useAgendaItems, useWithdrawAgendaItem } from '@/hooks/useAgendaItems'
import { useUserRoles } from '@/hooks/useUserRoles'
import { MeetingStatusBadge, UrgencyBadge, DecisionLifecycleBadge, AgendaItemStatusBadge } from '@/components/rvm/StatusBadges'
import { LoadingState, ErrorState } from '@/components/rvm/StateComponents'
import MeetingStatusActions from '@/components/rvm/MeetingStatusActions'
import EditMeetingForm from '@/components/rvm/EditMeetingForm'
import EditAgendaItemForm from '@/components/rvm/EditAgendaItemForm'
import CreateDecisionModal from '@/components/rvm/CreateDecisionModal'
import DecisionManagementModal from '@/components/rvm/DecisionManagementModal'
import CreateAgendaItemModal from '@/components/rvm/CreateAgendaItemModal'
import { getErrorMessage } from '@/utils/rls-error'
import DecisionReport from '@/components/rvm/DecisionReport'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { toast } from 'react-toastify'
import type { Enums } from '@/integrations/supabase/types'
import { formatDateLong } from '@/utils/date'

const MeetingDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data: meeting, isLoading, error, refetch } = useMeeting(id)
  const { data: decisions } = useDecisionsByMeeting(id)
  const { data: agendaItemsData } = useAgendaItems(id)
  const { canEditMeeting, canCreateDecision, canEditDecision, canApproveDecision, canEditAgendaItem } = useUserRoles()
  const updateMeeting = useUpdateMeeting()
  const withdrawAgendaItem = useWithdrawAgendaItem()
  const [editMode, setEditMode] = useState(false)
  const [editingAgendaItemId, setEditingAgendaItemId] = useState<string | null>(null)
  const [showCreateAgendaModal, setShowCreateAgendaModal] = useState(false)

  // Decision modal state
  const [createDecisionAgendaId, setCreateDecisionAgendaId] = useState<string | null>(null)
  const [manageDecisionAgendaId, setManageDecisionAgendaId] = useState<string | null>(null)
  const [manageDecisionAgendaNum, setManageDecisionAgendaNum] = useState<number>(0)

  const formatDate = formatDateLong

  const getMeetingTypeLabel = (type: string | null | undefined) => {
    switch (type) {
      case 'regular': return 'Regular'
      case 'urgent': return 'Urgent'
      case 'special': return 'Special'
      default: return type || '-'
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

  const handleWithdraw = async (itemId: string) => {
    try {
      await withdrawAgendaItem.mutateAsync(itemId)
      toast.success('Agenda item withdrawn')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  // Check if an agenda item has a decision
  const getItemDecision = (item: any) => {
    return item.rvm_decision && item.rvm_decision[0] ? item.rvm_decision[0] : null
  }

  // Determine which action button to show for an agenda item
  const renderDecisionActions = (item: any) => {
    const decision = getItemDecision(item)
    const isFinal = decision?.is_final === true

    if (isFinal) return <Badge bg="dark">Final</Badge>

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

  const agendaItems = agendaItemsData ?? meeting.rvm_agenda_item ?? []
  const sortedAgendaItems = [...agendaItems].sort((a: any, b: any) => a.agenda_number - b.agenda_number)

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

      <Tabs defaultActiveKey="overview" className="mb-3">
        {/* ─── Tab 1: Overview ─── */}
        <Tab eventKey="overview" title="Overview">
          <Row>
            <Col lg={6}>
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
            </Col>

            <Col lg={6}>
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
                          <span className="text-truncate" style={{ maxWidth: '200px' }}>
                            #{decision.rvm_agenda_item?.agenda_number} — {decision.decision_text?.substring(0, 50)}
                          </span>
                          <DecisionLifecycleBadge status={decision.decision_status} isFinal={decision.is_final} />
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* ─── Tab 2: Agenda Items ─── */}
        <Tab eventKey="agenda-items" title={<>Agenda Items <Badge bg="primary" className="ms-1">{agendaItems.length}</Badge></>}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Agenda Items</h5>
              {canEditAgendaItem && !isEditDisabled && (
                <Button variant="primary" size="sm" onClick={() => setShowCreateAgendaModal(true)}>
                  + Add Agenda Item
                </Button>
              )}
            </CardHeader>
            <CardBody className="p-0">
              {sortedAgendaItems.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <p className="mb-1">No items on the agenda yet</p>
                  {canEditAgendaItem && !isEditDisabled && (
                    <small>Click "Add Agenda Item" to get started.</small>
                  )}
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
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAgendaItems.map((item: any) => {
                      if (editingAgendaItemId === item.id) {
                        return (
                          <tr key={item.id}>
                            <td colSpan={8}>
                              <EditAgendaItemForm
                                item={item}
                                onCancel={() => setEditingAgendaItemId(null)}
                              />
                            </td>
                          </tr>
                        )
                      }
                      return (
                        <tr key={item.id}>
                          <td className="fw-medium">{item.agenda_number}</td>
                          <td>
                            <Link to={`/rvm/dossiers/${item.rvm_dossier?.id ?? item.dossier_id}`} className="text-primary">
                              {item.rvm_dossier?.dossier_number ?? '—'}
                            </Link>
                          </td>
                          <td className="text-truncate" style={{ maxWidth: '200px' }}>
                            {item.title_override || item.rvm_dossier?.title || '-'}
                          </td>
                          <td><UrgencyBadge urgency={item.rvm_dossier?.urgency} /></td>
                          <td><AgendaItemStatusBadge status={item.status} /></td>
                          <td>
                            {getItemDecision(item) ? (
                              <DecisionLifecycleBadge status={getItemDecision(item).decision_status} isFinal={getItemDecision(item).is_final} />
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
                          </td>
                          <td className="small text-muted">
                            {item.created_at ? formatDate(item.created_at) : '—'}
                          </td>
                          <td>
                            <div className="d-flex gap-1 flex-wrap">
                              {renderDecisionActions(item)}
                              {canEditAgendaItem && !isEditDisabled && item.status !== 'withdrawn' && (
                                <>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => setEditingAgendaItemId(item.id)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline-warning"
                                    size="sm"
                                    onClick={() => handleWithdraw(item.id)}
                                    disabled={withdrawAgendaItem.isPending}
                                  >
                                    Withdraw
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>

        {/* ─── Tab 3: Decisions ─── */}
        <Tab eventKey="decisions" title={<>Decisions <Badge bg="primary" className="ms-1">{decisions?.length ?? 0}</Badge></>}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Meeting Decisions</h5>
              {decisions && decisions.length > 0 && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    const reportDiv = document.getElementById('meeting-decision-report')
                    if (reportDiv) reportDiv.classList.remove('d-none')
                    setTimeout(() => {
                      window.print()
                      if (reportDiv) reportDiv.classList.add('d-none')
                    }, 200)
                  }}
                >
                  <IconifyIcon icon="bx:printer" className="me-1" />
                  Print Decision Report
                </Button>
              )}
            </CardHeader>
            <CardBody className="p-0">
              {!decisions || decisions.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <p className="mb-0">No decisions recorded for this meeting</p>
                </div>
              ) : (
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '60px' }}>#</th>
                      <th>Decision Text</th>
                      <th>Status</th>
                      <th>Chair Approved</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decisions.map((decision: any) => (
                      <tr key={decision.id}>
                        <td className="fw-medium">
                          {decision.rvm_agenda_item?.agenda_number ?? '—'}
                        </td>
                        <td className="text-truncate" style={{ maxWidth: '300px' }}>
                          {decision.decision_text}
                        </td>
                        <td>
                          <DecisionLifecycleBadge status={decision.decision_status} isFinal={decision.is_final} />
                        </td>
                        <td className="small text-muted">
                          {decision.chair_approved_at
                            ? formatDate(decision.chair_approved_at)
                            : '—'}
                        </td>
                        <td>
                          {decision.is_final ? (
                            <Badge bg="dark">Final</Badge>
                          ) : (canApproveDecision || canEditDecision) ? (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                setManageDecisionAgendaId(decision.agenda_item_id)
                                setManageDecisionAgendaNum(decision.rvm_agenda_item?.agenda_number ?? 0)
                              }}
                            >
                              Manage
                            </Button>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Create Agenda Item Modal */}
      {id && (
        <CreateAgendaItemModal
          show={showCreateAgendaModal}
          onHide={() => setShowCreateAgendaModal(false)}
          meetingId={id}
        />
      )}

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

      {/* Print-only Decision Report */}
      {decisions && decisions.length > 0 && (
        <div id="meeting-decision-report" className="d-none d-print-block">
          <DecisionReport
            decisions={decisions as any}
            meetingInfo={meeting ? {
              meeting_date: meeting.meeting_date,
              meeting_type: meeting.meeting_type,
              location: meeting.location,
              status: meeting.status,
            } : null}
            title="Meeting Decision Report"
          />
        </div>
      )}

      <Footer />
    </>
  )
}

export default MeetingDetailPage
