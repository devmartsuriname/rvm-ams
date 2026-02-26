import { useState } from 'react'
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap'
import { z } from 'zod'
import { useCreateDecision } from '@/hooks/useDecisions'
import { getErrorMessage } from '@/utils/rls-error'
import { toast } from 'react-toastify'

const decisionSchema = z.object({
  decision_text: z.string().min(1, 'Decision text is required').max(5000, 'Decision text must be under 5000 characters'),
})

type Props = { show: boolean; onHide: () => void; agendaItemId: string }

export default function CreateDecisionModal({ show, onHide, agendaItemId }: Props) {
  const createDecision = useCreateDecision()

  const [form, setForm] = useState({ decision_text: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setForm({ decision_text: '' })
    setErrors({})
  }

  const handleClose = () => { resetForm(); onHide() }

  const handleSubmit = async () => {
    const parsed = decisionSchema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.errors.forEach(e => { fieldErrors[e.path[0] as string] = e.message })
      setErrors(fieldErrors)
      return
    }

    try {
      await createDecision.mutateAsync({
        agendaItemId,
        decisionText: form.decision_text,
        status: 'pending',
      })
      toast.success('Decision created successfully')
      handleClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Decision</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Decision Text <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={form.decision_text}
                onChange={e => { setForm({ decision_text: e.target.value }); setErrors({}) }}
                isInvalid={!!errors.decision_text}
                placeholder="Enter the decision text..."
              />
              {errors.decision_text && <div className="invalid-feedback d-block">{errors.decision_text}</div>}
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={createDecision.isPending}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={createDecision.isPending}>
          {createDecision.isPending ? <><Spinner size="sm" className="me-1" /> Creating...</> : 'Create Decision'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
