import { useState } from 'react'
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap'
import { z } from 'zod'

const decisionEditSchema = z.object({
  decision_text: z.string().min(1, 'Decision text is required').max(5000, 'Decision text must be under 5000 characters'),
})

type DecisionData = {
  id: string
  decision_text: string
}

type Props = {
  decision: DecisionData
  onSave: (data: { decision_text: string }) => void
  onCancel: () => void
  isLoading: boolean
}

export default function EditDecisionForm({ decision, onSave, onCancel, isLoading }: Props) {
  const [form, setForm] = useState({ decision_text: decision.decision_text })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const parsed = decisionEditSchema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.errors.forEach(e => { fieldErrors[e.path[0] as string] = e.message })
      setErrors(fieldErrors)
      return
    }
    onSave(form)
  }

  return (
    <Row className="g-3">
      <Col md={12}>
        <Form.Group>
          <Form.Label>Decision Text <span className="text-danger">*</span></Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={form.decision_text}
            onChange={e => { setForm({ decision_text: e.target.value }); setErrors({}) }}
            isInvalid={!!errors.decision_text}
            disabled={isLoading}
          />
          {errors.decision_text && <div className="invalid-feedback d-block">{errors.decision_text}</div>}
        </Form.Group>
      </Col>
      <Col md={12} className="d-flex justify-content-end gap-2 mt-3">
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? <><Spinner size="sm" className="me-1" /> Saving...</> : 'Save Changes'}
        </Button>
      </Col>
    </Row>
  )
}
