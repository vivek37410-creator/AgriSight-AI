import { useQuery } from '@tanstack/react-query'
import { getWeather, getForecast } from '../services/weather'

export function useWeather(farmId: number) {
  return useQuery({ queryKey: ['weather', farmId], queryFn: () => getWeather(farmId), enabled: !!farmId })
}

export function useForecast(farmId: number) {
  return useQuery({ queryKey: ['forecast', farmId], queryFn: () => getForecast(farmId), enabled: !!farmId })
}
