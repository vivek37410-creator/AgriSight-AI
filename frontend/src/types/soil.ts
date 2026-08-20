export interface SoilData {
  id: number
  farm_id: number
  moisture_percent?: number
  temperature?: number
  soil_type?: string
  ph?: number
  nitrogen?: number
  phosphorus?: number
  potassium?: number
  source: string
  recorded_at: string
}

export interface SoilDataCreate {
  moisture_percent?: number
  temperature?: number
  soil_type?: string
  ph?: number
  nitrogen?: number
  phosphorus?: number
  potassium?: number
  source?: string
  recorded_at?: string
}
