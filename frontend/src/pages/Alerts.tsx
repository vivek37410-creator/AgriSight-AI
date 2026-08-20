import { useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useAlerts } from '../hooks/useAlerts'
import { markAlertRead } from '../services/alerts'
import { formatDate } from '../utils/formatters'
import LeafLoader from '../components/LeafLoader'

const FILTERS = ['all', 'unread', 'read']

export default function Alerts() {
  const { t } = useTranslation()
  const { data: alerts, isLoading, refetch } = useAlerts()
  const [filter, setFilter] = useState<string>('all')

  const filtered = alerts?.filter((a) => filter === 'all' || (filter === 'unread' ? !a.is_read : a.is_read)) || []

  const handleMarkRead = async (id: number) => {
    await markAlertRead(id)
    refetch()
  }

  if (isLoading) return <div className="flex h-96 items-center justify-center"><LeafLoader size="lg" text={t('Growing your alerts...')} variant="leaf" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('Alerts')}</h1>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <Button key={f} variant={filter === f ? 'primary' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {t(f.charAt(0).toUpperCase() + f.slice(1))}
            </Button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{t('No alerts found.')}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <Card key={alert.id} className={!alert.is_read ? 'border-l-4 border-l-yellow-500' : ''}>
              <CardContent className="p-5 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{alert.message}</p>
                    {alert.farm_name && (
                      <p className="text-xs text-gray-400 mt-1">Farm: {alert.farm_name}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(alert.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? 'danger' : alert.severity === 'MODERATE' ? 'warning' : 'success'}>
                    {alert.severity}
                  </Badge>
                  {!alert.is_read && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkRead(alert.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
