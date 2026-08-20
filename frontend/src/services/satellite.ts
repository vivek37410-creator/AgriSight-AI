import { api } from '../lib/api'
import { SatelliteObservation } from '../types/satellite'

export async function getSatellite(farmId: number) {
  const res = await api.get(`/farms/${farmId}/satellite`)
  return res.data as SatelliteObservation[]
}

export async function getLatestSatellite(farmId: number) {
  const res = await api.get(`/farms/${farmId}/satellite/latest`)
  return res.data as SatelliteObservation
}
