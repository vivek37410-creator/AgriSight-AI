import { api } from '../lib/api'
import { Alert } from '../types/alert'

export async function getAlerts() {
  const res = await api.get('/alerts')
  return res.data as Alert[]
}

export async function markAlertRead(id: number) {
  const res = await api.patch(`/alerts/${id}/read`)
  return res.data
}
