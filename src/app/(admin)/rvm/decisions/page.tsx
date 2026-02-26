import React, { useState } from 'react'
import Footer from '@/components/layout/Footer'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, Table, Form, Row, Col, Button, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAllDecisions } from '@/hooks/useDecisions'
import { DecisionLifecycleBadge } from '@/components/rvm/StatusBadges'
import { EmptyState, LoadingState, ErrorState } from '@/components/rvm/StateComponents'
import type { Enums } from '@/integrations/supabase/types'

type DecisionStatus = Enums<'decision_status'>

const DecisionListPage = () => {
  const [statusFilter, setStatusFilter] = useState<DecisionStatus | ''>('')
  const { data: decisions, isLoading, error, refetch } = useAllDecisions()

  const filtered = decisions?.filter((d) => {
    if (statusFilter && d.decision_status !== statusFilter) return false
    return true
  })

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const truncateText = (text: string, maxLen = 60) => {
    return text.length > maxLen ? text.substring(0, maxLen) + '…' : text
  }

  return (
    <>
      <PageTitle subName="RVM Core" title="Decisions" />

      {/* Filters */}
      <Card className="mb-3">
        <CardBody>
          <Row className="g-2">
            <Col md={4}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DecisionStatus | '')}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="deferred">Deferred</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => setStatusFilter('')}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Data Table */}
      {isLoading ? (
        <LoadingState message="Loading decisions..." />
      ) : error ? (
        <ErrorState message="Failed to load decisions" onRetry={() => refetch()} />
      ) : !filtered || filtered.length === 0 ? (
        <EmptyState
          icon="bx:check-circle"
          title="No Decisions Found"
          description="No decisions match your current filters."
        />
      ) : (
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Decisions ({filtered.length})</h5>
          </CardHeader>
          <CardBody className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Decision Text</th>
                  <th>Dossier</th>
                  <th>Meeting</th>
                  <th>Lifecycle</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((decision) => {
                  const agendaItem = decision.rvm_agenda_item
                  const dossier = agendaItem?.rvm_dossier as { id: string; dossier_number: string; title: string } | null

                  return (
                    <tr key={decision.id}>
                      <td className="text-truncate" style={{ maxWidth: '250px' }}>
                        {truncateText(decision.decision_text)}
                      </td>
                      <td>
                        {dossier ? (
                          <Link to={`/rvm/dossiers/${dossier.id}`} className="text-primary">
                            {dossier.dossier_number}
                          </Link>
                        ) : '-'}
                      </td>
                      <td>
                        {agendaItem?.meeting_id ? (
                          <Link to={`/rvm/meetings/${agendaItem.meeting_id}`} className="text-primary">
                            View Meeting
                          </Link>
                        ) : '-'}
                      </td>
                      <td>
                        <DecisionLifecycleBadge status={decision.decision_status} isFinal={decision.is_final} />
                      </td>
                      <td>{formatDate(decision.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      <Footer />
    </>
  )
}

export default DecisionListPage
