import ErrorBoundary from '@/components/ErrorBoundary'
import FallbackLoading from '@/components/FallbackLoading'
import { ChildrenType } from '@/types/component-props'
import { Suspense } from 'react'

const AuthLayout = ({ children }: ChildrenType) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<FallbackLoading />}>{children}</Suspense>
    </ErrorBoundary>
  )
}

export default AuthLayout
