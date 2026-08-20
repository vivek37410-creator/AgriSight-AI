export interface FarmValidation {
  crop: string | null
  soil_type: string | null
  suitability: string
  explanation: string
  recommended_action: string
  amendments_required?: string | null
  irrigation_adjustment?: string | null
}

export interface FarmCreateResponse {
  farm: Farm
  validation: FarmValidation | null
}

export interface Farm {
  id: number
  user_id: number
  name: string
  description?: string
  boundary_geojson?: string
  latitude?: number
  longitude?: number
  area_hectares?: number
  crop_id?: number
  sowing_date?: string
  soil_type?: string
  irrigation_type?: string
  photo_url?: string
  created_at: string
  updated_at: string
}

export interface FarmCreate {
  name: string
  description?: string
  boundary_geojson?: string
  latitude?: number
  longitude?: number
  area_hectares?: number
  crop_id?: number
  sowing_date?: string
  soil_type?: string
  irrigation_type?: string
  photo_url?: string
}

export interface Crop {
  id: number
  name: string
  scientific_name?: string
  growth_duration_days?: number
  description?: string
}

export interface CropGrowthStage {
  id: number
  crop_id: number
  stage_name: string
  min_day: number
  max_day: number
  notes?: string
}
