import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from './ui/Card'
import { cn } from '../lib/utils'

interface HealthScoreCardProps {
  score: number
  trend?: number
  status?: string
  className?: string
}

export default function HealthScoreCard({ score, trend = 0, status, className }: HealthScoreCardProps) {
  const { t } = useTranslation()
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'bg-green-50 border-green-200'
    if (score >= 50) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus

  return (
    <Card className={cn('border', getScoreBg(score), className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{t('Health Score')}</p>
            <p className={cn('mt-2 text-4xl font-bold', getScoreColor(score))}>
              {score}
            </p>
            {status && (
              <p className="mt-1 text-sm text-gray-600">{status}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={cn('flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium', trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600')}>
              <TrendIcon className="h-4 w-4" />
              <span>{Math.abs(trend)}%</span>
            </div>
            <span className="text-xs text-gray-400">{t('vs last period')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
