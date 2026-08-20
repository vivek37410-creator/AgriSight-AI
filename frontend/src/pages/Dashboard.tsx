import { Link } from 'react-router-dom'
import { Sprout, Map, AlertTriangle, CloudRain, TrendingUp, ArrowRight, Calendar, CheckCircle2, Leaf } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { useFarms } from '../hooks/useFarms'
import { useAlerts } from '../hooks/useAlerts'
import { useAuth } from '../lib/auth'
import { formatDate } from '../utils/formatters'
import { useLeafAnalyses } from '../hooks/useLeafAnalyses'
import LeafLoader from '../components/LeafLoader'
import TodaysFarmPlan from '../components/TodaysFarmPlan'
import DashboardCropMap from '../components/DashboardCropMap'
import { useWeather } from '../hooks/useWeather'
import { getHealth } from '../services/analysis'

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white dark:bg-surface-800 p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton variant="rounded" width={48} height={48} className="rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={12} />
          <Skeleton variant="text" width="40%" height={20} />
        </div>
      </div>
    </div>
  )
}

function FarmCardSkeleton() {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white dark:bg-surface-800 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <Skeleton variant="rounded" width={40} height={40} className="rounded-xl" />
        <Skeleton variant="rounded" width={60} height={24} className="rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="80%" height={16} />
        <Skeleton variant="text" width="60%" height={12} />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { data: farms, isLoading: farmsLoading } = useFarms()
  const { data: alerts } = useAlerts()
  const { data: leafAnalyses } = useLeafAnalyses()
  const { data: weatherData } = useWeather(farms?.[0]?.id || 0)

  const avgHealth = farms && farms.length > 0 ? Math.round(farms.reduce((sum, f) => sum + (f.area_hectares ? 50 : 0), 0) / farms.length) : 0
  const highRiskAlerts = alerts?.filter((a) => a.severity === 'HIGH' || a.severity === 'CRITICAL').length || 0
  const latestLeaf = leafAnalyses?.[0]
  const leafHealthLabel = latestLeaf?.health_status || t('No data')

  const showHeroSkeleton = !farms && farmsLoading
  const showStatsSkeleton = farmsLoading
  const showFarmsSkeleton = farmsLoading
  const showAlertsSkeleton = !alerts && farmsLoading

  const stats = [
    {
      label: t('Total Farms'),
      value: farms?.length || 0,
      icon: Map,
      color: 'text-nature-600',
      bg: 'bg-nature-50 dark:bg-nature-900/30',
      border: 'border-nature-100 dark:border-nature-800',
      accent: 'from-nature-500 to-nature-600',
      light: 'text-nature-700',
    },
    {
      label: t('Avg Health'),
      value: `${avgHealth}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-100 dark:border-green-800',
      accent: 'from-green-500 to-emerald-600',
      light: 'text-green-700',
    },
    {
      label: t('Active Alerts'),
      value: highRiskAlerts,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-100 dark:border-red-800',
      accent: 'from-red-500 to-rose-600',
      light: 'text-red-700',
    },
    {
      label: t('Weather Risk'),
      value: t('Low'),
      icon: CloudRain,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      border: 'border-amber-100 dark:border-amber-800',
      accent: 'from-amber-500 to-orange-600',
      light: 'text-amber-700',
    },
    {
      label: t('Leaf Health'),
      value: leafHealthLabel,
      icon: Leaf,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      border: 'border-emerald-100 dark:border-emerald-800',
      accent: 'from-emerald-500 to-teal-600',
      light: 'text-emerald-700',
      action: latestLeaf ? (
        <Link to="/leaf-history">
          <Button size="sm" variant="ghost" className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">{t('View Leaf Analysis')}</Button>
        </Link>
      ) : undefined,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      {showHeroSkeleton ? (
        <div className="rounded-3xl gradient-nature p-6 md:p-8 text-white shadow-lg">
          <div className="space-y-4">
            <Skeleton variant="text" width="50%" height={32} className="bg-white/20" shimmer />
            <Skeleton variant="text" width="80%" height={16} className="bg-white/10" shimmer />
            <div className="flex gap-3 pt-2">
              <Skeleton variant="rounded" width={140} height={40} className="rounded-xl bg-white/20" shimmer />
              <Skeleton variant="rounded" width={120} height={40} className="rounded-xl bg-white/10" shimmer />
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl gradient-nature p-6 md:p-8 text-white shadow-lg"
          data-tour="tour-hero"
        >
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/5 animate-morph" />
        <div className="absolute -right-4 -bottom-8 h-48 w-48 rounded-full bg-white/5 animate-morph" style={{ animationDelay: '2s' }} />
        <div className="absolute -left-8 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-white/5 animate-morph" style={{ animationDelay: '4s' }} />
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {t('Welcome back')}, {user?.name?.split(' ')[0] || t('Farmer')}
              </h1>
              <p className="mt-2 text-nature-100 text-sm md:text-base max-w-xl">
                {t('Monitor your farms with satellite intelligence, weather insights, and AI-powered recommendations.')}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/farms/create" data-tour="tour-create-farm">
                  <Button size="sm" className="bg-white text-nature-700 hover:bg-nature-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                    <Sprout className="mr-2 h-4 w-4" /> {t('Create New Farm')}
                  </Button>
                </Link>
                <Link to="/farms">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 transition-all duration-300">
                    {t('View All Farms')} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        <DashboardCropMap />
      </motion.div>

      {/* Bento Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {showStatsSkeleton ? Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-slide-up">
            <StatCardSkeleton />
          </div>
        )) : stats.map((stat, i) => (
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
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} border ${stat.border} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-surface-500 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-surface-900 tracking-tight">{stat.value}</p>
                    {stat.action && <div className="mt-1">{stat.action}</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bento Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Farm Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-3"
          data-tour="tour-todays-plan"
        >
          <TodaysFarmPlan weatherData={weatherData} alerts={alerts} />
        </motion.div>

        {/* Farms - spans 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-2"
          data-tour="tour-farms-section"
        >
          <Card>
            <CardHeader
              title={t('Your Farms')}
              action={
                <Link to="/farms/create">
                  <Button size="sm" className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                    <Sprout className="mr-2 h-4 w-4" /> {t('New Farm')}
                  </Button>
                </Link>
              }
            />
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {showFarmsSkeleton ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-slide-up">
                    <FarmCardSkeleton />
                  </div>
                )) : farms && farms.length > 0 ? farms.slice(0, 4).map((farm, i) => (
                  <motion.div
                    key={farm.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link to={`/farms/${farm.id}`} className="block h-full">
                      <Card className="h-full card-hover group">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nature-50 text-nature-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                              <Map className="h-5 w-5" />
                            </div>
                            <Badge variant={farm.soil_type ? 'success' : 'warning'}>
                              {farm.soil_type || t('Unknown')}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-surface-900 mb-1 group-hover:text-nature-700 transition-colors duration-200">{farm.name}</h3>
                          <div className="space-y-1.5">
                            <p className="text-sm text-surface-500 flex items-center gap-1.5">
                              <Map className="h-3 w-3" />
                              {(farm.latitude && farm.longitude) ? `${farm.latitude.toFixed(2)}, ${farm.longitude.toFixed(2)}` : t('No location set')}
                            </p>
                            <p className="text-sm text-surface-500 flex items-center gap-1.5">
                              <Sprout className="h-3 w-3" />
                              {farm.area_hectares ? t('hectares_one', { count: Number(farm.area_hectares) }) : t('Area unknown')}
                            </p>
                            <p className="text-sm text-surface-400 flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              {t('Created')} {formatDate(farm.created_at)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                )) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="col-span-2"
                  >
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-nature-200 bg-nature-50/50 p-12 text-center">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-nature-50 text-nature-600"
                      >
                        <Sprout className="h-7 w-7" />
                      </motion.div>
                      <h3 className="mb-2 text-lg font-bold text-surface-900">{t('No farms yet')}</h3>
                      <p className="mb-6 text-sm text-surface-500 max-w-sm">{t('Create your first farm to start monitoring crop health with satellite data.')}</p>
                      <Link to="/farms/create">
                        <Button className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                          <Sprout className="mr-2 h-4 w-4" /> {t('Create Farm')}
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerts Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-1"
          data-tour="tour-alerts-section"
        >
          <Card>
            <CardHeader
              title={t('Recent Alerts')}
              subtitle={highRiskAlerts > 0 ? t('alerts.active', { count: highRiskAlerts }) : undefined}
            />
            <CardContent className="p-0">
              <div className="divide-y divide-surface-100 dark:divide-surface-700">
                {showAlertsSkeleton ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-4">
                    <Skeleton variant="circular" width={32} height={32} />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" width="70%" height={14} />
                      <Skeleton variant="text" width="40%" height={12} />
                    </div>
                  </div>
                )) : alerts && alerts.length > 0 ? alerts.slice(0, 5).map((alert, i) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0, ease: [0.16, 1, 0.3, 1] }}
                    className="p-4 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-200 hover:scale-110 ${
                        alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
                          : 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-surface-900 dark:text-gray-100 truncate">{alert.title}</p>
                        <p className="text-xs text-surface-500 dark:text-gray-400 mt-0.5">{formatDate(alert.created_at)}</p>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0 }}
                    className="p-8 text-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-300"
                    >
                      <CheckCircle2 className="h-6 w-6" />
                    </motion.div>
                    <p className="text-sm font-medium text-surface-900 dark:text-gray-100">{t('All clear!')}</p>
                    <p className="text-xs text-surface-500 dark:text-gray-400 mt-1">{t('No alerts at this time')}</p>
                  </motion.div>
                )}
              </div>
              <div className="border-t border-surface-100 dark:border-surface-700 p-3">
                <Link to="/alerts">
                  <Button variant="ghost" size="sm" className="w-full hover:bg-surface-50 transition-colors duration-200">
                    {t('View all alerts')} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
