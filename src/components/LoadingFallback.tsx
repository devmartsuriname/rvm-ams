import { Spinner } from 'react-bootstrap'

const LoadingFallback = () => {
  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '200px' }}>
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  )
}

export default LoadingFallback
