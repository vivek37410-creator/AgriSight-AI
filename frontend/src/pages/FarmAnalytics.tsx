import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, Leaf } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getSatellite } from '../services/satellite'
import { getWeather } from '../services/weather'
import { getLeafHistory } from '../services/leaf_analysis'
import { formatDate, formatPercent } from '../utils/formatters'

export default function FarmAnalytics() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [satellite, setSatellite] = useState<any[]>([])
  const [weather, setWeather] = useState<any[]>([])
  const [leafAnalyses, setLeafAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([getSatellite(Number(id)), getWeather(Number(id)), getLeafHistory(Number(id))])
      .then(([s, w, l]) => {
        setSatellite(s)
        setWeather(w)
        setLeafAnalyses(l)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green-700" /></div>

  const ndviData = satellite.map((s) => ({ date: s.observation_date, ndvi: s.ndvi })).reverse()
  const tempData = weather.map((w) => ({ date: w.recorded_at, temp: w.temperature })).reverse()
  const leafDiseaseEvents = leafAnalyses
    .filter((l) => l.condition && l.condition.toLowerCase() !== 'healthy')
    .map((l) => ({
      date: l.created_at,
      condition: l.condition?.replace(/_/g, ' '),
      severity: l.severity,
      confidence: l.disease_confidence,
    }))
    .reverse()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('Farm Analytics')}</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4">{t('NDVI Trend')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ndviData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => [formatPercent(value), t('NDVI')]} />
                  <Line type="monotone" dataKey="ndvi" stroke="#16a34a" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4">{t('Temperature')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tempData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => [`${value.toFixed(1)}°C`, t('Temp')]} />
                  <Line type="monotone" dataKey="temp" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {leafDiseaseEvents.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-600" /> {t('Leaf Disease Events')}
            </h3>
            <div className="space-y-3">
              {leafDiseaseEvents.map((evt, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{evt.condition}</p>
                    <p className="text-xs text-gray-500">{formatDate(evt.date)}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>{t('Severity')}: {evt.severity}</p>
                    <p>{t('Confidence')}: {evt.confidence ? `${(evt.confidence * 100).toFixed(1)}%` : 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
