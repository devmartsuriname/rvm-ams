import Footer from '@/components/layout/Footer'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, Table, Form, Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useDossiers } from '@/hooks/useDossiers'
import { DossierStatusBadge, UrgencyBadge, ServiceTypeBadge } from '@/components/rvm/StatusBadges'
import { EmptyState, LoadingState, ErrorState } from '@/components/rvm/StateComponents'
import { useState } from 'react'
import type { Enums } from '@/integrations/supabase/types'

type DossierStatus = Enums<'dossier_status'>
type ServiceType = Enums<'service_type'>

const DossierListPage = () => {
  const [statusFilter, setStatusFilter] = useState<DossierStatus | ''>('')
  const [typeFilter, setTypeFilter] = useState<ServiceType | ''>('')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: dossiers, isLoading, error, refetch } = useDossiers({
    status: statusFilter || undefined,
    service_type: typeFilter || undefined,
    search: searchTerm || undefined,
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      <PageTitle subName="RVM Core" title="Dossiers" />
      
      {/* Filters */}
      <Card className="mb-3">
        <CardBody>
          <Row className="g-2">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Search dossier number or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as DossierStatus | '')}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="registered">Registered</option>
                <option value="in_preparation">In Preparation</option>
                <option value="scheduled">Scheduled</option>
                <option value="decided">Decided</option>
                <option value="archived">Archived</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value as ServiceType | '')}
              >
                <option value="">All Types</option>
                <option value="proposal">Proposal</option>
                <option value="missive">Missive</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={() => {
                  setStatusFilter('')
                  setTypeFilter('')
                  setSearchTerm('')
                }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Data Table */}
      {isLoading ? (
        <LoadingState message="Loading dossiers..." />
      ) : error ? (
        <ErrorState message="Failed to load dossiers" onRetry={() => refetch()} />
      ) : !dossiers || dossiers.length === 0 ? (
        <EmptyState 
          icon="bx:folder-open" 
          title="No Dossiers Found" 
          description="No dossiers match your current filters."
        />
      ) : (
        <Card>
          <CardHeader>
            <h5 className="card-title mb-0">Dossiers ({dossiers.length})</h5>
          </CardHeader>
          <CardBody className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Dossier #</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dossiers.map((dossier) => (
                  <tr key={dossier.id}>
                    <td>
                      <Link to={`/rvm/dossiers/${dossier.id}`} className="text-primary">
                        {dossier.dossier_number}
                      </Link>
                    </td>
                    <td>{dossier.title}</td>
                    <td><ServiceTypeBadge type={dossier.service_type} /></td>
                    <td><UrgencyBadge urgency={dossier.urgency} /></td>
                    <td><DossierStatusBadge status={dossier.status} /></td>
                    <td>{formatDate(dossier.created_at)}</td>
                    <td className="text-end">
                      <Link 
                        to={`/rvm/dossiers/${dossier.id}`} 
                        className="btn btn-sm btn-outline-primary"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      <Footer />
    </>
  )
}

export default DossierListPage
