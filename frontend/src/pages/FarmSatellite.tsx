import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, Satellite, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getSatellite } from '../services/satellite'
import { formatDate, formatPercent } from '../utils/formatters'

const INDEX_INFO: Record<string, { title: string; description: string; high: string; low: string }> = {
  ndvi: {
    title: 'NDVI',
    description: 'Vegetation health and density. Measures how much near-infrared light plants reflect vs red light they absorb.',
    high: 'High (0.6–1.0): Dense, healthy vegetation like forests or thriving crops.',
    low: 'Low (0.0–0.3): Bare soil, water, dead vegetation, or urban areas.',
  },
  ndmi: {
    title: 'NDMI',
    description: 'Vegetation water content. Uses near-infrared and short-wave infrared to detect moisture stress in crops.',
    high: 'High (0.2–1.0): Well-watered, healthy crops with good moisture levels.',
    low: 'Low (−1.0–0.0): Dry soil, drought stress, or dormant vegetation.',
  },
  ndwi: {
    title: 'NDWI',
    description: 'Water presence in vegetation and soil. Helps detect irrigation issues, waterlogging, or drought.',
    high: 'High (0.2–1.0): Abundant water in vegetation or surface water bodies.',
    low: 'Low (−1.0–0.0): Dry vegetation or soil with low water content.',
  },
}

export default function FarmSatellite() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getSatellite(Number(id)).then((d) => { setData(d); setLoading(false) })
  }, [id])

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green-700" /></div>

  const chartData = data.map((s) => ({ date: s.observation_date, ndvi: s.ndvi, ndmi: s.ndmi, ndwi: s.ndwi })).reverse()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Satellite className="h-6 w-6 text-green-700" />
        <h1 className="text-2xl font-bold text-gray-900">{t('Satellite Observations')}</h1>
      </div>
      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{t('No satellite observations available yet.')}</div>
      ) : (
        <>
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-gray-900 mb-1">{t('Vegetation Indices')}</h3>
              <p className="text-sm text-gray-500 mb-4">{t('Track crop health, water levels, and vegetation changes over time. Hover over the chart to see values.')}</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: any, name: string) => [formatPercent(value), name.toUpperCase()]} />
                    <Line type="monotone" dataKey="ndvi" stroke="#16a34a" strokeWidth={2} dot={false} name="NDVI" onMouseEnter={() => setActiveIndex('ndvi')} onMouseLeave={() => setActiveIndex(null)} />
                    <Line type="monotone" dataKey="ndmi" stroke="#3b82f6" strokeWidth={2} dot={false} name="NDMI" onMouseEnter={() => setActiveIndex('ndmi')} onMouseLeave={() => setActiveIndex(null)} />
                    <Line type="monotone" dataKey="ndwi" stroke="#06b6d4" strokeWidth={2} dot={false} name="NDWI" onMouseEnter={() => setActiveIndex('ndwi')} onMouseLeave={() => setActiveIndex(null)} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {activeIndex && INDEX_INFO[activeIndex] && (
            <Card className="border-blue-100 bg-blue-50/60">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900">{INDEX_INFO[activeIndex].title}</h4>
                    <p className="text-sm text-blue-800 mt-1">{INDEX_INFO[activeIndex].description}</p>
                    <p className="text-sm text-green-700 mt-2"><strong>{t('High')}:</strong> {INDEX_INFO[activeIndex].high}</p>
                    <p className="text-sm text-red-700 mt-1"><strong>{t('Low')}:</strong> {INDEX_INFO[activeIndex].low}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-gray-900 mb-2">{t('Observations')}</h3>
              <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-lg bg-green-50 p-3">
                  <div className="text-xs font-semibold text-green-800">NDVI</div>
                  <div className="text-xs text-green-700 mt-1">{INDEX_INFO.ndvi.description}</div>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <div className="text-xs font-semibold text-blue-800">NDMI</div>
                  <div className="text-xs text-blue-700 mt-1">{INDEX_INFO.ndmi.description}</div>
                </div>
                <div className="rounded-lg bg-cyan-50 p-3">
                  <div className="text-xs font-semibold text-cyan-800">NDWI</div>
                  <div className="text-xs text-cyan-700 mt-1">{INDEX_INFO.ndwi.description}</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left py-2" title="Date of satellite image">{t('Date')}</th><th className="text-left py-2" title="Satellite data provider">{t('Source')}</th><th className="text-left py-2" title="Vegetation health and density">{t('NDVI')}</th><th className="text-left py-2" title="Vegetation water content / moisture stress">{t('NDMI')}</th><th className="text-left py-2" title="Water presence in vegetation or soil">{t('NDWI')}</th><th className="text-left py-2" title="Percentage of cloud cover in the image">{t('Cloud %')}</th></tr></thead>
                  <tbody>
                    {data.map((s) => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="py-2">{formatDate(s.observation_date)}</td>
                        <td className="py-2 capitalize">{s.source}</td>
                        <td className="py-2">{formatPercent(s.ndvi)}</td>
                        <td className="py-2">{formatPercent(s.ndmi)}</td>
                        <td className="py-2">{formatPercent(s.ndwi)}</td>
                        <td className="py-2">{s.cloud_percentage ? `${s.cloud_percentage.toFixed(1)}%` : t('N/A')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
