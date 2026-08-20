import { Link } from 'react-router-dom'
import { Sprout, Plus, MapPin, Calendar, Droplets } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useFarms } from '../hooks/useFarms'
import { formatDate } from '../utils/formatters'
import LeafLoader from '../components/LeafLoader'

export default function Farms() {
  const { data: farms, isLoading } = useFarms()
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LeafLoader size="lg" text={t('Growing your farm data...')} variant="sprout" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{t('Your Farms')}</h1>
          <p className="mt-1 text-sm text-surface-500">{t('farms.registered', { count: farms?.length || 0 })}</p>
        </div>
        <Link to="/farms/create">
          <Button><Plus className="mr-2 h-4 w-4" /> {t('New Farm')}</Button>
        </Link>
      </div>
      
      {farms && farms.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {farms.map((farm, i) => (
            <Link key={farm.id} to={`/farms/${farm.id}`}>
              <Card className="card-hover h-full group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nature-50 text-nature-600 group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <Badge variant={farm.irrigation_type ? 'success' : 'warning'}>
                      {farm.irrigation_type || t('Unknown')}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-surface-900 mb-1 group-hover:text-nature-700 transition-colors">{farm.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-surface-500">
                      <MapPin className="h-3.5 w-3.5 text-surface-400" />
                      {farm.area_hectares ? t('hectares_one', { count: Number(farm.area_hectares) }) : t('Area unknown')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-surface-500">
                      <Droplets className="h-3.5 w-3.5 text-surface-400" />
                      {farm.soil_type || t('Soil type unknown')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-surface-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {t('Created')} {formatDate(farm.created_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-300 bg-surface-50/50 p-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <Sprout className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-surface-900">{t('No farms yet')}</h3>
          <p className="mb-6 text-sm text-surface-500 max-w-sm">{t('Create your first farm to start monitoring crop health with satellite data.')}</p>
          <Link to="/farms/create">
            <Button size="lg"><Plus className="mr-2 h-4 w-4" /> {t('Create Your First Farm')}</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
