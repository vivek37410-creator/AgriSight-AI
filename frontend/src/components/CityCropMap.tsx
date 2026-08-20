import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { MapPin, Filter, Sprout, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '../lib/api'

interface CityCrop {
  city: string
  state: string
  dominant_crop: string
  crop_distribution: string
  agricultural_information: string
}

const CROP_COLORS: Record<string, string> = {
  'Rice': 'bg-green-100 text-green-700 border-green-200',
  'Wheat': 'bg-amber-100 text-amber-700 border-amber-200',
  'Cotton': 'bg-blue-100 text-blue-700 border-blue-200',
  'Sugarcane': 'bg-purple-100 text-purple-700 border-purple-200',
  'Maize': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Soybean': 'bg-lime-100 text-lime-700 border-lime-200',
  'Grapes': 'bg-violet-100 text-violet-700 border-violet-200',
  'Orange': 'bg-orange-100 text-orange-700 border-orange-200',
  'Vegetables': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Groundnut': 'bg-rose-100 text-rose-700 border-rose-200',
  'Tomato': 'bg-red-100 text-red-700 border-red-200',
  'Chickpea': 'bg-teal-100 text-teal-700 border-teal-200',
  'Pigeon Pea': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Chillies': 'bg-pink-100 text-pink-700 border-pink-200',
  'Cashew': 'bg-stone-100 text-stone-700 border-stone-200',
  'Rubber': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Coconut': 'bg-sky-100 text-sky-700 border-sky-200',
  'Ragi': 'bg-orange-100 text-orange-700 border-orange-200',
  'Mustard': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Gram': 'bg-lime-100 text-lime-700 border-lime-200',
  'Barley': 'bg-amber-100 text-amber-700 border-amber-200',
  'Bajra': 'bg-orange-100 text-orange-700 border-orange-200',
  'Jute': 'bg-stone-100 text-stone-700 border-stone-200',
  'Tea': 'bg-green-100 text-green-700 border-green-200',
}

export default function CityCropMap() {
  const { t } = useTranslation()
  const [cities, setCities] = useState<CityCrop[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCrop, setSelectedCrop] = useState<string>('all')
  const [selectedCity, setSelectedCity] = useState<CityCrop | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/knowledge/city-crops')
        setCities(res.data || [])
      } catch (e) {
        console.error('Failed to load city crops', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const allCrops = Array.from(new Set(cities.map(c => c.dominant_crop))).sort()
  const filteredCities = selectedCrop === 'all' ? cities : cities.filter(c => c.dominant_crop === selectedCrop)

  const cropStats = allCrops.map(crop => ({
    crop,
    count: cities.filter(c => c.dominant_crop === crop).length,
    percentage: Math.round((cities.filter(c => c.dominant_crop === crop).length / cities.length) * 100),
  })).sort((a, b) => b.count - a.count)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-nature-600" />
            <p className="text-sm text-surface-500">{t('Loading...')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={<h3 className="font-semibold text-surface-900">{t('Regional Agriculture Map')}</h3>}
          subtitle={t('Explore crop distribution across cities')}
          action={
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-surface-400" />
              <Select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                options={[
                  { value: 'all', label: t('All Crops') || 'All Crops' },
                  ...allCrops.map(crop => ({ value: crop, label: crop }))
                ]}
              />
            </div>
          }
        />
        <CardContent>
          {/* Crop Distribution Stats */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {cropStats.slice(0, 8).map((stat, i) => (
              <motion.div
                key={stat.crop}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 50 }}
                onClick={() => setSelectedCrop(selectedCrop === stat.crop ? 'all' : stat.crop)}
                className={`cursor-pointer rounded-xl border p-3 transition-all duration-200 hover:shadow-md ${
                  selectedCrop === stat.crop
                    ? 'border-nature-300 bg-nature-50 shadow-md'
                    : 'border-surface-200 bg-white hover:border-nature-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sprout className={`h-4 w-4 ${CROP_COLORS[stat.crop]?.split(' ')[1] || 'text-gray-500'}`} />
                    <span className="text-sm font-medium text-surface-900">{stat.crop}</span>
                  </div>
                  <Badge variant={selectedCrop === stat.crop ? 'primary' : 'default'} className="text-xs">
                    {stat.percentage}%
                  </Badge>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-surface-100">
                  <div
                    className="h-1.5 rounded-full bg-nature-500 transition-all duration-500"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-surface-500 mt-1">{stat.count} city{stat.count !== 1 ? 'ies' : ''}</p>
              </motion.div>
            ))}
          </div>

          {/* City Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCities.map((city, i) => (
              <motion.div
                key={`${city.city}-${city.state}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 40 }}
                onClick={() => setSelectedCity(selectedCity?.city === city.city ? null : city)}
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${
                  selectedCity?.city === city.city
                    ? 'border-nature-300 bg-nature-50 shadow-md'
                    : 'border-surface-200 bg-white hover:border-nature-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-nature-600" />
                    <div>
                      <p className="text-sm font-semibold text-surface-900">{city.city}</p>
                      <p className="text-xs text-surface-500">{city.state}</p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-xs">
                    {city.dominant_crop}
                  </Badge>
                </div>
                <p className="text-xs text-surface-500 line-clamp-2">{city.crop_distribution}</p>
              </motion.div>
            ))}
          </div>

          {filteredCities.length === 0 && (
            <div className="py-8 text-center text-surface-500">
              {t('No cities found for the selected crop.')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* City Detail Panel */}
      {selectedCity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-nature-200 bg-nature-50/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-surface-900">{selectedCity.city}, {selectedCity.state}</h3>
                  <Badge variant="success" className="mt-1">
                    {selectedCity.dominant_crop}
                  </Badge>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelectedCity(null)}>
                  Close
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-surface-700">{t('Crop Distribution')}</p>
                  <p className="text-sm text-surface-600 mt-1">{selectedCity.crop_distribution}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-700">{t('Agricultural Information')}</p>
                  <p className="text-sm text-surface-600 mt-1">{selectedCity.agricultural_information}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
