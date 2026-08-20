import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  Sprout,
  Bell,
  MessageSquare,
  CreditCard,
  Settings,
  X,
  ChevronRight,
  Leaf,
  Shield,
  Globe,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { useAuth } from '../lib/auth'
import SidebarMap from './SidebarMap'

const ADMIN_EMAIL = "31241580@vupune.ac.in"

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/farms', icon: Sprout, label: 'Farms' },
  { to: '/leaf-doctor', icon: Leaf, label: 'Leaf Doctor' },
  { to: '/leaf-history', icon: Leaf, label: 'Leaf History' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/assistant', icon: MessageSquare, label: 'Assistant' },
  { to: '/pricing', icon: CreditCard, label: 'Pricing' },
  { to: '/billing', icon: CreditCard, label: 'Billing' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const adminItems = [
  { to: '/admin', icon: Shield, label: 'Admin Dashboard' },
]

const leafSubItems = [
  { to: '/leaf-doctor', icon: Leaf, label: 'Leaf Doctor' },
  { to: '/leaf-history', icon: Leaf, label: 'Leaf History' },
]

const sidebarVariants = {
  closed: { x: '-100%', opacity: 0 },
  open: { x: '0%', opacity: 1 },
}

const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()
  const { t } = useTranslation()

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-16 items-center justify-between border-b border-nature-100 dark:border-surface-700 px-6 bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-nature shadow-lg shadow-nature-500/20">
            <Sprout className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-nature-900 dark:text-gray-100 tracking-tight">{t('AgriSight')}</span>
            <span className="block text-[10px] font-medium text-nature-600 -mt-0.5 tracking-wider uppercase">{t('AI Platform')}</span>
          </div>
        </div>
        {onNavigate && (
          <button
            className="rounded-lg p-1.5 text-surface-500 dark:text-gray-400 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
            onClick={onNavigate}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin" data-tour="tour-sidebar">
        <div className="space-y-1">
          {navItems.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0 }}
            >
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'nav-item',
                    isActive ? 'nav-item-active' : 'nav-item-inactive'
                  )
                }
                onClick={onNavigate}
              >
                <item.icon className="h-4 w-4" />
                <span>{t(item.label)}</span>
                {item.to === '/' && (
                  <ChevronRight className="ml-auto h-3 w-3 opacity-50" />
                )}
              </NavLink>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0 }}
        >
          <SidebarMap />
        </motion.div>

        {user?.email === ADMIN_EMAIL && (
          <div className="pt-4 mt-4 border-t border-surface-100 dark:border-surface-700">
            <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-surface-400 dark:text-gray-500">
              {t('Administration')}
            </p>
            {adminItems.map((item, index) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0 }}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'nav-item',
                      isActive ? 'nav-item-active' : 'nav-item-inactive'
                    )
                  }
                  onClick={onNavigate}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{t(item.label)}</span>
                </NavLink>
              </motion.div>
            ))}
          </div>
        )}
      </nav>

      <div className="border-t border-nature-100 dark:border-surface-700 p-4" data-tour="tour-profile">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="flex items-center gap-3 rounded-xl bg-nature-50/80 dark:bg-surface-700/50 p-3 cursor-pointer"
        >
          {user?.profile_photo ? (
            <img src={user.profile_photo} alt="Profile" className="h-9 w-9 rounded-lg object-cover border border-nature-200 dark:border-surface-600" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nature-100 text-sm font-bold text-nature-700">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-surface-900 dark:text-gray-100 truncate">{user?.name || t('User')}</p>
            <p className="text-xs text-surface-500 dark:text-gray-400 truncate">{user?.email || 'user@example.com'}</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-nature-900/10 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex h-full flex-col overflow-hidden">
        {/* Mobile drawer */}
        <motion.aside
          initial={false}
          animate={mobileOpen ? 'open' : 'closed'}
          variants={sidebarVariants}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 left-0 z-50 w-72 border-r border-nature-100 dark:border-surface-700 bg-white/95 dark:bg-surface-800/95 backdrop-blur-sm lg:hidden"
        >
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </motion.aside>

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-72 h-full border-r border-nature-100 dark:border-surface-700 bg-white/95 dark:bg-surface-800/95 backdrop-blur-sm flex-col overflow-hidden">
          <SidebarContent />
        </aside>
      </div>
    </>
  )
}
