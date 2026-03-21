import { Row, Col, Card, Table, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useChairDashboard } from '@/hooks/useDashboardStats'
import { LoadingState, ErrorState } from '@/components/rvm/StateComponents'
import { StatCard } from './StatCard'
import { DecisionStatusBadge, MeetingStatusBadge } from '@/components/rvm/StatusBadges'
import { formatDate } from '@/utils/date'

const ChairDashboard = () => {
  const { data: stats, isLoading, isError, refetch } = useChairDashboard()

  if (isLoading) return <LoadingState message="Loading Chair dashboard..." />
  if (isError) return <ErrorState message="Failed to load dashboard data" onRetry={refetch} />

  return (
    <>
      {/* Governance Alerts */}
      <Row>
        <Col lg={4}>
          <StatCard
            label="Decisions Pending Approval"
            value={stats?.decisionsPendingApproval ?? 0}
            icon="bx:check-shield"
            iconColor="text-warning"
          />
        </Col>
        <Col lg={4}>
          <StatCard
            label="Meetings Pending Closure"
            value={stats?.meetingsPendingClosure ?? 0}
            icon="bx:calendar-exclamation"
            iconColor="text-danger"
          />
        </Col>
        <Col lg={4}>
          <StatCard
            label="Upcoming Meetings"
            value={stats?.upcomingMeetings.length ?? 0}
            icon="bx:calendar-event"
            iconColor="text-info"
          />
        </Col>
      </Row>

      {/* Decisions Awaiting Approval */}
      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Decisions Awaiting Approval</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Agenda #</th>
                      <th>Decision Text</th>
                      <th>Meeting Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.pendingDecisions ?? []).length === 0 ? (
                      <tr><td colSpan={4} className="text-center text-muted py-3">No decisions awaiting approval</td></tr>
                    ) : (
                      stats?.pendingDecisions.map(d => (
                        <tr key={d.id}>
                          <td>{d.rvm_agenda_item?.agenda_number ?? '—'}</td>
                          <td>{d.decision_text.length > 80 ? d.decision_text.substring(0, 80) + '…' : d.decision_text}</td>
                          <td>
                            {d.rvm_agenda_item?.rvm_meeting ? (
                              <Link to={`/rvm/meetings/${d.rvm_agenda_item.rvm_meeting.id}`}>
                                {formatDate(d.rvm_agenda_item.rvm_meeting.meeting_date)}
                              </Link>
                            ) : '—'}
                          </td>
                          <td><DecisionStatusBadge status={d.decision_status as any} /></td>
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

      <Row>
        {/* Upcoming Meetings */}
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

        {/* Recently Finalized */}
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Recently Finalized Decisions</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Decision</th>
                      <th>Meeting</th>
                      <th>Finalized</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recentlyFinalized ?? []).length === 0 ? (
                      <tr><td colSpan={3} className="text-center text-muted py-3">No finalized decisions yet</td></tr>
                    ) : (
                      stats?.recentlyFinalized.map(d => (
                        <tr key={d.id}>
                          <td>{d.decision_text.length > 60 ? d.decision_text.substring(0, 60) + '…' : d.decision_text}</td>
                          <td>
                            {d.rvm_agenda_item?.rvm_meeting ? (
                              <Link to={`/rvm/meetings/${d.rvm_agenda_item.rvm_meeting.id}`}>
                                {formatDate(d.rvm_agenda_item.rvm_meeting.meeting_date)}
                              </Link>
                            ) : '—'}
                          </td>
                          <td>{d.chair_approved_at ? formatDate(d.chair_approved_at) : formatDate(d.updated_at)}</td>
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

export default ChairDashboard
