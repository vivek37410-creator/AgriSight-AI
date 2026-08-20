import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useTranslation } from 'react-i18next'
import { Card } from './ui/Card'

interface NDVIChartProps {
  data: { date: string; ndvi: number }[]
  className?: string
}

export default function NDVIChart({ data, className }: NDVIChartProps) {
  const { t } = useTranslation()
  return (
    <Card className={className}>
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-charcoal">{t('NDVI Trend')}</h3>
        <p className="text-sm text-gray-500">{t('Normalized Difference Vegetation Index over time')}</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 1]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="ndvi"
              stroke="#166534"
              strokeWidth={2}
              dot={{ fill: '#166534', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#166534' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
