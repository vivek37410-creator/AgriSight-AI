export interface HealthScore {
  id: number
  farm_id: number
  health_score: number
  moisture_score: number
  vegetation_score: number
  weather_score: number
  stress_score: number
  calculated_at: string
}

export interface RiskAssessment {
  id: number
  farm_id: number
  risk_type: string
  risk_level: string
  score: number
  explanation: string
  created_at: string
}

export interface Recommendation {
  id: number
  farm_id: number
  risk_id?: number
  priority: string
  recommendation: string
  reasoning: string
  created_at: string
}
