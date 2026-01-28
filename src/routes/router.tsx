import { Navigate, Route, Routes, type RouteProps } from 'react-router-dom'
import { Suspense } from 'react'
import AdminLayout from '@/layouts/AdminLayout'
import AuthLayout from '@/layouts/AuthLayout'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingFallback from '@/components/LoadingFallback'
import { appRoutes, authRoutes } from '@/routes/index'
import { useAuthContext } from '@/context/useAuthContext'

const AppRouter = (props: RouteProps) => {
  const { isAuthenticated, isLoading } = useAuthContext()

  // Show loading only for protected routes, not auth routes
  // Auth routes should always be accessible
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Auth routes - always accessible */}
          {(authRoutes || []).map((route, idx) => (
            <Route 
              key={idx + route.name} 
              path={route.path} 
              element={<AuthLayout {...props}>{route.element}</AuthLayout>} 
            />
          ))}

          {/* Protected routes - require authentication */}
          {(appRoutes || []).map((route, idx) => (
            <Route
              key={idx + route.name}
              path={route.path}
              element={
                isLoading ? (
                  <LoadingFallback />
                ) : isAuthenticated ? (
                  <AdminLayout {...props}>{route.element}</AdminLayout>
                ) : (
                  <Navigate
                    to={{
                      pathname: '/auth/sign-in',
                      search: 'redirectTo=' + route.path,
                    }}
                  />
                )
              }
            />
          ))}
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default AppRouter
