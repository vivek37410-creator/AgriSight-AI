import { api } from '../lib/api'
import { WeatherObservation, WeatherForecast } from '../types/weather'

export async function getWeather(farmId: number) {
  const res = await api.get(`/farms/${farmId}/weather`)
  return res.data as WeatherObservation[]
}

export async function getForecast(farmId: number) {
  const res = await api.get(`/farms/${farmId}/weather/forecast`)
  return res.data as WeatherForecast[]
}
