import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { getSubscription, upgradeSubscription } from '../services/subscriptions'
import { PLANS, PLAN_LABELS } from '../utils/constants'

export default function Billing() {
  const { t } = useTranslation()
  const [sub, setSub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getSubscription().then((s) => { setSub(s); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleUpgrade = async (plan: string) => {
    setUpgrading(plan)
    setError(null)
    try {
      const res = await upgradeSubscription(plan)
      if (res.mock || !res.checkout_url) {
        const updated = await getSubscription()
        setSub(updated)
      } else {
        window.location.href = res.checkout_url
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || t('Unable to start checkout. Please try again.'))
    } finally {
      setUpgrading(null)
    }
  }

  if (loading) return <div className="flex h-96 items-center justify-center">{t('Loading...')}</div>

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('Billing & Subscription')}</h1>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('Current Plan')}</p>
              <p className="text-xl font-bold text-gray-900">{sub?.plan ? t(PLAN_LABELS[sub.plan] || sub.plan) : t('Free')}</p>
            </div>
            <Badge variant={sub?.plan === 'FREE' ? 'warning' : 'success'}>{sub?.status || 'ACTIVE'}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('Usage this month')}</p>
            <p className="text-lg font-semibold text-gray-900">{sub?.used_this_month || 0} / {sub?.monthly_limit || 1}</p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Change Plan')}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.filter((p) => p !== 'ENTERPRISE').map((plan) => (
            <Button
              key={plan}
              variant={sub?.plan === plan ? 'primary' : 'outline'}
              onClick={() => handleUpgrade(plan)}
              disabled={upgrading === plan}
            >
              {upgrading === plan ? t('Redirecting...') : t(PLAN_LABELS[plan] || plan)}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          {t("You'll be redirected to the payment provider to complete checkout. Your subscription activates once payment is confirmed.")}
        </p>
      </div>
    </div>
  )
}
