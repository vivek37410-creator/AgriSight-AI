import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, FileText, Leaf } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { getReports, generateReport as createReport } from '../services/reports'
import { getLeafHistory } from '../services/leaf_analysis'
import { formatDate } from '../utils/formatters'

export default function FarmReports() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [leafAnalyses, setLeafAnalyses] = useState<any[]>([])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([getReports(Number(id)), getLeafHistory(Number(id))])
      .then(([r, l]) => { setReports(r); setLeafAnalyses(l); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const handleGenerate = async () => {
    if (!id) return
    await createReport(Number(id), t('Health Summary'))
    const updated = await getReports(Number(id))
    setReports(updated)
  }

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green-700" /></div>

  const latestLeaf = leafAnalyses[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('Reports')}</h1>
        <Button onClick={handleGenerate}><FileText className="mr-2 h-4 w-4" /> {t('Generate Report')}</Button>
      </div>
      {latestLeaf && (
        <Card className="border-green-100 bg-green-50/60 dark:border-green-900 dark:bg-green-900/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Leaf className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">{t('Latest Leaf Analysis')}</p>
                <p className="text-xs text-green-700 dark:text-green-300">{latestLeaf.condition?.replace(/_/g, ' ')} — {latestLeaf.health_status} — {latestLeaf.risk_level} {t('Risk')} ({formatDate(latestLeaf.created_at)})</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{t('No reports generated yet.')}</div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{report.report_type}</h3>
                  <p className="text-sm text-gray-500">{t('Generated')} {formatDate(report.generated_at)}</p>
                </div>
                {report.file_url && <a href={report.file_url} className="text-green-700 text-sm font-medium hover:underline">{t('Download')}</a>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}