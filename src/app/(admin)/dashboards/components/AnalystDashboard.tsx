import { Row, Col, Card, Table, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAnalystDashboard } from '@/hooks/useDashboardStats'
import { LoadingState, ErrorState } from '@/components/rvm/StateComponents'
import { StatCard } from './StatCard'
import { DossierStatusBadge, TaskStatusBadge } from '@/components/rvm/StatusBadges'
import { formatDate } from '@/utils/date'

const AnalystDashboard = () => {
  const { data: stats, isLoading, isError, refetch } = useAnalystDashboard()

  if (isLoading) return <LoadingState message="Loading Analyst dashboard..." />
  if (isError) return <ErrorState message="Failed to load dashboard data" onRetry={refetch} />

  return (
    <>
      {/* KPI Row */}
      <Row>
        <Col lg={4}>
          <StatCard
            label="Active Dossiers"
            value={stats?.activeDossiersCount ?? 0}
            icon="bx:folder-open"
            iconColor="text-success"
          />
        </Col>
        <Col lg={4}>
          <StatCard
            label="Pending Tasks"
            value={stats?.pendingTasksCount ?? 0}
            icon="bx:task"
            iconColor="text-warning"
          />
        </Col>
        <Col lg={4}>
          <StatCard
            label="Scheduled Agenda Items"
            value={stats?.scheduledAgendaCount ?? 0}
            icon="bx:list-ol"
            iconColor="text-info"
          />
        </Col>
      </Row>

      <Row>
        {/* Dossiers In Analysis */}
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Dossiers In Analysis</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Dossier #</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Ministry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.dossiersInAnalysis ?? []).length === 0 ? (
                      <tr><td colSpan={4} className="text-center text-muted py-3">No dossiers in analysis</td></tr>
                    ) : (
                      stats?.dossiersInAnalysis.map(d => (
                        <tr key={d.id}>
                          <td><Link to={`/rvm/dossiers/${d.id}`}>{d.dossier_number}</Link></td>
                          <td>{d.title.length > 40 ? d.title.substring(0, 40) + '…' : d.title}</td>
                          <td><DossierStatusBadge status={d.status} /></td>
                          <td>{d.sender_ministry}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Assigned Tasks */}
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Assigned Tasks</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.assignedTasks ?? []).length === 0 ? (
                      <tr><td colSpan={4} className="text-center text-muted py-3">No pending tasks</td></tr>
                    ) : (
                      stats?.assignedTasks.map(t => (
                        <tr key={t.id}>
                          <td>{t.title.length > 40 ? t.title.substring(0, 40) + '…' : t.title}</td>
                          <td>
                            <Badge bg={t.priority === 'urgent' ? 'danger' : t.priority === 'high' ? 'warning' : 'secondary'} className="text-capitalize">
                              {t.priority ?? 'normal'}
                            </Badge>
                          </td>
                          <td><TaskStatusBadge status={t.status} /></td>
                          <td>{t.due_at ? formatDate(t.due_at) : '—'}</td>
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

      {/* Agenda Drafts */}
      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Agenda Drafts</h5>
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
                    {(stats?.agendaDrafts ?? []).length === 0 ? (
                      <tr><td colSpan={3} className="text-center text-muted py-3">No scheduled agenda items</td></tr>
                    ) : (
                      stats?.agendaDrafts.map(a => (
                        <tr key={a.id}>
                          <td>{a.agenda_number}</td>
                          <td>
                            {a.rvm_dossier ? (
                              <Link to={`/rvm/dossiers/${a.rvm_dossier.id}`}>
                                {a.rvm_dossier.title.length > 50 ? a.rvm_dossier.title.substring(0, 50) + '…' : a.rvm_dossier.title}
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
    </>
  )
}

export default AnalystDashboard
