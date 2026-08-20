import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, Lightbulb } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { getRecommendations } from '../services/analysis'
import { formatDate } from '../utils/formatters'

export default function FarmRecommendations() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [recs, setRecs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getRecommendations(Number(id)).then((r) => { setRecs(r); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green-700" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('Recommendations')}</h1>
      {recs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{t('No recommendations yet. Run an analysis first.')}</div>
      ) : (
        <div className="space-y-4">
          {recs.map((rec) => (
            <Card key={rec.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{rec.recommendation}</h3>
                      <p className="text-sm text-gray-500 mt-1">{rec.reasoning}</p>
                    </div>
                  </div>
                  <Badge variant={rec.priority === 'CRITICAL' ? 'danger' : rec.priority === 'MEDIUM' ? 'warning' : 'success'}>
                    {rec.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
