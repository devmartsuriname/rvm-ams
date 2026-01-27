import { Card, Col, Row } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

interface ComingSoonProps {
  title: string
  subName?: string
}

const ComingSoon = ({ title, subName = 'Darkone' }: ComingSoonProps) => {
  return (
    <>
      <PageTitle subName={subName} title={title} />
      <Row className="justify-content-center">
        <Col lg={6}>
          <Card className="text-center">
            <Card.Body className="py-5">
              <IconifyIcon icon="solar:clock-circle-broken" className="fs-1 text-primary mb-3" />
              <h3 className="mb-2">Coming Soon</h3>
              <p className="text-muted mb-0">
                This feature is currently under development and will be available soon.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default ComingSoon
