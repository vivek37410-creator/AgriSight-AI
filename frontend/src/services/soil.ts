import { api } from '../lib/api'
import { SoilData, SoilDataCreate } from '../types/soil'

export async function getSoil(farmId: number) {
  const res = await api.get(`/farms/${farmId}/soil`)
  return res.data as SoilData[]
}

export async function addSoil(farmId: number, data: SoilDataCreate) {
  const res = await api.post(`/farms/${farmId}/soil`, data)
  return res.data as SoilData
}
