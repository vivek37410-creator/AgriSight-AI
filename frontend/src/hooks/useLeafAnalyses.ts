import { useQuery } from '@tanstack/react-query'
import { getLeafHistory } from '../services/leaf_analysis'
import { LeafAnalysis } from '../types/leaf_analysis'

export function useLeafAnalyses(farmId?: number) {
  return useQuery({
    queryKey: ['leaf-analyses', farmId],
    queryFn: () => getLeafHistory(farmId),
  })
}
