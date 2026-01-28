import Footer from '@/components/layout/Footer'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, Table, Form, Row, Col, Button, Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useTasks } from '@/hooks/useTasks'
import { TaskStatusBadge, PriorityBadge } from '@/components/rvm/StatusBadges'
import { EmptyState, LoadingState, ErrorState } from '@/components/rvm/StateComponents'
import { useState } from 'react'
import type { Enums } from '@/integrations/supabase/types'

type TaskStatus = Enums<'task_status'>

const TaskListPage = () => {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'done'>('all')

  const getStatusFromTab = (): TaskStatus | undefined => {
    if (activeTab === 'pending') return 'todo'
    if (activeTab === 'done') return 'done'
    return statusFilter || undefined
  }

  const { data: tasks, isLoading, error, refetch } = useTasks({
    status: getStatusFromTab(),
  })

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('nl-NL', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getTaskTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      intake: 'Intake',
      dossier_management: 'Dossier Mgmt',
      agenda_prep: 'Agenda Prep',
      reporting: 'Reporting',
      review: 'Review',
      distribution: 'Distribution',
      other: 'Other',
    }
    return labels[type] || type
  }

  const isOverdue = (dueAt: string | null | undefined, status: string | null | undefined) => {
    if (!dueAt || status === 'done' || status === 'cancelled') return false
    return new Date(dueAt) < new Date()
  }

  return (
    <>
      <PageTitle subName="RVM Core" title="Tasks" />
      
      {/* Tabs */}
      <Card className="mb-3">
        <CardBody className="pb-0">
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'all'} 
                onClick={() => setActiveTab('all')}
                style={{ cursor: 'pointer' }}
              >
                All Tasks
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'pending'} 
                onClick={() => setActiveTab('pending')}
                style={{ cursor: 'pointer' }}
              >
                Pending
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'done'} 
                onClick={() => setActiveTab('done')}
                style={{ cursor: 'pointer' }}
              >
                Completed
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </CardBody>
      </Card>

      {/* Filters (only for All tab) */}
      {activeTab === 'all' && (
        <Card className="mb-3">
          <CardBody>
            <Row className="g-2">
              <Col md={4}>
                <Form.Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
                >
                  <option value="">All Statuses</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
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
      )}

      {/* Data Table */}
      {isLoading ? (
        <LoadingState message="Loading tasks..." />
      ) : error ? (
        <ErrorState message="Failed to load tasks" onRetry={() => refetch()} />
      ) : !tasks || tasks.length === 0 ? (
        <EmptyState 
          icon="bx:task" 
          title="No Tasks Found" 
          description="No tasks match your current filters."
        />
      ) : (
        <Card>
          <CardHeader>
            <h5 className="card-title mb-0">Tasks ({tasks.length})</h5>
          </CardHeader>
          <CardBody className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Dossier</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className={isOverdue(task.due_at, task.status) ? 'table-danger' : ''}>
                    <td className="text-truncate" style={{ maxWidth: '250px' }}>
                      {task.title}
                    </td>
                    <td>
                      {task.rvm_dossier ? (
                        <Link to={`/rvm/dossiers/${task.rvm_dossier.id}`} className="text-primary">
                          {task.rvm_dossier.dossier_number}
                        </Link>
                      ) : '-'}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {getTaskTypeLabel(task.task_type)}
                      </span>
                    </td>
                    <td><PriorityBadge priority={task.priority} /></td>
                    <td><TaskStatusBadge status={task.status} /></td>
                    <td className={isOverdue(task.due_at, task.status) ? 'text-danger fw-medium' : ''}>
                      {formatDate(task.due_at)}
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

export default TaskListPage
