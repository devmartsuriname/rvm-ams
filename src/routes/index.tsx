import { lazy } from 'react'
import { Navigate, type RouteProps } from 'react-router-dom'

// Dashboard
const Dashboards = lazy(() => import('@/app/(admin)/dashboards/page'))

// RVM Core Routes
const DossierList = lazy(() => import('@/app/(admin)/rvm/dossiers/page'))
const DossierDetail = lazy(() => import('@/app/(admin)/rvm/dossiers/[id]/page'))
const MeetingList = lazy(() => import('@/app/(admin)/rvm/meetings/page'))
const MeetingDetail = lazy(() => import('@/app/(admin)/rvm/meetings/[id]/page'))
const TaskList = lazy(() => import('@/app/(admin)/rvm/tasks/page'))

// Auth Routes
const AuthSignIn = lazy(() => import('@/app/(other)/auth/sign-in/page'))

export type RoutesProps = {
  path: RouteProps['path']
  name: string
  element: RouteProps['element']
  exact?: boolean
}

const initialRoutes: RoutesProps[] = [
  {
    path: '/',
    name: 'root',
    element: <Navigate to="/dashboards" />,
  },
]

const generalRoutes: RoutesProps[] = [
  {
    path: '/dashboards',
    name: 'Dashboards',
    element: <Dashboards />,
  },
]

// RVM Core Routes
const rvmRoutes: RoutesProps[] = [
  {
    path: '/rvm/dossiers',
    name: 'Dossiers',
    element: <DossierList />,
  },
  {
    path: '/rvm/dossiers/:id',
    name: 'Dossier Detail',
    element: <DossierDetail />,
  },
  {
    path: '/rvm/meetings',
    name: 'Meetings',
    element: <MeetingList />,
  },
  {
    path: '/rvm/meetings/:id',
    name: 'Meeting Detail',
    element: <MeetingDetail />,
  },
  {
    path: '/rvm/tasks',
    name: 'Tasks',
    element: <TaskList />,
  },
]

export const authRoutes: RoutesProps[] = [
  {
    name: 'Sign In',
    path: '/auth/sign-in',
    element: <AuthSignIn />,
  },
]

// RVM-ONLY: Only core application routes are registered
// Demo/library routes (base-ui, forms, charts, maps, tables, icons, layouts) 
// have been removed from the router but source files are preserved for reference
export const appRoutes = [
  ...initialRoutes,
  ...generalRoutes,
  ...rvmRoutes,
]
