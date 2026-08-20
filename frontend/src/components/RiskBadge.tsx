import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from './ui/Badge'
import { cn } from '../lib/utils'

interface RiskBadgeProps {
  level: 'LOW' | 'MODERATE' | 'HIGH'
  className?: string
}

const riskConfig = {
  LOW: { variant: 'success' as const, icon: CheckCircle, key: 'Low Risk' },
  MODERATE: { variant: 'warning' as const, icon: AlertTriangle, key: 'Moderate Risk' },
  HIGH: { variant: 'danger' as const, icon: XCircle, key: 'High Risk' },
}

export default function RiskBadge({ level, className }: RiskBadgeProps) {
  const { t } = useTranslation()
  const config = riskConfig[level]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={cn('flex items-center gap-1', className)}>
      <Icon className="h-3 w-3" />
      {t(config.key)}
    </Badge>
  )
}
