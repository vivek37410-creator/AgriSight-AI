export interface AssistantQuery {
  question: string
  crop?: string
  language?: string
}

export interface AlternativeMatch {
  id: number
  crop: string
  topic: string
  confidence: number
}

export interface AssistantResponse {
  success: boolean
  answer: string
  recommendation: string | null
  category: string | null
  topic: string | null
  crop: string | null
  confidence: number
  severity: string | null
  alternatives: AlternativeMatch[] | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
