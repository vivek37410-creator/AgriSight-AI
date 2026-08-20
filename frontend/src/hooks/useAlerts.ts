import { useQuery } from '@tanstack/react-query'
import { getAlerts } from '../services/alerts'

export function useAlerts() {
  return useQuery({ queryKey: ['alerts'], queryFn: getAlerts })
}
