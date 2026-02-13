import AnimationStar from '@/components/AnimationStar'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingFallback from '@/components/LoadingFallback'
import Footer from '@/components/layout/Footer'
import { ChildrenType } from '@/types/component-props'
import { lazy, Suspense } from 'react'
import { Container } from 'react-bootstrap'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const TopNavigationBar = lazy(() => import('@/components/layout/TopNavigationBar/page'))
const VerticalNavigationBar = lazy(() => import('@/components/layout/VerticalNavigationBar/page'))

const AdminLayout = ({ children }: ChildrenType) => {
  return (
    <div className="wrapper">
      <Suspense fallback={null}>
        <TopNavigationBar />
      </Suspense>
      <Suspense fallback={<div />}>
        <VerticalNavigationBar />
      </Suspense>
      <AnimationStar />
      <div className="page-content">
        <Container fluid>
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </Container>
        <Footer />
      </div>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false}
        newestOnTop closeOnClick pauseOnHover theme="colored" />
    </div>
  )
}

export default AdminLayout
