import Footer from '@/components/layout/Footer'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, Row, Col, Table, Badge } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { useMeeting } from '@/hooks/useMeetings'
import { useDecisionsByMeeting } from '@/hooks/useDecisions'
import { MeetingStatusBadge, DossierStatusBadge, UrgencyBadge, DecisionStatusBadge } from '@/components/rvm/StatusBadges'
import { LoadingState, ErrorState, EmptyState } from '@/components/rvm/StateComponents'

const MeetingDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data: meeting, isLoading, error, refetch } = useMeeting(id)
  const { data: decisions } = useDecisionsByMeeting(id)

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
        <Col>
          <Link to="/rvm/meetings" className="btn btn-outline-secondary btn-sm">
            ← Back to Meetings
          </Link>
        </Col>
      </Row>

      <Row>
        {/* Meeting Info Card */}
        <Col lg={4}>
          <Card className="mb-3">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Meeting Info</h5>
              <MeetingStatusBadge status={meeting.status} />
            </CardHeader>
            <CardBody>
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
                      <DecisionStatusBadge status={decision.decision_status} />
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
                            {item.rvm_decision && item.rvm_decision[0] ? (
                              <DecisionStatusBadge status={item.rvm_decision[0].decision_status} />
                            ) : (
                              <span className="text-muted small">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Footer />
    </>
  )
}

export default MeetingDetailPage
