import { useState, useEffect } from 'react'
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap'
import { useAddAgendaItem, useNextAgendaNumber, useAgendaItems } from '@/hooks/useAgendaItems'
import { useAgendaEligibleDossiers } from '@/hooks/useDossiers'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/utils/rls-error'

interface CreateAgendaItemModalProps {
  show: boolean
  onHide: () => void
  meetingId: string
}

const CreateAgendaItemModal = ({ show, onHide, meetingId }: CreateAgendaItemModalProps) => {
  const [dossierId, setDossierId] = useState('')
  const [titleOverride, setTitleOverride] = useState('')
  const [agendaNumber, setAgendaNumber] = useState<number>(1)
  const [notes, setNotes] = useState('')

  const { data: nextNumber } = useNextAgendaNumber(meetingId)
  const { data: dossiers, isLoading: dossiersLoading } = useAgendaEligibleDossiers()
  const { data: existingItems } = useAgendaItems(meetingId)
  const addAgendaItem = useAddAgendaItem()

  useEffect(() => {
    if (nextNumber) setAgendaNumber(nextNumber)
  }, [nextNumber])

  const reset = () => {
    setDossierId('')
    setTitleOverride('')
    setAgendaNumber(nextNumber ?? 1)
    setNotes('')
  }

  const handleClose = () => {
    reset()
    onHide()
  }

  // Check agenda number uniqueness
  const isDuplicateNumber = existingItems?.some(
    (item) => item.agenda_number === agendaNumber
  ) ?? false

  const isValid = dossierId.trim() !== '' && agendaNumber > 0 && !isDuplicateNumber

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    try {
      await addAgendaItem.mutateAsync({
        meetingId,
        dossierId,
        agendaNumber,
        notes: notes.trim() || undefined,
      })
      toast.success('Agenda item added successfully')
      handleClose()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Agenda Item</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Dossier <span className="text-danger">*</span></Form.Label>
                {dossiersLoading ? (
                  <div className="text-muted"><Spinner size="sm" /> Loading dossiers...</div>
                ) : (
                  <Form.Select
                    value={dossierId}
                    onChange={(e) => setDossierId(e.target.value)}
                    required
                  >
                    <option value="">Select a dossier...</option>
                    {(dossiers ?? []).map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.dossier_number} — {d.title}
                      </option>
                    ))}
                  </Form.Select>
                )}
                <Form.Text className="text-muted">
                  Only dossiers eligible for agenda scheduling are shown.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Agenda Number <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={agendaNumber}
                  onChange={(e) => setAgendaNumber(parseInt(e.target.value) || 0)}
                  required
                  isInvalid={isDuplicateNumber}
                />
                {isDuplicateNumber && (
                  <Form.Control.Feedback type="invalid">
                    Agenda number {agendaNumber} is already in use for this meeting.
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title Override</Form.Label>
                <Form.Control
                  type="text"
                  value={titleOverride}
                  onChange={(e) => setTitleOverride(e.target.value)}
                  placeholder="Leave empty to use dossier title"
                  maxLength={255}
                />
                <Form.Text className="text-muted">
                  Optional. Overrides the dossier title for this agenda item.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes for this agenda item"
                  maxLength={1000}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={addAgendaItem.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!isValid || addAgendaItem.isPending}
          >
            {addAgendaItem.isPending ? (
              <>
                <Spinner size="sm" className="me-1" /> Adding...
              </>
            ) : (
              'Add Agenda Item'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default CreateAgendaItemModal
