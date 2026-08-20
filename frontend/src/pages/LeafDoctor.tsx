import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Leaf, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Camera, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { analyzeLeaf } from '../services/leaf_analysis'
import { LeafAnalysis } from '../types/leaf_analysis'
import { PLANTS } from '../utils/constants'

const CROP_OPTIONS = [
  { value: '', label: 'Auto-detect' },
  ...PLANTS.map(p => ({ value: p.name, label: p.name })),
]

export default function LeafDoctor() {
  const { t } = useTranslation()
  const { id } = useParams()
  const farmId = id ? Number(id) : null
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LeafAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cropOverride, setCropOverride] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [locationError, setLocationError] = useState<string | null>(null)

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    setResult(null)
    setError(null)
    if (f) {
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }, [])

  const captureLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error')
      setLocationError('Geolocation is not supported by your browser.')
      return
    }
    if (!window.isSecureContext) {
      setLocationStatus('error')
      setLocationError('Location requires HTTPS or localhost. Please access via https:// or http://localhost.')
      return
    }
    setLocationStatus('loading')
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        setLocationStatus('success')
      },
      (err) => {
        setLocationStatus('error')
        const msg = err.message || 'Unable to retrieve location.'
        if (err.code === 1) {
          setLocationError('Location permission denied. Please allow location access and try again.')
        } else if (err.code === 2) {
          setLocationError('Location unavailable. Please check your device location settings.')
        } else if (err.code === 3) {
          setLocationError('Location request timed out. Please try again.')
        } else {
          setLocationError(msg)
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }, [])

  const onAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await analyzeLeaf(farmId, file, cropOverride || undefined, latitude ?? undefined, longitude ?? undefined)
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'We couldn\'t complete the analysis right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const severityBadge = (s?: string) => {
    if (!s) return null
    const map: Record<string, 'danger' | 'warning' | 'success' | 'default'> = {
      HIGH: 'danger',
      MODERATE: 'warning',
      LOW: 'success',
    }
    return <Badge variant={map[s] || 'default'}>{s}</Badge>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to={farmId ? `/farms/${farmId}` : '/farms'}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('Leaf Doctor')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('Upload a leaf image to detect crop conditions and diseases.')}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-900 dark:text-gray-100">{t('Crop (optional)')}</label>
              <select
                value={cropOverride}
                onChange={(e) => setCropOverride(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100"
              >
                {CROP_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('Leave as Auto-detect to let AI identify the crop.')}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-900 dark:text-gray-100">{t('Upload Image')}</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => document.getElementById('leaf-file')?.click()}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" /> {t('Choose Image')}
                </Button>
                <input
                  id="leaf-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={onFileChange}
                />
                {file && <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">{file.name}</span>}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-900 dark:text-gray-100">{t('Live Location')}</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={captureLocation}
                  disabled={locationStatus === 'loading'}
                  className="flex items-center gap-2"
                >
                  {locationStatus === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin text-nature-600" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {locationStatus === 'success' ? t('Location Captured') : t('Capture Location')}
                </Button>
                {latitude !== null && longitude !== null && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </span>
                )}
              </div>
              {locationStatus === 'error' && locationError && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{locationError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('Allow location access to get live weather for this spot.')}</p>
            </div>
          </div>

          {preview && (
            <div className="flex justify-center">
              <img src={preview} alt="preview" className="max-h-64 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onAnalyze} disabled={!file || loading} className="flex items-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Leaf className="h-4 w-4" />}
              {loading ? t('Analyzing...') : t('Analyze Leaf')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && result.status === 'success' && (
        <div className="space-y-4">
          <Card className="border-green-100 dark:border-green-900 bg-green-50/60 dark:bg-green-900/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-green-900 dark:text-green-100">{t('Analysis Complete')}</h3>
                    {severityBadge(result.severity)}
                  </div>
                   <div className="grid grid-cols-2 gap-3 text-sm">
                     <div><span className="text-gray-500 dark:text-gray-400">{t('Crop')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{result.crop}</span></div>
                     <div><span className="text-gray-500 dark:text-gray-400">{t('Condition')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{result.condition?.replace(/_/g, ' ')}</span></div>
                     <div><span className="text-gray-500 dark:text-gray-400">{t('Crop Confidence')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{result.crop_confidence ? `${(result.crop_confidence * 100).toFixed(1)}%` : 'N/A'}</span></div>
                     <div><span className="text-gray-500 dark:text-gray-400">{t('Health')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{result.health_status}</span></div>
                     <div><span className="text-gray-500 dark:text-gray-400">{t('Model')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{result.model_version}</span></div>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('Location & Weather')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {result.latitude != null && result.longitude != null && (
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-gray-500 dark:text-gray-400">{t('Captured Location')}:</span>{' '}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}
                    </span>
                  </div>
                )}
                {result.weather_source && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">{t('Weather Source')}:</span>{' '}
                    <span className="font-medium text-gray-900 dark:text-gray-100">{result.weather_source}</span>
                  </div>
                )}
                {result.temperature != null && <div><span className="text-gray-500 dark:text-gray-400">{t('Temperature')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{result.temperature.toFixed(1)}°C</span></div>}
                {result.humidity != null && <div><span className="text-gray-500 dark:text-gray-400">{t('Humidity')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{result.humidity.toFixed(1)}%</span></div>}
                {result.rainfall != null && <div><span className="text-gray-500 dark:text-gray-400">{t('Rainfall')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{result.rainfall.toFixed(1)} mm</span></div>}
                {result.ndvi != null && <div><span className="text-gray-500 dark:text-gray-400">NDVI:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{result.ndvi.toFixed(2)}</span></div>}
                {result.ndmi != null && <div><span className="text-gray-500 dark:text-gray-400">NDMI:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{result.ndmi.toFixed(2)}</span></div>}
                {result.ndwi != null && <div><span className="text-gray-500 dark:text-gray-400">NDWI:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{result.ndwi.toFixed(2)}</span></div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('Overall Risk')}</h3>
              <div className="flex items-center gap-3">
                <Badge variant={result.risk_level === 'HIGH' ? 'danger' : result.risk_level === 'MODERATE' ? 'warning' : 'success'}>{result.risk_level}</Badge>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('Score')}: {result.risk_score?.toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>

          {result.recommendation && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('Recommended Action')}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{result.recommendation}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {result && result.status !== 'success' && (
        <Card className="border-amber-100 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-900/20">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">{t('Unable to Analyze')}</h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">{result.error_message || 'Please try again with a clearer image.'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
