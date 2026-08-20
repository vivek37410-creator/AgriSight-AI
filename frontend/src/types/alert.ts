export interface Alert {
  id: number
  farm_id: number
  farm_name: string | null
  type: string
  severity: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}
