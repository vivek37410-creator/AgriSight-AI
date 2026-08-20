import { useQuery } from '@tanstack/react-query'
import { getSatellite, getLatestSatellite } from '../services/satellite'

export function useSatellite(farmId: number) {
  return useQuery({ queryKey: ['satellite', farmId], queryFn: () => getSatellite(farmId), enabled: !!farmId })
}

export function useLatestSatellite(farmId: number) {
  return useQuery({ queryKey: ['latestSatellite', farmId], queryFn: () => getLatestSatellite(farmId), enabled: !!farmId })
}
