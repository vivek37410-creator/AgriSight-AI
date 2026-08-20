import { Card, CardContent } from './ui/Card'
import { Badge } from './ui/Badge'
import { cn } from '../lib/utils'
import { useTranslation } from 'react-i18next'

interface RecommendationCardProps {
  title: string
  description: string
  reasoning: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  viewed?: boolean
  className?: string
}

const priorityConfig = {
  HIGH: { variant: 'danger' as const, key: 'High Priority' },
  MEDIUM: { variant: 'warning' as const, key: 'Medium Priority' },
  LOW: { variant: 'info' as const, key: 'Low Priority' },
}

export default function RecommendationCard({
  title,
  description,
  reasoning,
  priority,
  viewed = false,
  className,
}: RecommendationCardProps) {
  const { t } = useTranslation()
  const config = priorityConfig[priority] as { variant: 'danger' | 'warning' | 'info', key: string }

  return (
    <Card className={cn(!viewed && 'border-l-4 border-l-deep-green', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-charcoal">{title}</h4>
              {!viewed && (
                <span className="h-2 w-2 rounded-full bg-deep-green" title={t('New')} />
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
            <p className="mt-2 text-sm text-gray-500 italic">{reasoning}</p>
          </div>
          <Badge variant={config.variant}>{t(config.key)}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
