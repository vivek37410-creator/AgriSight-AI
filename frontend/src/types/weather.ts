export interface WeatherObservation {
  id: number
  farm_id: number
  temperature?: number
  humidity?: number
  rainfall?: number
  rainfall_probability?: number
  wind_speed?: number
  pressure?: number
  recorded_at: string
  source: string
}

export interface WeatherForecast {
  id: number
  farm_id: number
  forecast_time: string
  temperature?: number
  humidity?: number
  rainfall_probability?: number
  rainfall_amount?: number
  wind_speed?: number
  source: string
}
