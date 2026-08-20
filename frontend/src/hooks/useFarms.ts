import { useQuery } from '@tanstack/react-query'
import { getFarms } from '../services/farms'

export function useFarms() {
  return useQuery({ queryKey: ['farms'], queryFn: getFarms })
}
