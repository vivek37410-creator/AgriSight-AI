import { Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  const { t } = useTranslation()

  if (dismissed) return null

  return (
    <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3.5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium text-amber-900">
          {t('Demo Data Mode — This dashboard is populated with sample data for demonstration purposes.')}
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-100 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
