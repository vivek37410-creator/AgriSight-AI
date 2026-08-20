import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import Layout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import AgricultureMap from './pages/AgricultureMap'
import Farms from './pages/Farms'
import FarmCreate from './pages/FarmCreate'
import FarmDetail from './pages/FarmDetail'
import FarmAnalytics from './pages/FarmAnalytics'
import FarmSatellite from './pages/FarmSatellite'
import FarmRecommendations from './pages/FarmRecommendations'
import FarmReports from './pages/FarmReports'
import Alerts from './pages/Alerts'
import Assistant from './pages/Assistant'
import Pricing from './pages/Pricing'
import Billing from './pages/Billing'
import Settings from './pages/Settings'
import LeafDoctor from './pages/LeafDoctor'
import LeafHistory from './pages/LeafHistory'
import ProfileSetup from './pages/ProfileSetup'
import Login from './pages/Login'
import Register from './pages/Register'
import SplashScreen from './components/SplashScreen'
import UserTour from './components/UserTour'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getProfile } from './services/auth'
import { useQueryClient } from '@tanstack/react-query'
import { getFarms } from './services/farms'
import { getAlerts } from './services/alerts'
import { getLeafHistory } from './services/leaf_analysis'
import { useTranslation } from 'react-i18next'

const ADMIN_EMAIL = "31241580@vupune.ac.in"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth()
  if (loading) return null
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user || user.email !== ADMIN_EMAIL) return <Navigate to="/" replace />
  return <>{children}</>
}

function ProfileSetupRoute() {
  const { user } = useAuth()
  if (user?.profile_completed) return <Navigate to="/" replace />
  return <ProfileSetup />
}

export default function App() {
  const { token, setUser } = useAuth()
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [showSplash, setShowSplash] = useState(true)
  const [showLoginTransition, setShowLoginTransition] = useState(false)

  useEffect(() => {
    if (token) {
      getProfile().then(setUser).catch(() => {})
      queryClient.prefetchQuery({ queryKey: ['farms'], queryFn: getFarms })
      queryClient.prefetchQuery({ queryKey: ['alerts'], queryFn: getAlerts })
      queryClient.prefetchQuery({ queryKey: ['leaf-analyses'], queryFn: () => getLeafHistory() })
    }
  }, [token, setUser, queryClient])

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  const handleLoginSuccess = () => {
    setShowLoginTransition(true)
    setTimeout(() => setShowLoginTransition(false), 1200)
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen key="splash" onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      {!showSplash && (
        <Routes>
          {showLoginTransition && token ? (
            <Route
              path="*"
              element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed inset-0 z-40 flex items-center justify-center bg-nature-900"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, ease: 'linear' }}
                      className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-nature-400 border-t-transparent"
                    />
                    <p className="text-lg font-medium text-nature-100">{t('Loading your farm...')}</p>
                  </div>
                </motion.div>
              }
            />
          ) : (
            <>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="profile-setup" element={<ProfileSetupRoute />} />
                <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="farms" element={<ProtectedRoute><Farms /></ProtectedRoute>} />
                <Route path="farms/create" element={<ProtectedRoute><FarmCreate /></ProtectedRoute>} />
                <Route path="farms/:id" element={<ProtectedRoute><FarmDetail /></ProtectedRoute>} />
                <Route path="farms/:id/analytics" element={<ProtectedRoute><FarmAnalytics /></ProtectedRoute>} />
                <Route path="farms/:id/satellite" element={<ProtectedRoute><FarmSatellite /></ProtectedRoute>} />
                <Route path="farms/:id/recommendations" element={<ProtectedRoute><FarmRecommendations /></ProtectedRoute>} />
                <Route path="farms/:id/reports" element={<ProtectedRoute><FarmReports /></ProtectedRoute>} />
                <Route path="farms/:id/leaf-doctor" element={<ProtectedRoute><LeafDoctor /></ProtectedRoute>} />
                <Route path="farms/:id/leaf-history" element={<ProtectedRoute><LeafHistory /></ProtectedRoute>} />
                <Route path="leaf-doctor" element={<ProtectedRoute><LeafDoctor /></ProtectedRoute>} />
                <Route path="leaf-history" element={<ProtectedRoute><LeafHistory /></ProtectedRoute>} />
                <Route path="alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
                <Route path="assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
                <Route path="pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
                <Route path="billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      )}
      {!showSplash && token && <UserTour />}
    </>
  )
}
