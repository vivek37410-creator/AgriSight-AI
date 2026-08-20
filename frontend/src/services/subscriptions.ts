import { api } from '../lib/api'
import { Subscription } from '../types/subscription'

export interface CheckoutResponse {
  checkout_url: string
  session_id: string
  provider: string
  mock: boolean
  plan: string
}

export async function getSubscription() {
  const res = await api.get('/subscriptions')
  return res.data as Subscription
}

export async function upgradeSubscription(plan: string) {
  const res = await api.post('/subscriptions/upgrade', null, { params: { plan } })
  return res.data as CheckoutResponse
}
