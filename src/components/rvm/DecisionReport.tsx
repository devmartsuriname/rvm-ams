import React, { forwardRef } from 'react'
import { Table, Badge } from 'react-bootstrap'
import { DecisionLifecycleBadge } from '@/components/rvm/StatusBadges'

export interface DecisionReportData {
  id: string
  decision_text: string
  decision_status: string | null
  is_final: boolean | null
  created_at: string | null
  chair_approved_at?: string | null
  rvm_agenda_item?: {
    agenda_number: number
    meeting_id?: string
    rvm_dossier?: { id: string; dossier_number: string; title: string; sender_ministry?: string } | null
    rvm_meeting?: { id: string; meeting_date: string; meeting_type: string | null; status: string | null } | null
  } | null
}

interface MeetingInfo {
  meeting_date: string
  meeting_type: string | null
  location?: string | null
  status: string | null
}

interface DecisionReportProps {
  decisions: DecisionReportData[]
  meetingInfo?: MeetingInfo | null
  title?: string
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatShortDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getMeetingTypeLabel = (type: string | null | undefined) => {
  switch (type) {
    case 'regular': return 'Regulier'
    case 'urgent': return 'Urgent'
    case 'special': return 'Bijzonder'
    default: return type || '-'
  }
}

const DecisionReport = forwardRef<HTMLDivElement, DecisionReportProps>(
  ({ decisions, meetingInfo, title }, ref) => {
    // Sort by agenda_number (governance ordering)
    const sorted = [...decisions].sort((a, b) => {
      const dateA = a.rvm_agenda_item?.rvm_meeting?.meeting_date || ''
      const dateB = b.rvm_agenda_item?.rvm_meeting?.meeting_date || ''
      if (dateA !== dateB) return dateA.localeCompare(dateB)
      return (a.rvm_agenda_item?.agenda_number ?? 0) - (b.rvm_agenda_item?.agenda_number ?? 0)
    })

    const generatedAt = new Date().toLocaleString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    return (
      <div ref={ref} className="decision-report">
        {/* Header */}
        <div className="decision-report-header text-center mb-4">
          <h2 className="mb-1">RVM-AMS</h2>
          <h4 className="mb-2">{title || 'Decision Report'}</h4>
          <p className="text-muted small mb-0">Generated: {generatedAt}</p>
        </div>

        {/* Meeting Info (if meeting-scoped) */}
        {meetingInfo && (
          <div className="decision-report-meeting-info mb-4 p-3 border rounded">
            <h6 className="fw-bold mb-2">Meeting Information</h6>
            <div className="row">
              <div className="col-6">
                <small className="text-muted">Date:</small>
                <div className="fw-medium">{formatDate(meetingInfo.meeting_date)}</div>
              </div>
              <div className="col-3">
                <small className="text-muted">Type:</small>
                <div className="fw-medium">{getMeetingTypeLabel(meetingInfo.meeting_type)}</div>
              </div>
              <div className="col-3">
                <small className="text-muted">Location:</small>
                <div className="fw-medium">{meetingInfo.location || '-'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Decision Table */}
        <Table bordered className="decision-report-table mb-4">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th style={{ width: '120px' }}>Dossier</th>
              <th>Decision</th>
              <th style={{ width: '100px' }}>Status</th>
              <th style={{ width: '110px' }}>Chair Approved</th>
              <th style={{ width: '100px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => {
              const ai = d.rvm_agenda_item
              const dossier = ai?.rvm_dossier as { dossier_number: string; title: string; sender_ministry?: string } | null
              return (
                <tr key={d.id}>
                  <td className="fw-medium">{ai?.agenda_number ?? '-'}</td>
                  <td>
                    <div className="fw-medium">{dossier?.dossier_number || '-'}</div>
                    {dossier?.sender_ministry && (
                      <small className="text-muted">{dossier.sender_ministry}</small>
                    )}
                  </td>
                  <td>{d.decision_text}</td>
                  <td>
                    <DecisionLifecycleBadge status={d.decision_status} isFinal={d.is_final} />
                  </td>
                  <td className="small">{formatShortDate(d.chair_approved_at)}</td>
                  <td className="small">{formatShortDate(d.created_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>

        {/* Summary */}
        <div className="decision-report-summary mb-4 p-3 border rounded">
          <small className="text-muted">
            Total decisions: {sorted.length} |
            Approved: {sorted.filter(d => d.decision_status === 'approved').length} |
            Pending: {sorted.filter(d => d.decision_status === 'pending').length} |
            Deferred: {sorted.filter(d => d.decision_status === 'deferred').length} |
            Rejected: {sorted.filter(d => d.decision_status === 'rejected').length} |
            Finalized: {sorted.filter(d => d.is_final).length}
          </small>
        </div>

        {/* Signature Placeholders */}
        <div className="decision-report-signatures mt-5 pt-4">
          <div className="row">
            <div className="col-6">
              <div className="border-top pt-2 mt-5">
                <p className="mb-1 fw-medium">Chair RVM</p>
                <p className="text-muted small mb-0">Name: ___________________________</p>
                <p className="text-muted small mb-0">Date: ___________________________</p>
              </div>
            </div>
            <div className="col-6">
              <div className="border-top pt-2 mt-5">
                <p className="mb-1 fw-medium">Secretary RVM</p>
                <p className="text-muted small mb-0">Name: ___________________________</p>
                <p className="text-muted small mb-0">Date: ___________________________</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

DecisionReport.displayName = 'DecisionReport'

export default DecisionReport
