export interface Subscription {
  id: number
  user_id: number
  plan: string
  status: string
  monthly_limit: number
  used_this_month: number
  created_at: string
}

export interface Plan {
  id: string
  name: string
  price: number
  features: string[]
  limit: number
}
