import { api } from '../lib/api'
import { Report } from '../types/report'

export async function generateReport(farmId: number, reportType: string) {
  const res = await api.post(`/farms/${farmId}/reports`, null, { params: { report_type: reportType } })
  return res.data as Report
}

export async function getReports(farmId: number) {
  const res = await api.get(`/farms/${farmId}/reports`)
  return res.data as Report[]
}
