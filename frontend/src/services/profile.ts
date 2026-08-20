import { api } from '../lib/api'

export async function uploadProfilePhoto(file: File): Promise<{ photo_url: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/auth/upload-photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data as { photo_url: string }
}

export async function updateProfile(data: { name?: string }): Promise<any> {
  const res = await api.patch('/auth/profile', data)
  return res.data
}
