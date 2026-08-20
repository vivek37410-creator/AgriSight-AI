export interface Farm {
  id: string
  name: string
  location: string
  crop: string
  area: number
  healthScore: number
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH'
  soilType: string
  irrigation: string
  sowingDate: string
  createdAt: string
  coordinates?: [number, number]
}

export type Alert = import('./alert').Alert

export interface Recommendation {
  id: string
  farmId: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  reasoning: string
  createdAt: string
  viewed: boolean
}

export interface SatelliteObservation {
  id: string
  farmId: string
  date: string
  ndvi: number
  cloudCover: number
  source: string
}

export interface SoilMoistureData {
  date: string
  value: number
  estimated: boolean
}

export interface WeatherData {
  date: string
  temperature: number
  rainfall: number
  humidity: number
}

export interface HealthScoreHistory {
  date: string
  score: number
}

export interface Report {
  id: string
  farmId: string
  farmName: string
  type: string
  generatedAt: string
  downloadUrl: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  plan: 'FREE' | 'FARMER' | 'PROFESSIONAL' | 'ENTERPRISE'
}

export interface Zone {
  id: string
  label: string
  positions: [number, number][]
  healthScore: number
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH'
}
