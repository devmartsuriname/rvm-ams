import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.fetchStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}
