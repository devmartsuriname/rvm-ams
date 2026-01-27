import Footer from '@/components/layout/Footer'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody } from 'react-bootstrap'

const page = () => {
  return (
    <>
      <PageTitle subName="RVM-AMS" title="Dashboard" />
      <Card>
        <CardBody className="text-center py-5">
          <h4 className="text-muted mb-0">RVM-AMS Dashboard – Module Pending</h4>
        </CardBody>
      </Card>
      <Footer />
    </>
  )
}

export default page
