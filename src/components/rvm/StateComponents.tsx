import { Card, CardBody } from 'react-bootstrap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

type EmptyStateProps = {
  icon?: string
  title: string
  description?: string
}

/**
 * Empty state component following Darkone card pattern
 */
export function EmptyState({ 
  icon = 'bx:folder-open', 
  title, 
  description 
}: EmptyStateProps) {
  return (
    <Card>
      <CardBody className="text-center py-5">
        <IconifyIcon icon={icon} className="text-muted mb-3" style={{ fontSize: '3rem' }} />
        <h5 className="text-muted mb-2">{title}</h5>
        {description && <p className="text-muted mb-0">{description}</p>}
      </CardBody>
    </Card>
  )
}

/**
 * Loading state component following Darkone spinner pattern
 */
export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <Card>
      <CardBody className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">{message}</span>
        </div>
        <p className="text-muted mb-0">{message}</p>
      </CardBody>
    </Card>
  )
}

/**
 * Error state component
 */
export function ErrorState({ 
  message = 'An error occurred', 
  onRetry 
}: { 
  message?: string
  onRetry?: () => void 
}) {
  return (
    <Card>
      <CardBody className="text-center py-5">
        <IconifyIcon icon="bx:error-circle" className="text-danger mb-3" style={{ fontSize: '3rem' }} />
        <h5 className="text-danger mb-2">Error</h5>
        <p className="text-muted mb-3">{message}</p>
        {onRetry && (
          <button className="btn btn-primary btn-sm" onClick={onRetry}>
            Try Again
          </button>
        )}
      </CardBody>
    </Card>
  )
}
