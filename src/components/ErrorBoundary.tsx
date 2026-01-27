import { Component, ErrorInfo, ReactNode } from 'react'
import { Button, Card, CardBody } from 'react-bootstrap'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 p-4">
          <Card className="text-center" style={{ maxWidth: '400px' }}>
            <CardBody className="p-4">
              <h4 className="mb-3">Something went wrong</h4>
              <p className="text-muted mb-4">
                An unexpected error occurred. Please try again.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <Button variant="primary" onClick={this.handleRetry}>
                  Try Again
                </Button>
                <Button variant="outline-secondary" onClick={this.handleReload}>
                  Reload Page
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
