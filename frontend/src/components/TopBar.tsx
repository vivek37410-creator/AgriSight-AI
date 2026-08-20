import { Search, Bell, Menu, Globe } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { useAuth } from '../lib/auth'
import { setLanguage, Language } from '../i18n'

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
]

export default function TopBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const { t, i18n: i18nInstance } = useTranslation()
  const current = (i18nInstance.language as Language) || 'en'

  const handleLanguage = (lng: Language) => {
    setLanguage(lng)
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-nature-100 dark:border-nature-800 bg-white/80 dark:bg-surface-800/80 px-4 md:px-6 backdrop-blur-md shadow-sm shadow-nature-500/5"
    >
      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="lg:hidden rounded-lg p-2 text-surface-600 dark:text-gray-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </motion.button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-surface-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder={t('Search farms, alerts, analytics...')}
            className="h-10 w-80 rounded-xl border border-nature-200 dark:border-nature-700 bg-nature-50/80 dark:bg-nature-900/40 pl-10 pr-4 text-sm text-surface-800 dark:text-gray-100 placeholder:text-nature-400 dark:placeholder:text-nature-500 focus:border-nature-500 focus:outline-none focus:ring-2 focus:ring-nature-500/20 transition-all duration-300"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1 rounded-xl bg-nature-50/80 dark:bg-nature-900/40 p-1 border border-nature-100 dark:border-nature-800">
          <Globe className="h-4 w-4 text-nature-500 dark:text-nature-400 ml-1.5" />
          {LANGUAGES.map((lng) => (
            <motion.button
              key={lng.code}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLanguage(lng.code)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                current === lng.code
                  ? 'bg-nature-600 text-white shadow-md shadow-nature-500/20'
                  : 'text-nature-700 dark:text-nature-300 hover:text-nature-900 dark:hover:text-nature-100 hover:bg-nature-100 dark:hover:bg-nature-800'
              }`}
              title={lng.label}
            >
              {lng.label}
            </motion.button>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative rounded-xl p-2 text-nature-600 dark:text-nature-300 hover:bg-nature-100 dark:hover:bg-nature-800 transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-surface-800 animate-pulse-soft" />
        </motion.button>
        <div className="hidden md:flex items-center gap-3 pl-2 border-l border-nature-200 dark:border-nature-700">
          {user?.profile_photo ? (
            <img src={user.profile_photo} alt="Profile" className="h-9 w-9 rounded-xl object-cover border border-nature-200 dark:border-nature-700" />
          ) : (
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-nature-100 text-sm font-bold text-nature-700"
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </motion.div>
          )}
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-surface-900 dark:text-gray-100">{user?.name || t('User')}</p>
            <p className="text-xs text-surface-500 dark:text-gray-400">{t('Farmer')}</p>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
