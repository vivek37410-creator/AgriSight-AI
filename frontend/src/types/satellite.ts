export interface SatelliteObservation {
  id: number
  farm_id: number
  observation_date: string
  cloud_percentage?: number
  ndvi?: number
  ndmi?: number
  ndwi?: number
  source: string
  image_url?: string
  metadata?: string
}
