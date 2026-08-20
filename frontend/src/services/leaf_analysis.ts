import { api } from '../lib/api'
import { LeafAnalysis } from '../types/leaf_analysis'

export async function analyzeLeaf(farmId: number | null, file: File, cropOverride?: string, latitude?: number, longitude?: number) {
  const form = new FormData()
  form.append('file', file)
  if (farmId !== null) form.append('farm_id', String(farmId))
  if (cropOverride) form.append('crop_override', cropOverride)
  if (latitude !== undefined && latitude !== null) form.append('latitude', String(latitude))
  if (longitude !== undefined && longitude !== null) form.append('longitude', String(longitude))

  const res = await api.post('/leaf/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data as LeafAnalysis
}

export async function getLeafHistory(farmId?: number) {
  const url = farmId !== undefined ? `/leaf/history?farm_id=${farmId}` : '/leaf/history'
  const res = await api.get(url)
  return res.data as LeafAnalysis[]
}

export async function getLeafAnalysis(id: number) {
  const res = await api.get(`/leaf/${id}`)
  return res.data as LeafAnalysis
}
