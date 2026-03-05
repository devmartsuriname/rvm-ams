import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingFallback from '@/components/LoadingFallback'
import { ChildrenType } from '@/types/component-props'
import { Suspense } from 'react'

const AuthLayout = ({ children }: ChildrenType) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </ErrorBoundary>
  )
}

export default AuthLayout
