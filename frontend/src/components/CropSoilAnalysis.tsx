import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { motion } from 'framer-motion'
import { api } from '../lib/api'
import { useEffect, useState } from 'react'

interface CropSoilRule {
  crop: string
  soil_type: string
  suitability: string
  explanation: string
  recommended_action: string
}

interface CropSoilAnalysisProps {
  crop: string
  soilType: string
}

export default function CropSoilAnalysis({ crop, soilType }: CropSoilAnalysisProps) {
  const { t } = useTranslation()
  const [rules, setRules] = useState<CropSoilRule[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!crop || !soilType) return
    setLoading(true)
    api.get(`/knowledge/crop-soil?crop=${encodeURIComponent(crop)}&soil=${encodeURIComponent(soilType)}`)
      .then((res) => setRules(res.data || []))
      .catch(() => setRules([]))
      .finally(() => setLoading(false))
  }, [crop, soilType])

  if (!crop || !soilType) return null

  const rule = rules[0]

  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-nature-600 border-t-transparent" />
            <span className="text-sm text-surface-500">{t('Loading...')}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!rule) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <p className="text-sm text-surface-500">{t('No crop-soil data available for this combination.')}</p>
        </CardContent>
      </Card>
    )
  }

  const suitabilityConfig = {
    HIGH: { variant: 'success' as const, label: 'Highly Suitable' },
    MODERATE: { variant: 'warning' as const, label: 'Moderately Suitable' },
    LOW: { variant: 'danger' as const, label: 'Low Suitability' },
  }

  const config = suitabilityConfig[rule.suitability as keyof typeof suitabilityConfig] || suitabilityConfig.MODERATE

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`mt-4 border-l-4 ${rule.suitability === 'HIGH' ? 'border-l-green-500' : rule.suitability === 'MODERATE' ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-surface-900">{t('Crop-Soil Suitability')}</h3>
              <Badge variant={config.variant}>{config.label}</Badge>
            </div>
          }
        />
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-surface-700">{t('Explanation')}</p>
            <p className="text-sm text-surface-600 mt-1">{rule.explanation}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-surface-700">{t('Recommended Action')}</p>
            <p className="text-sm text-surface-600 mt-1">{rule.recommended_action}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
