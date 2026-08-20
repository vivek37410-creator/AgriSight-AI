import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Download, FileText, Loader2 } from 'lucide-react'
import { Report } from '../types'
import { cn } from '../lib/utils'

interface ReportGeneratorProps {
  reports: Report[]
  onGenerate: (type: string) => Promise<void>
  className?: string
}

const reportTypes = [
  'Health Summary',
  'Soil Analysis',
  'Irrigation Report',
  'Yield Prediction',
  'Satellite Analysis',
]

export default function ReportGenerator({ reports, onGenerate, className }: ReportGeneratorProps) {
  const { t } = useTranslation()
  const [generating, setGenerating] = useState(false)
  const [selectedType, setSelectedType] = useState('')

  const handleGenerate = async () => {
    if (!selectedType) return
    setGenerating(true)
    await onGenerate(selectedType)
    setGenerating(false)
  }

  return (
    <Card className={className}>
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-charcoal">{t('Reports')}</h3>
        <p className="text-sm text-gray-500">{t('Generate and download farm reports')}</p>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-charcoal">{t('Report Type')}</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {reportTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  selectedType === type
                    ? 'border-deep-green bg-green-50 text-deep-green'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {t(type)}
              </button>
            ))}
          </div>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={!selectedType || generating}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('Generating...')}
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              {t('Generate Report')}
            </>
          )}
        </Button>
      </div>
      {reports.length > 0 && (
        <div className="border-t border-gray-100">
          <div className="px-6 py-4">
            <h4 className="text-sm font-semibold text-charcoal">{t('Recent Reports')}</h4>
          </div>
          <div className="divide-y divide-gray-100">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-charcoal">{report.type}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(report.generatedAt).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={report.downloadUrl}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-deep-green hover:bg-green-50"
                >
                  <Download className="h-4 w-4" />
                  {t('Download')}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
