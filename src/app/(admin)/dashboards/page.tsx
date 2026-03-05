import Footer from '@/components/layout/Footer'
import PageTitle from '@/components/PageTitle'
import { useUserRoles } from '@/hooks/useUserRoles'
import ChairDashboard from './components/ChairDashboard'
import SecretaryDashboard from './components/SecretaryDashboard'
import AnalystDashboard from './components/AnalystDashboard'

const DashboardPage = () => {
  const { hasRole, isSuperAdmin } = useUserRoles()

  const renderDashboard = () => {
    if (isSuperAdmin || hasRole('chair_rvm')) {
      return <ChairDashboard />
    }
    if (hasRole('secretary_rvm')) {
      return <SecretaryDashboard />
    }
    return <AnalystDashboard />
  }

  return (
    <>
      <PageTitle subName="RVM-AMS" title="Dashboard" />
      {renderDashboard()}
      <Footer />
    </>
  )
}

export default DashboardPage
