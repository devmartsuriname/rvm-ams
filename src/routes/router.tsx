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

  // Route-aware loading gate: if user is on an auth route, always show it
  // (don't block /auth/* routes during auth initialization).
  // For protected routes, gate with loading only when actually resolving auth.
  const currentPath = window.location.pathname
  const isAuthRoute = currentPath.startsWith('/auth')

  // If still loading and NOT on an auth route, show loading spinner
  if (isLoading && !isAuthRoute) {
    return (
      <ErrorBoundary>
        <LoadingFallback />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
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
                isAuthenticated ? (
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

          {/* Catch-all route for unknown paths */}
          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboards" replace />
              ) : (
                <Navigate
                  to={{
                    pathname: '/auth/sign-in',
                    search: `redirectTo=${window.location.pathname}`,
                  }}
                  replace
                />
              )
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default AppRouter
