import { Card, CardBody, Row, Col } from 'react-bootstrap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

type StatCardProps = {
  label: string
  value: number | string
  icon: string
  iconColor?: string
}

/**
 * KPI stat card following Darkone 1:1 pattern
 */
export function StatCard({ label, value, icon, iconColor = 'text-primary' }: StatCardProps) {
  return (
    <Card>
      <CardBody>
        <Row className="align-items-center">
          <Col xs={8}>
            <p className="text-muted mb-2 text-truncate">{label}</p>
            <h4 className="mb-0">{value}</h4>
          </Col>
          <Col xs={4} className="text-end">
            <IconifyIcon 
              icon={icon} 
              style={{ fontSize: '2.5rem' }} 
              className={iconColor} 
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}
