import React from 'react'
import { AlertTriangle, Info, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Alert } from '../types'
import { cn } from '../lib/utils'

interface AlertListProps {
  alerts: Alert[]
  onMarkRead?: (id: number) => void
  onMarkAllRead?: () => void
  className?: string
}

const severityConfig = {
  LOW: { variant: 'success' as const, icon: Info, bg: 'bg-green-100 text-green-600' },
  MODERATE: { variant: 'warning' as const, icon: AlertTriangle, bg: 'bg-yellow-100 text-yellow-600' },
  HIGH: { variant: 'danger' as const, icon: XCircle, bg: 'bg-red-100 text-red-600' },
  CRITICAL: { variant: 'danger' as const, icon: XCircle, bg: 'bg-red-100 text-red-600' },
}

export default function AlertList({ alerts, onMarkRead, onMarkAllRead, className }: AlertListProps) {
  const { t } = useTranslation()
  const unreadCount = alerts.filter((a) => !a.is_read).length

  return (
    <Card className={className}>
      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-charcoal">{t('Alerts')}</h3>
          <p className="text-sm text-gray-500">{t('alerts.unread', { count: unreadCount })}</p>
        </div>
        {unreadCount > 0 && onMarkAllRead && (
          <button
            onClick={onMarkAllRead}
            className="text-sm font-medium text-deep-green hover:text-green-800"
          >
            {t('Mark all as read')}
          </button>
        )}
      </div>
      <div className="divide-y divide-gray-100">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">{t('No alerts to display')}</div>
        ) : (
          alerts.map((alert) => {
            const config = severityConfig[alert.severity as keyof typeof severityConfig]
            const Icon = config.icon
            return (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start gap-4 p-4 hover:bg-gray-50',
                  !alert.is_read && 'bg-green-50/50'
                )}
              >
                <div className={cn('mt-0.5 rounded-full p-2', config.bg)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-charcoal">{alert.title}</p>
                    {!alert.is_read && (
                      <span className="h-2 w-2 rounded-full bg-deep-green" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={config.variant}>{alert.severity}</Badge>
                    {alert.farm_name && (
                      <span className="text-xs text-gray-400">Farm: {alert.farm_name}</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                {!alert.is_read && onMarkRead && (
                  <button
                    onClick={() => onMarkRead(alert.id)}
                     className="text-sm text-deep-green hover:text-green-800"
                  >
                    {t('Mark read')}
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
