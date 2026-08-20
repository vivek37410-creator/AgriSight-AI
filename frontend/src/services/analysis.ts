import { api } from '../lib/api'
import { HealthScore, RiskAssessment, Recommendation } from '../types/analysis'

export async function analyzeFarm(farmId: number) {
  const res = await api.post(`/farms/${farmId}/analyze`)
  return res.data
}

export async function getHealth(farmId: number) {
  const res = await api.get(`/farms/${farmId}/health`)
  return res.data as HealthScore
}

export async function getRisks(farmId: number) {
  const res = await api.get(`/farms/${farmId}/risks`)
  return res.data as RiskAssessment[]
}

export async function getRecommendations(farmId: number) {
  const res = await api.get(`/farms/${farmId}/recommendations`)
  return res.data as Recommendation[]
}
