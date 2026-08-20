import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, Leaf, ArrowLeft, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { getLeafHistory, getLeafAnalysis } from '../services/leaf_analysis'
import { LeafAnalysis } from '../types/leaf_analysis'
import { formatDate } from '../utils/formatters'

export default function LeafHistory() {
  const { t } = useTranslation()
  const { id } = useParams()
  const farmId = id ? Number(id) : undefined
  const [analyses, setAnalyses] = useState<LeafAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<LeafAnalysis | null>(null)

  useEffect(() => {
    setLoading(true)
    getLeafHistory(farmId)
      .then(setAnalyses)
      .finally(() => setLoading(false))
  }, [farmId])

  const onSelect = async (analysisId: number) => {
    const data = await getLeafAnalysis(analysisId)
    setSelected(data)
  }

  const severityBadge = (s?: string) => {
    if (!s) return null
    const map: Record<string, any> = {
      HIGH: 'danger',
      MODERATE: 'warning',
      LOW: 'success',
    }
    return <Badge variant={map[s] || 'secondary'}>{s}</Badge>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to={farmId ? `/farms/${farmId}` : '/farms'}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('Leaf Analysis History')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('Review previous leaf health analyses.')}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green-700" /></div>
      ) : analyses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500 dark:text-gray-400">{t('No leaf analyses yet.')}</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-3">
            {analyses.map((a) => (
              <div
                key={a.id}
                className={`cursor-pointer transition-all ${selected?.id === a.id ? 'ring-2 ring-primary-500 rounded-2xl' : ''}`}
                onClick={() => onSelect(a.id)}
              >
                <Card className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {a.image_url && <img src={a.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{a.condition?.replace(/_/g, ' ') || t('Unknown')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formatDate(a.created_at)}
                        </p>
                      </div>
                      <div className="ml-auto">{severityBadge(a.severity)}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Leaf className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('Analysis Details')}</h3>
                    {severityBadge(selected.severity)}
                  </div>
                  {selected.image_url && <img src={selected.image_url} alt="" className="max-h-64 rounded-2xl border border-gray-200 dark:border-gray-700" />}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500 dark:text-gray-400">{t('Crop')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{selected.crop}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">{t('Condition')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{selected.condition?.replace(/_/g, ' ')}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">{t('Crop Confidence')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{selected.crop_confidence ? `${(selected.crop_confidence * 100).toFixed(1)}%` : 'N/A'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">{t('Disease Confidence')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{selected.disease_confidence ? `${(selected.disease_confidence * 100).toFixed(1)}%` : 'N/A'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">{t('Health')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{selected.health_status}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">{t('Risk')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{selected.risk_level}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">{t('Temperature')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{selected.temperature?.toFixed(1)}°C</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">{t('Humidity')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{selected.humidity?.toFixed(1)}%</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">{t('NDVI')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{selected.ndvi?.toFixed(2)}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">{t('Rainfall')}:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{selected.rainfall?.toFixed(1)} mm</span></div>
                  </div>
                  {selected.recommendation && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{t('Recommended Action')}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{selected.recommendation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-gray-500 dark:text-gray-400">{t('Select an analysis to view details.')}</CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
