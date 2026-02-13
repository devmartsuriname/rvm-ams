import { useState } from 'react'
import { Card, CardBody, CardHeader } from 'react-bootstrap'
import { Row, Col, Form, Table } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import { useAuditEvents, type AuditEventFilters } from '@/hooks/useAuditEvents'
import { useUserRoles } from '@/hooks/useUserRoles'
import { format } from 'date-fns'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

const ENTITY_TYPES = ['rvm_dossier', 'rvm_meeting', 'rvm_task', 'rvm_agenda_item', 'rvm_decision', 'rvm_document', 'rvm_document_version']
const EVENT_TYPES = ['created', 'updated', 'status_changed', 'deleted']

const AuditLogPage = () => {
  const { canViewAudit } = useUserRoles()
  const [filters, setFilters] = useState<AuditEventFilters>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: events, isLoading, error } = useAuditEvents(filters)

  if (!canViewAudit) {
    return (
      <>
        <PageTitle title="Audit Log" subName="RVM" />
        <Card>
          <CardBody className="text-center py-5">
            <IconifyIcon icon="bx:shield-x" className="fs-1 text-danger mb-3 d-block" />
            <h4>Access Denied</h4>
            <p className="text-muted">You do not have permission to view audit logs.</p>
          </CardBody>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Audit Log" subName="RVM" />
      <Card>
        <CardHeader>
          <Row className="align-items-end g-2">
            <Col md={3}>
              <Form.Label className="small mb-1">Entity Type</Form.Label>
              <Form.Select
                size="sm"
                value={filters.entity_type ?? ''}
                onChange={(e) => setFilters(f => ({ ...f, entity_type: e.target.value || undefined }))}
              >
                <option value="">All Entities</option>
                {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="small mb-1">Event Type</Form.Label>
              <Form.Select
                size="sm"
                value={filters.event_type ?? ''}
                onChange={(e) => setFilters(f => ({ ...f, event_type: e.target.value || undefined }))}
              >
                <option value="">All Events</option>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Col>
            <Col md={6} className="text-end">
              <span className="text-muted small">
                Showing max 50 records · Ordered by most recent
              </span>
            </Col>
          </Row>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading && <div className="text-center py-4">Loading audit events…</div>}
          {error && <div className="text-center py-4 text-danger">Failed to load audit events.</div>}
          {events && events.length === 0 && (
            <div className="text-center py-4 text-muted">No audit events found.</div>
          )}
          {events && events.length > 0 && (
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Occurred At</th>
                  <th>Entity Type</th>
                  <th>Entity ID</th>
                  <th>Event</th>
                  <th>Actor</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {events.map(evt => {
                  const isExpanded = expandedId === evt.id
                  return (
                    <>
                      <tr
                        key={evt.id}
                        onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <IconifyIcon
                            icon={isExpanded ? 'bx:chevron-down' : 'bx:chevron-right'}
                            className="fs-5"
                          />
                        </td>
                        <td className="text-nowrap small">
                          {evt.occurred_at ? format(new Date(evt.occurred_at), 'yyyy-MM-dd HH:mm:ss') : '—'}
                        </td>
                        <td><span className="badge bg-secondary-subtle text-secondary">{evt.entity_type}</span></td>
                        <td className="font-monospace small" title={evt.entity_id}>
                          {evt.entity_id.substring(0, 8)}…
                        </td>
                        <td><span className="badge bg-primary-subtle text-primary">{evt.event_type}</span></td>
                        <td className="font-monospace small">
                          {evt.actor_user_id ? evt.actor_user_id.substring(0, 8) + '…' : 'System'}
                        </td>
                        <td className="small">{evt.actor_role_code ?? '—'}</td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${evt.id}-payload`}>
                          <td colSpan={7} className="bg-light p-3">
                            <pre className="mb-0 small" style={{ maxHeight: 400, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                              {JSON.stringify(evt.event_payload, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </>
  )
}

export default AuditLogPage
