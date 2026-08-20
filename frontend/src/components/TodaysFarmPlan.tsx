import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { AlertTriangle, CloudRain, Droplets, Leaf, Sun, Wind } from 'lucide-react'
import { motion } from 'framer-motion'
import { useFarms } from '../hooks/useFarms'
import { WeatherObservation } from '../types/weather'

interface PlanItem {
  id: string
  icon: React.ReactNode
  title: string
  status: 'normal' | 'attention' | 'warning' | 'critical'
  message: string
}

interface TodaysFarmPlanProps {
  weatherData?: any[]
  alerts?: any[]
}

export default function TodaysFarmPlan({ weatherData, alerts }: TodaysFarmPlanProps) {
  const { t } = useTranslation()
  const { data: farms } = useFarms()

  const weather = (weatherData?.[0]) as WeatherObservation | undefined
  const farm = farms?.[0]
  const farmName = farm?.name || t('Your farm')
  const highAlerts = alerts?.filter((a: any) => a.severity === 'HIGH' || a.severity === 'CRITICAL') || []
  const moderateAlerts = alerts?.filter((a: any) => a.severity === 'MODERATE') || []

  const plans: PlanItem[] = []

  if (weather && weather.temperature !== undefined) {
    if (weather.temperature > 35) {
      plans.push({
        id: 'heat',
        icon: <Sun className="h-5 w-5" />,
        title: t('Heat Advisory'),
        status: 'warning',
        message: `${farmName}: ${weather.temperature.toFixed(1)}°C detected. Monitor irrigation and avoid midday field work.`,
      })
    } else if (weather.temperature < 15) {
      plans.push({
        id: 'cold',
        icon: <Wind className="h-5 w-5" />,
        title: t('Cold Advisory'),
        status: 'attention',
        message: `${farmName}: ${weather.temperature.toFixed(1)}°C. Protect sensitive crops from frost if applicable.`,
      })
    } else {
      plans.push({
        id: 'temp-ok',
        icon: <Sun className="h-5 w-5" />,
        title: t('Temperature Normal'),
        status: 'normal',
        message: `${farmName}: ${weather.temperature.toFixed(1)}°C. Conditions are within normal range.`,
      })
    }
  }

  if (weather && weather.rainfall_probability !== undefined) {
    if (weather.rainfall_probability > 60) {
      plans.push({
        id: 'rain',
        icon: <CloudRain className="h-5 w-5" />,
        title: t('Rain Expected'),
        status: 'warning',
        message: `${farmName}: ${weather.rainfall_probability.toFixed(0)}% rain probability. Avoid irrigation and monitor drainage.`,
      })
    } else if (weather.rainfall_probability < 20 && weather.temperature !== undefined && weather.temperature > 30) {
      plans.push({
        id: 'dry',
        icon: <Droplets className="h-5 w-5" />,
        title: t('Low Rainfall'),
        status: 'attention',
        message: `${farmName}: Low rainfall expected. Ensure adequate irrigation for crops.`,
      })
    }
  }

  if (highAlerts.length > 0) {
    plans.push({
      id: 'high-alerts',
      icon: <AlertTriangle className="h-5 w-5" />,
      title: t('High Priority Alert'),
      status: 'critical',
      message: `${farmName}: ${highAlerts.length} high priority alert${highAlerts.length > 1 ? 's' : ''} require${highAlerts.length === 1 ? 's' : ''} immediate attention.`,
    })
  }

  if (moderateAlerts.length > 0) {
    plans.push({
      id: 'mod-alerts',
      icon: <AlertTriangle className="h-5 w-5" />,
      title: t('Attention Needed'),
      status: 'attention',
      message: `${farmName}: ${moderateAlerts.length} moderate alert${moderateAlerts.length > 1 ? 's' : ''} to review.`,
    })
  }

  if (plans.length === 0) {
    plans.push({
      id: 'default',
      icon: <Leaf className="h-5 w-5" />,
      title: t('All Clear'),
      status: 'normal',
      message: `${farmName}: No specific actions required today. Continue regular farm monitoring.`,
    })
  }

  const statusConfig = {
    normal: { variant: 'success' as const, label: t('Normal') },
    attention: { variant: 'warning' as const, label: t('Attention') },
    warning: { variant: 'warning' as const, label: t('Warning') },
    critical: { variant: 'danger' as const, label: t('Critical') },
  }

  return (
    <Card>
      <CardHeader
        title={t("Today's Farm Plan")}
        subtitle={t('Prioritized actions based on current conditions')}
      />
      <CardContent>
        <div className="space-y-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 80 }}
              className="flex items-start gap-3 rounded-xl border border-surface-200 bg-white p-4"
            >
              <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg ${
                plan.status === 'critical' ? 'bg-red-100 text-red-600' :
                plan.status === 'warning' ? 'bg-amber-100 text-amber-600' :
                plan.status === 'attention' ? 'bg-orange-100 text-orange-600' :
                'bg-green-100 text-green-600'
              }`}>
                {plan.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-surface-900">{plan.title}</p>
                  <Badge variant={statusConfig[plan.status].variant} className="text-[10px]">
                    {statusConfig[plan.status].label}
                  </Badge>
                </div>
                <p className="text-xs text-surface-500 mt-1">{plan.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
