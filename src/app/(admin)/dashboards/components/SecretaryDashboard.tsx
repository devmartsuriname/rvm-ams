import { Row, Col, Card, Table, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useSecretaryDashboard } from '@/hooks/useDashboardStats'
import { LoadingState, ErrorState } from '@/components/rvm/StateComponents'
import { StatCard } from './StatCard'
import { MeetingStatusBadge, DecisionStatusBadge } from '@/components/rvm/StatusBadges'
import { formatDate } from '@/utils/date'

const SecretaryDashboard = () => {
  const { data: stats, isLoading, isError, refetch } = useSecretaryDashboard()

  if (isLoading) return <LoadingState message="Loading Secretary dashboard..." />
  if (isError) return <ErrorState message="Failed to load dashboard data" onRetry={refetch} />

  return (
    <>
      {/* KPI Row */}
      <Row>
        <Col lg={4}>
          <StatCard
            label="Upcoming Meetings"
            value={stats?.upcomingMeetingsCount ?? 0}
            icon="bx:calendar-event"
            iconColor="text-info"
          />
        </Col>
        <Col lg={4}>
          <StatCard
            label="Pending Agenda Items"
            value={stats?.pendingAgendaCount ?? 0}
            icon="bx:list-ol"
            iconColor="text-warning"
          />
        </Col>
        <Col lg={4}>
          <StatCard
            label="Decisions Awaiting Documentation"
            value={stats?.pendingDecisionsCount ?? 0}
            icon="bx:file"
            iconColor="text-danger"
          />
        </Col>
      </Row>

      {/* Upcoming Meetings */}
      <Row>
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Upcoming Meetings</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.upcomingMeetings ?? []).length === 0 ? (
                      <tr><td colSpan={4} className="text-center text-muted py-3">No upcoming meetings</td></tr>
                    ) : (
                      stats?.upcomingMeetings.map(m => (
                        <tr key={m.id}>
                          <td><Link to={`/rvm/meetings/${m.id}`}>{formatDate(m.meeting_date)}</Link></td>
                          <td><Badge bg="info" className="text-capitalize">{m.meeting_type ?? 'regular'}</Badge></td>
                          <td>{m.location ?? '—'}</td>
                          <td><MeetingStatusBadge status={m.status as any} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Agenda Items Needing Preparation */}
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Agenda Items Needing Preparation</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Agenda #</th>
                      <th>Dossier</th>
                      <th>Meeting Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.agendaItemsNeedingPrep ?? []).length === 0 ? (
                      <tr><td colSpan={3} className="text-center text-muted py-3">No agenda items pending</td></tr>
                    ) : (
                      stats?.agendaItemsNeedingPrep.map(a => (
                        <tr key={a.id}>
                          <td>{a.agenda_number}</td>
                          <td>
                            {a.rvm_dossier ? (
                              <Link to={`/rvm/dossiers/${a.rvm_dossier.id}`}>
                                {a.rvm_dossier.dossier_number} — {a.rvm_dossier.title.length > 40 ? a.rvm_dossier.title.substring(0, 40) + '…' : a.rvm_dossier.title}
                              </Link>
                            ) : '—'}
                          </td>
                          <td>
                            {a.rvm_meeting ? (
                              <Link to={`/rvm/meetings/${a.rvm_meeting.id}`}>{formatDate(a.rvm_meeting.meeting_date)}</Link>
                            ) : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Decisions Awaiting Documentation */}
      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Decisions Awaiting Documentation</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Agenda #</th>
                      <th>Decision Text</th>
                      <th>Status</th>
                      <th>Meeting</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.decisionsAwaitingDoc ?? []).length === 0 ? (
                      <tr><td colSpan={4} className="text-center text-muted py-3">No decisions awaiting documentation</td></tr>
                    ) : (
                      stats?.decisionsAwaitingDoc.map(d => (
                        <tr key={d.id}>
                          <td>{d.rvm_agenda_item?.agenda_number ?? '—'}</td>
                          <td>{d.decision_text.length > 80 ? d.decision_text.substring(0, 80) + '…' : d.decision_text}</td>
                          <td><DecisionStatusBadge status={d.decision_status as any} /></td>
                          <td>
                            {d.rvm_agenda_item?.rvm_meeting ? (
                              <Link to={`/rvm/meetings/${d.rvm_agenda_item.rvm_meeting.id}`}>
                                {formatDate(d.rvm_agenda_item.rvm_meeting.meeting_date)}
                              </Link>
                            ) : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default SecretaryDashboard
