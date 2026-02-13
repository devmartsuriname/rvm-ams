import { useState, useEffect } from 'react'
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap'
import { z } from 'zod'
import type { Enums } from '@/integrations/supabase/types'
import { Constants } from '@/integrations/supabase/types'
import type { Task } from '@/services/taskService'
import { supabase } from '@/integrations/supabase/client'

const taskEditSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(500),
  task_type: z.string().min(1, 'Task type is required'),
  assigned_role_code: z.string().min(1, 'Assigned role is required'),
})

export type TaskFormData = {
  title: string
  task_type: Enums<'task_type'>
  assigned_role_code: string
  priority: Enums<'task_priority'>
  due_at: string | null
  description: string | null
}

type Props = {
  task: Task
  onSave: (data: TaskFormData) => void
  onCancel: () => void
  isLoading: boolean
}

const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    return d.toISOString().slice(0, 16)
  } catch {
    return ''
  }
}

export default function EditTaskForm({ task, onSave, onCancel, isLoading }: Props) {
  const [roles, setRoles] = useState<{ code: string; name: string }[]>([])
  const [form, setForm] = useState({
    title: task.title,
    task_type: task.task_type as string,
    assigned_role_code: task.assigned_role_code,
    priority: task.priority ?? 'normal' as Enums<'task_priority'>,
    due_at: formatDateForInput(task.due_at),
    description: task.description ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    supabase.from('app_role').select('code, name').then(({ data }) => {
      if (data) setRoles(data)
    })
  }, [])

  const setField = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = () => {
    const parsed = taskEditSchema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.errors.forEach(e => {
        fieldErrors[e.path[0] as string] = e.message
      })
      setErrors(fieldErrors)
      return
    }

    onSave({
      title: form.title,
      task_type: form.task_type as Enums<'task_type'>,
      assigned_role_code: form.assigned_role_code,
      priority: form.priority as Enums<'task_priority'>,
      due_at: form.due_at || null,
      description: form.description || null,
    })
  }

  return (
    <div className="p-3 bg-light border rounded">
      <h6 className="mb-3">Edit Task</h6>
      <Row className="g-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Title <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text" value={form.title}
              onChange={e => setField('title', e.target.value)}
              isInvalid={!!errors.title} disabled={isLoading}
            />
            {errors.title && <div className="invalid-feedback d-block">{errors.title}</div>}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Task Type <span className="text-danger">*</span></Form.Label>
            <Form.Select value={form.task_type} onChange={e => setField('task_type', e.target.value)}
              isInvalid={!!errors.task_type} disabled={isLoading}>
              {Constants.public.Enums.task_type.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
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
              isInvalid={!!errors.assigned_role_code} disabled={isLoading}>
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
            <Form.Select value={form.priority} onChange={e => setField('priority', e.target.value)} disabled={isLoading}>
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
              onChange={e => setField('due_at', e.target.value)} disabled={isLoading} />
          </Form.Group>
        </Col>
        <Col md={12}>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={2} value={form.description}
              onChange={e => setField('description', e.target.value)} disabled={isLoading} />
          </Form.Group>
        </Col>
        <Col md={12}>
          <Form.Group>
            <Form.Label>Dossier</Form.Label>
            <Form.Control type="text" value={task.dossier_id} disabled readOnly
              className="text-muted" />
            <Form.Text className="text-muted">Dossier assignment cannot be changed.</Form.Text>
          </Form.Group>
        </Col>
        <Col md={12} className="d-flex justify-content-end gap-2 mt-3">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <><Spinner size="sm" className="me-1" /> Saving...</> : 'Save Changes'}
          </Button>
        </Col>
      </Row>
    </div>
  )
}
