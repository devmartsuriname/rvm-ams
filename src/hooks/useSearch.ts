import { useQuery } from '@tanstack/react-query'
import { searchGovernanceEntities, type SearchFilters } from '@/services/searchService'

export function useGlobalSearch(query: string, filters?: SearchFilters) {
  return useQuery({
    queryKey: ['global-search', query, filters],
    queryFn: () => searchGovernanceEntities(query, filters),
    enabled: query.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
  })
}
