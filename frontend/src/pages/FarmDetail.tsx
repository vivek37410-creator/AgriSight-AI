import { useState, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertTriangle, MapPin, Calendar, Droplets, Sprout, Cloud, Satellite, FileText, Lightbulb, Pencil, Save, X, TrendingUp, TrendingDown, Minus, CheckCircle, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { getFarm, updateFarm, validateFarm } from '../services/farms'
import { getWeather } from '../services/weather'
import { getLatestSatellite } from '../services/satellite'
import { getHealth, analyzeFarm } from '../services/analysis'
import { FarmValidation } from '../types/farm'
import { formatDate, formatPercent, formatArea } from '../utils/formatters'
import FarmBoundaryMap from '../components/FarmBoundaryMap'

export default function FarmDetail() {
  const { id } = useParams()
  const location = useLocation()
  const { t } = useTranslation()
  const [farm, setFarm] = useState<any>(null)
  const [weather, setWeather] = useState<any>(null)
  const [sat, setSat] = useState<any>(null)
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editingBoundary, setEditingBoundary] = useState(false)
  const [savingBoundary, setSavingBoundary] = useState(false)
  const [validation, setValidation] = useState<FarmValidation | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisMessage, setAnalysisMessage] = useState<string | null>(null)
  const initialValidation = (location.state as any)?.validation as FarmValidation | null

  useEffect(() => {
    if (initialValidation) {
      setValidation(initialValidation)
    }
  }, [initialValidation])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([getFarm(Number(id)), getWeather(Number(id)), getLatestSatellite(Number(id)).catch(() => null), getHealth(Number(id)).catch(() => null)])
      .then(([f, w, s, h]) => {
        setFarm(f)
        setWeather(w?.[0])
        setSat(s)
        setHealth(h)
        if (!initialValidation && f) {
          validateFarm({ crop_id: f.crop_id, soil_type: f.soil_type })
            .then(setValidation)
            .catch(() => {})
        }
      })
      .finally(() => setLoading(false))
  }, [id, initialValidation])

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
        <p className="text-sm text-surface-500">{t('Loading farm data...')}</p>
      </div>
    </div>
  )
  if (!farm) return <div className="text-center py-12 text-surface-500">{t('Farm not found.')}</div>

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

  const TrendIcon = health ? (health.health_score >= 75 ? TrendingUp : health.health_score >= 50 ? TrendingDown : Minus) : Minus

  const handleAnalyze = async () => {
    if (!id) return
    setAnalyzing(true)
    setAnalysisMessage(null)
    try {
      await analyzeFarm(Number(id))
      setAnalysisMessage('Analysis complete. Recommendations have been updated.')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setAnalysisMessage('Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/farms">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-surface-900">{farm.name}</h1>
          <p className="text-sm text-surface-500">{t('Created')} {formatDate(farm.created_at)}</p>
        </div>
        <Badge variant={farm.soil_type ? 'success' : 'warning'}>
          {farm.soil_type || t('Unknown Soil')}
        </Badge>
      </div>

      {/* Health Score */}
      {health && (
        <Card className={`border ${getScoreBg(health.health_score)}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('Health Score')}</p>
                <p className={`mt-2 text-4xl font-bold ${getScoreColor(health.health_score)}`}>
                  {health.health_score.toFixed(1)}/100
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {health.health_score >= 75 ? 'Good' : health.health_score >= 50 ? 'Needs Attention' : 'At Risk'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium ${health.health_score >= 75 ? 'text-green-600' : health.health_score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  <TrendIcon className="h-4 w-4" />
                  <span>AgriSight</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-xs text-gray-500">Vegetation</p>
                <p className="text-sm font-semibold text-gray-900">{health.vegetation_score?.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Moisture</p>
                <p className="text-sm font-semibold text-gray-900">{health.moisture_score?.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Weather</p>
                <p className="text-sm font-semibold text-gray-900">{health.weather_score?.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Stress</p>
                <p className="text-sm font-semibold text-gray-900">{health.stress_score?.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-surface-500 font-medium">{t('Area')}</p>
                <p className="text-lg font-bold text-surface-900">{formatArea(farm.area_hectares)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <Droplets className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-surface-500 font-medium">{t('Irrigation')}</p>
                <p className="text-lg font-bold text-surface-900">{farm.irrigation_type || t('Unknown')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-surface-500 font-medium">{t('Sowing Date')}</p>
                <p className="text-lg font-bold text-surface-900">{farm.sowing_date ? formatDate(farm.sowing_date) : t('N/A')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-surface-500 font-medium">{t('Crop')}</p>
                <p className="text-lg font-bold text-surface-900">{farm.crop_name || t('Monitoring')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Data */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Cloud className="h-4 w-4 text-surface-400" />
              <p className="text-sm text-surface-500 font-medium">{t('Temperature')}</p>
            </div>
            <p className="text-2xl font-bold text-surface-900">{weather?.temperature ? `${weather.temperature.toFixed(1)}°C` : t('N/A')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="h-4 w-4 text-surface-400" />
              <p className="text-sm text-surface-500 font-medium">{t('Humidity')}</p>
            </div>
            <p className="text-2xl font-bold text-surface-900">{weather?.humidity ? `${weather.humidity.toFixed(1)}%` : t('N/A')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Satellite className="h-4 w-4 text-surface-400" />
              <p className="text-sm text-surface-500 font-medium">{t('Latest NDVI')}</p>
            </div>
            <p className="text-2xl font-bold text-surface-900">{sat?.ndvi ? formatPercent(sat.ndvi) : t('N/A')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions & Boundary */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title={<h3 className="font-semibold text-surface-900">{t('Quick Actions')}</h3>} />
          <CardContent className="space-y-4">
            {validation && (
              <div className={`rounded-xl border-l-4 p-4 ${validation.suitability === 'HIGH' ? 'border-l-green-500 bg-green-50' : validation.suitability === 'MODERATE' ? 'border-l-yellow-500 bg-yellow-50' : 'border-l-red-500 bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {validation.suitability === 'HIGH' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-sm font-semibold text-surface-900">
                    {validation.suitability === 'HIGH' ? t('Suitable Combination') : validation.suitability === 'MODERATE' ? t('Moderate Suitability') : t('Not Recommended')}
                  </span>
                </div>
                <p className="text-sm text-surface-700 mb-2">{validation.explanation}</p>
                <p className="text-sm font-medium text-surface-800">{t('Recommended Action')}: {validation.recommended_action}</p>
                {validation.amendments_required && (
                  <p className="text-sm text-surface-600 mt-1"><strong>{t('Amendments')}:</strong> {validation.amendments_required}</p>
                )}
                {validation.irrigation_adjustment && (
                  <p className="text-sm text-surface-600 mt-1"><strong>{t('Irrigation')}:</strong> {validation.irrigation_adjustment}</p>
                )}
              </div>
            )}
            {!validation && (
              <div className="rounded-xl border-l-4 border-l-nature-500 bg-nature-50 p-4">
                <p className="text-sm text-surface-700">{t('Loading recommendations...')}</p>
              </div>
            )}
            {analysisMessage && (
              <div className={`rounded-xl border-l-4 p-4 ${analysisMessage.includes('complete') ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
                <p className="text-sm text-surface-700">{analysisMessage}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleAnalyze} loading={analyzing} icon={<Play className="h-4 w-4" />}>
                {analyzing ? 'Analyzing...' : 'Analyze Farm'}
              </Button>
              <Link to={`/farms/${farm.id}/analytics`}><Button size="sm" icon={<FileText className="h-4 w-4" />}>{t('Analytics')}</Button></Link>
              <Link to={`/farms/${farm.id}/satellite`}><Button size="sm" variant="outline" icon={<Satellite className="h-4 w-4" />}>{t('Satellite')}</Button></Link>
              <Link to={`/farms/${farm.id}/recommendations`}><Button size="sm" variant="outline" icon={<Lightbulb className="h-4 w-4" />}>{t('Recommendations')}</Button></Link>
              <Link to={`/farms/${farm.id}/reports`}><Button size="sm" variant="outline" icon={<FileText className="h-4 w-4" />}>{t('Reports')}</Button></Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader
            title={<h3 className="font-semibold text-surface-900">{t('Boundary')}</h3>}
            action={
              farm.boundary_geojson && !editingBoundary ? (
                <Button size="sm" variant="ghost" icon={<Pencil className="h-4 w-4" />} onClick={() => setEditingBoundary(true)}>
                  {t('Edit')}
                </Button>
              ) : null
            }
          />
          <CardContent>
            {farm.boundary_geojson ? (
              <FarmBoundaryMap
                value={farm.boundary_geojson}
                onChange={
                  editingBoundary
                    ? (geojson) => {
                        if (geojson === null) {
                          setFarm((prev: any) => ({ ...prev, boundary_geojson: undefined }))
                          return
                        }
                        setFarm((prev: any) => ({ ...prev, boundary_geojson: geojson }))
                      }
                    : undefined
                }
                editable={editingBoundary}
                height="260px"
                showArea
              />
            ) : (
              <p className="text-sm text-surface-500">{t('No boundary set.')}</p>
            )}
            {editingBoundary && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Save className="h-4 w-4" />}
                  loading={savingBoundary}
                  onClick={async () => {
                    setSavingBoundary(true)
                    try {
                      const updated = await updateFarm(Number(id), { boundary_geojson: farm.boundary_geojson ?? undefined })
                      setFarm(updated)
                    } finally {
                      setSavingBoundary(false)
                      setEditingBoundary(false)
                    }
                  }}
                >
                  {t('Save')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<X className="h-4 w-4" />}
                  onClick={() => {
                    setEditingBoundary(false)
                  }}
                >
                  {t('Cancel')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
