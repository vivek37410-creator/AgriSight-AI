import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { PLANS } from '../utils/constants'

const plans = [
  { id: 'FREE', nameKey: 'Free', price: 0, features: ['1 Farm', 'Basic Dashboard', 'Limited Analysis'] },
  { id: 'FARMER', nameKey: 'Farmer', price: 299, features: ['5 Farms', 'Satellite Monitoring', 'AI Recommendations', 'Alerts'] },
  { id: 'PROFESSIONAL', nameKey: 'Professional', price: 999, features: ['20 Farms', 'Advanced Analytics', 'Farm Zones', 'Reports', 'AI Assistant'] },
  { id: 'ENTERPRISE', nameKey: 'Enterprise', price: 0, features: ['Custom', 'Dedicated Support', 'Custom Integrations'] },
]

export default function Pricing({ onSelectPlan }: { onSelectPlan?: (plan: string) => void }) {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('Simple, transparent pricing')}</h1>
        <p className="mt-2 text-gray-600">{t('Choose the plan that fits your farm.')}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900">{t(plan.nameKey)}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{plan.price === 0 ? t('Custom') : t('price_per_month', { price: plan.price })}</p>
              <ul className="mt-4 space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" /> {t(f)}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" variant={plan.id === 'PROFESSIONAL' ? 'primary' : 'outline'} onClick={() => onSelectPlan?.(plan.id)}>
                {plan.price === 0 ? t('Contact Sales') : t('Get Started')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
