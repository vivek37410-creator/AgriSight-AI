import { api } from '../lib/api'
import { AssistantQuery, AssistantResponse } from '../types/assistant'

export async function queryAssistant(query: string, farmId?: number, crop?: string, language = 'en') {
  const res = await api.post('/assistant/ask', {
    question: query,
    farm_id: farmId || undefined,
    crop: crop || undefined,
    language,
  })
  return res.data as AssistantResponse
}
