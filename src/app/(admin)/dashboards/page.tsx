import { Row, Col } from 'react-bootstrap'
import Footer from '@/components/layout/Footer'
import PageTitle from '@/components/PageTitle'
import { LoadingState, ErrorState } from '@/components/rvm/StateComponents'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { StatCard } from './components/StatCard'
import { DossierStatusChart } from './components/DossierStatusChart'
import { TaskStatusChart } from './components/TaskStatusChart'

const DashboardPage = () => {
  const { data: stats, isLoading, isError, refetch } = useDashboardStats()

  if (isLoading) {
    return (
      <>
        <PageTitle subName="RVM-AMS" title="Dashboard" />
        <LoadingState message="Loading dashboard..." />
        <Footer />
      </>
    )
  }

  if (isError) {
    return (
      <>
        <PageTitle subName="RVM-AMS" title="Dashboard" />
        <ErrorState message="Failed to load dashboard data" onRetry={refetch} />
        <Footer />
      </>
    )
  }

  return (
    <>
      <PageTitle subName="RVM-AMS" title="Dashboard" />
      
      {/* KPI Cards Row 1 */}
      <Row>
        <Col lg={4}>
          <StatCard 
            label="Total Dossiers" 
            value={stats?.totalDossiers ?? 0} 
            icon="bx:folder" 
          />
        </Col>
        <Col lg={4}>
          <StatCard 
            label="Active Dossiers" 
            value={stats?.activeDossiers ?? 0} 
            icon="bx:folder-open" 
            iconColor="text-success"
          />
        </Col>
        <Col lg={4}>
          <StatCard 
            label="Total Meetings" 
            value={stats?.totalMeetings ?? 0} 
            icon="bx:calendar" 
          />
        </Col>
      </Row>

      {/* KPI Cards Row 2 */}
      <Row>
        <Col lg={4}>
          <StatCard 
            label="Upcoming Meetings" 
            value={stats?.upcomingMeetings ?? 0} 
            icon="bx:calendar-event" 
            iconColor="text-info"
          />
        </Col>
        <Col lg={4}>
          <StatCard 
            label="Total Tasks" 
            value={stats?.totalTasks ?? 0} 
            icon="bx:task" 
          />
        </Col>
        <Col lg={4}>
          <StatCard 
            label="Pending Tasks" 
            value={stats?.pendingTasks ?? 0} 
            icon="bx:hourglass" 
            iconColor="text-warning"
          />
        </Col>
      </Row>

      {/* Charts Row */}
      <Row>
        <Col lg={6}>
          <DossierStatusChart data={stats?.dossiersByStatus ?? []} />
        </Col>
        <Col lg={6}>
          <TaskStatusChart data={stats?.tasksByStatus ?? []} />
        </Col>
      </Row>

      <Footer />
    </>
  )
}

export default DashboardPage
