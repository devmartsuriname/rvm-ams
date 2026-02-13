import { useState, useEffect } from 'react'
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap'
import { z } from 'zod'
import { useCreateTask } from '@/hooks/useTasks'
import { useDossiers } from '@/hooks/useDossiers'
import { useUserRoles } from '@/hooks/useUserRoles'
import { getErrorMessage } from '@/utils/rls-error'
import { toast } from 'react-toastify'
import type { Enums } from '@/integrations/supabase/types'
import { Constants } from '@/integrations/supabase/types'
import { supabase } from '@/integrations/supabase/client'

const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(500),
  dossier_id: z.string().min(1, 'Dossier is required'),
  task_type: z.string().min(1, 'Task type is required'),
  assigned_role_code: z.string().min(1, 'Assigned role is required'),
})

type Props = { show: boolean; onHide: () => void }

export default function CreateTaskModal({ show, onHide }: Props) {
  const { userId } = useUserRoles()
  const createTask = useCreateTask()
  const { data: dossiers } = useDossiers()

  const [roles, setRoles] = useState<{ code: string; name: string }[]>([])
  const [form, setForm] = useState({
    title: '', dossier_id: '', task_type: 'intake' as string,
    assigned_role_code: '', description: '',
    priority: 'normal' as Enums<'task_priority'>, due_at: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (show) {
      supabase.from('app_role').select('code, name').then(({ data }) => {
        if (data) setRoles(data)
      })
    }
  }, [show])

  // Filter editable dossiers only
  const editableDossiers = dossiers?.filter(d =>
    d.status && !['decided', 'archived', 'cancelled'].includes(d.status)
  ) ?? []

  const resetForm = () => {
    setForm({ title: '', dossier_id: '', task_type: 'intake', assigned_role_code: '',
      description: '', priority: 'normal', due_at: '' })
    setErrors({})
  }

  const handleClose = () => { resetForm(); onHide() }

  const handleSubmit = async () => {
    const parsed = taskSchema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.errors.forEach(e => { fieldErrors[e.path[0] as string] = e.message })
      setErrors(fieldErrors)
      return
    }

    try {
      await createTask.mutateAsync({
        title: form.title,
        dossier_id: form.dossier_id,
        task_type: form.task_type as Enums<'task_type'>,
        assigned_role_code: form.assigned_role_code,
        description: form.description || null,
        priority: form.priority,
        due_at: form.due_at || null,
        created_by: userId || null,
      })
      toast.success('Task created successfully')
      handleClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const setField = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Title <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" value={form.title}
                onChange={e => setField('title', e.target.value)}
                isInvalid={!!errors.title} />
              {errors.title && <div className="invalid-feedback d-block">{errors.title}</div>}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Dossier <span className="text-danger">*</span></Form.Label>
              <Form.Select value={form.dossier_id} onChange={e => setField('dossier_id', e.target.value)}
                isInvalid={!!errors.dossier_id}>
                <option value="">-- Select Dossier --</option>
                {editableDossiers.map(d => (
                  <option key={d.id} value={d.id}>{d.dossier_number} — {d.title}</option>
                ))}
              </Form.Select>
              {errors.dossier_id && <div className="invalid-feedback d-block">{errors.dossier_id}</div>}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Task Type <span className="text-danger">*</span></Form.Label>
              <Form.Select value={form.task_type} onChange={e => setField('task_type', e.target.value)}
                isInvalid={!!errors.task_type}>
                {Constants.public.Enums.task_type.map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </Form.Select>
              {errors.task_type && <div className="invalid-feedback d-block">{errors.task_type}</div>}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Assigned Role <span className="text-danger">*</span></Form.Label>
              <Form.Select value={form.assigned_role_code}
                onChange={e => setField('assigned_role_code', e.target.value)}
                isInvalid={!!errors.assigned_role_code}>
                <option value="">-- Select Role --</option>
                {roles.map(r => (
                  <option key={r.code} value={r.code}>{r.name}</option>
                ))}
              </Form.Select>
              {errors.assigned_role_code && <div className="invalid-feedback d-block">{errors.assigned_role_code}</div>}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Priority</Form.Label>
              <Form.Select value={form.priority} onChange={e => setField('priority', e.target.value)}>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Due Date</Form.Label>
              <Form.Control type="datetime-local" value={form.due_at}
                onChange={e => setField('due_at', e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.description}
                onChange={e => setField('description', e.target.value)} />
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={createTask.isPending}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={createTask.isPending}>
          {createTask.isPending ? <><Spinner size="sm" className="me-1" /> Creating...</> : 'Create Task'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
