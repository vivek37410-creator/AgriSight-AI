import { Card, CardContent } from './ui/Card'
import { Badge } from './ui/Badge'
import { useTranslation } from 'react-i18next'
import { cn } from '../lib/utils'

interface SoilMoistureCardProps {
  value: number
  estimated?: boolean
  className?: string
}

export default function SoilMoistureCard({ value, estimated = false, className }: SoilMoistureCardProps) {
  const { t } = useTranslation()
  const getStatus = (val: number) => {
    if (val >= 60) return { label: t('Optimal'), color: 'bg-green-500' as const, variant: 'success' as const }
    if (val >= 30) return { label: t('Moderate'), color: 'bg-yellow-500' as const, variant: 'warning' as const }
    return { label: t('Low'), color: 'bg-red-500' as const, variant: 'danger' as const }
  }

  const status = getStatus(value)

  return (
    <Card className={className}>
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-charcoal">{t('Soil Moisture')}</h3>
      </div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold text-charcoal">{value}%</p>
            <p className="mt-1 text-sm text-gray-500">
              {estimated ? t('Estimated from satellite data') : t('Manual sensor reading')}
            </p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
          <div
            className={cn('h-2 rounded-full transition-all', status.color)}
            style={{ width: `${value}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
