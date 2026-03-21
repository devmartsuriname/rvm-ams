import { useState } from 'react'
import { Form, Button, Spinner, Row, Col } from 'react-bootstrap'
import { useUpdateAgendaItem, useAgendaItems } from '@/hooks/useAgendaItems'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/utils/rls-error'

interface EditAgendaItemFormProps {
  item: {
    id: string
    meeting_id: string
    agenda_number: number
    title_override: string | null
    notes: string | null
  }
  onCancel: () => void
}

const EditAgendaItemForm = ({ item, onCancel }: EditAgendaItemFormProps) => {
  const [titleOverride, setTitleOverride] = useState(item.title_override ?? '')
  const [agendaNumber, setAgendaNumber] = useState(item.agenda_number)
  const [notes, setNotes] = useState(item.notes ?? '')

  const updateAgendaItem = useUpdateAgendaItem()
  const { data: existingItems } = useAgendaItems(item.meeting_id)

  // Check uniqueness excluding current item
  const isDuplicateNumber = existingItems?.some(
    (ai) => ai.agenda_number === agendaNumber && ai.id !== item.id
  ) ?? false

  const isValid = agendaNumber > 0 && !isDuplicateNumber

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    try {
      await updateAgendaItem.mutateAsync({
        id: item.id,
        data: {
          title_override: titleOverride.trim() || null,
          agenda_number: agendaNumber,
          notes: notes.trim() || null,
        },
      })
      toast.success('Agenda item updated')
      onCancel()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <Form onSubmit={handleSave}>
      <Row className="g-2 align-items-end">
        <Col xs={2}>
          <Form.Control
            type="number"
            min={1}
            value={agendaNumber}
            onChange={(e) => setAgendaNumber(parseInt(e.target.value) || 0)}
            size="sm"
            isInvalid={isDuplicateNumber}
          />
          {isDuplicateNumber && (
            <div className="invalid-feedback d-block small">
              Duplicate
            </div>
          )}
        </Col>
        <Col xs={4}>
          <Form.Control
            type="text"
            value={titleOverride}
            onChange={(e) => setTitleOverride(e.target.value)}
            size="sm"
            placeholder="Title override"
            maxLength={255}
          />
        </Col>
        <Col xs={3}>
          <Form.Control
            as="textarea"
            rows={1}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            size="sm"
            placeholder="Notes"
            maxLength={1000}
          />
        </Col>
        <Col xs={3} className="d-flex gap-1">
          <Button
            variant="success"
            size="sm"
            type="submit"
            disabled={!isValid || updateAgendaItem.isPending}
          >
            {updateAgendaItem.isPending ? <Spinner size="sm" /> : 'Save'}
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={onCancel} disabled={updateAgendaItem.isPending}>
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  )
}

export default EditAgendaItemForm
