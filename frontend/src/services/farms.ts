import { api } from '../lib/api'
import { Farm, FarmCreate, FarmCreateResponse, FarmValidation } from '../types/farm'

export async function getFarms() {
  const res = await api.get('/farms')
  return res.data as Farm[]
}

export async function getFarm(id: number) {
  const res = await api.get(`/farms/${id}`)
  return res.data as Farm
}

export async function createFarm(data: FarmCreate) {
  const res = await api.post('/farms', data)
  return res.data as FarmCreateResponse
}

export async function validateFarm(payload: { crop_id?: number; soil_type?: string }) {
  const res = await api.post('/farms/validate', payload)
  return res.data as FarmValidation
}

export async function updateFarm(id: number, data: Partial<FarmCreate>) {
  const res = await api.put(`/farms/${id}`, data)
  return res.data as Farm
}

export async function deleteFarm(id: number) {
  await api.delete(`/farms/${id}`)
}

export async function uploadFarmPhoto(file: File): Promise<{ photo_url: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/farms/upload-photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data as { photo_url: string }
}
