import Footer from '@/components/layout/Footer'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, Row, Col, Button } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { useDossier } from '@/hooks/useDossiers'
import { useTasksByDossier } from '@/hooks/useTasks'
import { DossierStatusBadge, UrgencyBadge, ServiceTypeBadge, TaskStatusBadge } from '@/components/rvm/StatusBadges'
import { LoadingState, ErrorState, EmptyState } from '@/components/rvm/StateComponents'

const DossierDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data: dossier, isLoading, error, refetch } = useDossier(id)
  const { data: tasks } = useTasksByDossier(id)

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <>
        <PageTitle subName="RVM Core" title="Dossier Details" />
        <LoadingState message="Loading dossier..." />
        <Footer />
      </>
    )
  }

  if (error || !dossier) {
    return (
      <>
        <PageTitle subName="RVM Core" title="Dossier Details" />
        <ErrorState message="Failed to load dossier" onRetry={() => refetch()} />
        <Footer />
      </>
    )
  }

  return (
    <>
      <PageTitle subName="RVM Core" title={dossier.dossier_number} />

      <Row className="mb-3">
        <Col>
          <Link to="/rvm/dossiers" className="btn btn-outline-secondary btn-sm">
            ← Back to Dossiers
          </Link>
        </Col>
      </Row>

      <Row>
        {/* Main Info Card */}
        <Col lg={8}>
          <Card className="mb-3">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Dossier Information</h5>
              <DossierStatusBadge status={dossier.status} />
            </CardHeader>
            <CardBody>
              <Row className="mb-3">
                <Col md={6}>
                  <label className="text-muted small">Dossier Number</label>
                  <p className="mb-0 fw-medium">{dossier.dossier_number}</p>
                </Col>
                <Col md={6}>
                  <label className="text-muted small">Type</label>
                  <p className="mb-0"><ServiceTypeBadge type={dossier.service_type} /></p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <label className="text-muted small">Title</label>
                  <p className="mb-0 fw-medium">{dossier.title}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <label className="text-muted small">Sender Ministry</label>
                  <p className="mb-0">{dossier.sender_ministry}</p>
                </Col>
                <Col md={6}>
                  <label className="text-muted small">Urgency</label>
                  <p className="mb-0"><UrgencyBadge urgency={dossier.urgency} /></p>
                </Col>
              </Row>
              {dossier.service_type === 'proposal' && dossier.proposal_subtype && (
                <Row className="mb-3">
                  <Col md={6}>
                    <label className="text-muted small">Proposal Subtype</label>
                    <p className="mb-0">{dossier.proposal_subtype}</p>
                  </Col>
                </Row>
              )}
              {dossier.summary && (
                <Row className="mb-3">
                  <Col md={12}>
                    <label className="text-muted small">Summary</label>
                    <p className="mb-0">{dossier.summary}</p>
                  </Col>
                </Row>
              )}
              <Row>
                <Col md={6}>
                  <label className="text-muted small">Created</label>
                  <p className="mb-0">{formatDate(dossier.created_at)}</p>
                </Col>
                <Col md={6}>
                  <label className="text-muted small">Last Updated</label>
                  <p className="mb-0">{formatDate(dossier.updated_at)}</p>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Linked Item */}
          {dossier.rvm_item && (
            <Card className="mb-3">
              <CardHeader>
                <h5 className="card-title mb-0">Linked Item</h5>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={6}>
                    <label className="text-muted small">Reference Code</label>
                    <p className="mb-0">{dossier.rvm_item.reference_code || '-'}</p>
                  </Col>
                  <Col md={6}>
                    <label className="text-muted small">Received Date</label>
                    <p className="mb-0">{formatDate(dossier.rvm_item.received_date)}</p>
                  </Col>
                </Row>
                {dossier.rvm_item.description && (
                  <Row className="mt-3">
                    <Col md={12}>
                      <label className="text-muted small">Description</label>
                      <p className="mb-0">{dossier.rvm_item.description}</p>
                    </Col>
                  </Row>
                )}
              </CardBody>
            </Card>
          )}
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Tasks Card */}
          <Card className="mb-3">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0">Related Tasks</h6>
              <span className="badge bg-secondary">{tasks?.length ?? 0}</span>
            </CardHeader>
            <CardBody className="p-0">
              {!tasks || tasks.length === 0 ? (
                <div className="text-center text-muted py-3">
                  <small>No tasks linked to this dossier</small>
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {tasks.slice(0, 5).map((task) => (
                    <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="text-truncate" style={{ maxWidth: '200px' }}>{task.title}</span>
                      <TaskStatusBadge status={task.status} />
                    </li>
                  ))}
                  {tasks.length > 5 && (
                    <li className="list-group-item text-center">
                      <Link to={`/rvm/tasks?dossier=${id}`} className="text-primary small">
                        View all {tasks.length} tasks →
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </CardBody>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <h6 className="card-title mb-0">Quick Info</h6>
            </CardHeader>
            <CardBody>
              <ul className="list-unstyled mb-0">
                <li className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Confidentiality</span>
                  <span className="text-capitalize">{dossier.confidentiality_level?.replace('_', ' ') ?? '-'}</span>
                </li>
                <li className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Status</span>
                  <DossierStatusBadge status={dossier.status} />
                </li>
                <li className="d-flex justify-content-between py-1">
                  <span className="text-muted">Urgency</span>
                  <UrgencyBadge urgency={dossier.urgency} />
                </li>
              </ul>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Footer />
    </>
  )
}

export default DossierDetailPage
