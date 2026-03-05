import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.fetchStats(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useChairDashboard() {
  return useQuery({
    queryKey: ['dashboard-chair'],
    queryFn: () => dashboardService.fetchChairStats(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useSecretaryDashboard() {
  return useQuery({
    queryKey: ['dashboard-secretary'],
    queryFn: () => dashboardService.fetchSecretaryStats(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useAnalystDashboard() {
  return useQuery({
    queryKey: ['dashboard-analyst'],
    queryFn: () => dashboardService.fetchAnalystStats(),
    staleTime: 1000 * 60 * 5,
  })
}
