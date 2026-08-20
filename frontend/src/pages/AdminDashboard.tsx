import { useEffect, useState, useCallback } from 'react'
import { Users, Map, Sprout, AlertTriangle, TrendingUp, Activity, Loader2, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { api } from '../lib/api'

interface AdminStats {
  total_farmers: number
  total_farms: number
  total_area: number
  most_grown_crop: string
  high_risk_farms: number
  active_farmers: number
}

interface FarmSummary {
  id: number
  name: string
  user_name: string
  user_email: string
  crop: string
  health_score: number
  risk_level: string
  area: number
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [farms, setFarms] = useState<FarmSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const [statsRes, farmsRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: null })),
        api.get('/admin/farms').catch(() => ({ data: [] })),
      ])
      if (statsRes.data) setStats(statsRes.data)
      setFarms(farmsRes.data || [])
    } catch (e) {
      console.error('Failed to load admin data', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [load])

  const handleRefresh = () => {
    setRefreshing(true)
    setLoading(true)
    load()
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-nature-600" />
          <p className="text-sm text-surface-500">{t('Loading...')}</p>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: t('Total Farmers'), value: stats?.total_farmers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', accent: 'from-blue-500 to-blue-600' },
    { label: t('Total Farms'), value: stats?.total_farms || 0, icon: Map, color: 'text-nature-600', bg: 'bg-nature-50', accent: 'from-nature-500 to-nature-600' },
    { label: t('Total Cultivated Area'), value: `${(stats?.total_area || 0).toFixed(1)} ha`, icon: Sprout, color: 'text-green-600', bg: 'bg-green-50', accent: 'from-green-500 to-emerald-600' },
    { label: t('Most Grown Crop'), value: stats?.most_grown_crop || 'N/A', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', accent: 'from-amber-500 to-orange-600' },
    { label: t('High-Risk Farms'), value: stats?.high_risk_farms || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', accent: 'from-red-500 to-rose-600' },
    { label: t('Active Farmers'), value: stats?.active_farmers || 0, icon: Activity, color: 'text-teal-600', bg: 'bg-teal-50', accent: 'from-teal-500 to-cyan-600' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl gradient-nature p-6 md:p-8 text-white shadow-lg"
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('Admin Dashboard')}</h1>
        <p className="mt-2 text-nature-100 text-sm md:text-base max-w-xl">
          {t('Monitor platform-wide agriculture intelligence, farm health, and regional trends.')}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
          >
            <Card className="h-full overflow-hidden">
              <CardContent className="p-5 relative">
                <div className={`absolute -right-3 -top-3 h-20 w-20 rounded-full bg-gradient-to-br ${stat.accent} opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-500`} />
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 font-medium">{stat.label}</p>
                    <p className="text-lg font-bold text-surface-900 tracking-tight">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Farm List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0 }}
      >
        <Card>
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="font-semibold text-surface-900">{t('All Farms')}</h3>
            <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {t('Refresh')}
            </Button>
          </div>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="text-left py-3 px-4 font-medium text-surface-500">{t('Farm')}</th>
                    <th className="text-left py-3 px-4 font-medium text-surface-500">{t('Farmer')}</th>
                    <th className="text-left py-3 px-4 font-medium text-surface-500">{t('Email')}</th>
                    <th className="text-left py-3 px-4 font-medium text-surface-500">{t('Crop')}</th>
                    <th className="text-left py-3 px-4 font-medium text-surface-500">{t('Health')}</th>
                    <th className="text-left py-3 px-4 font-medium text-surface-500">{t('Risk')}</th>
                    <th className="text-left py-3 px-4 font-medium text-surface-500">{t('Area')}</th>
                  </tr>
                </thead>
                <tbody>
                  {farms.map((farm, i) => (
                    <motion.tr
                      key={farm.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0 }}
                      className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-surface-900">{farm.name}</td>
                      <td className="py-3 px-4 text-surface-600">{farm.user_name}</td>
                      <td className="py-3 px-4 text-surface-600">{farm.user_email}</td>
                      <td className="py-3 px-4 text-surface-600">{farm.crop}</td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${farm.health_score >= 75 ? 'text-green-600' : farm.health_score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {farm.health_score}/100
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={farm.risk_level === 'HIGH' ? 'danger' : farm.risk_level === 'MODERATE' ? 'warning' : 'success'}>
                          {farm.risk_level}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-surface-600">{farm.area.toFixed(1)} ha</td>
                    </motion.tr>
                  ))}
                  {farms.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-surface-500">
                        {t('No farms found.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
