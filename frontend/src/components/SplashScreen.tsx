import { useState, useEffect } from 'react'
import { Sprout, Leaf, Wheat } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'intro' | 'grow' | 'ready'>('intro')
  const { t } = useTranslation()

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('grow'), 800)
    const t2 = setTimeout(() => setPhase('ready'), 1600)
    const t3 = setTimeout(() => onComplete(), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-nature-900 via-nature-800 to-leaf-900">
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={
            phase === 'intro'
              ? { scale: [0.5, 1.1, 1], opacity: [0, 1, 1], rotate: [0, -5, 5, 0] }
              : { scale: 1, opacity: 1, rotate: 0 }
          }
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-nature-400 to-leaf-500 shadow-2xl shadow-nature-500/40"
        >
          <Sprout className="h-14 w-14 text-white" />
          <motion.div
            animate={{ y: [-4, 4, -4], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-3 -top-3"
          >
            <Leaf className="h-6 w-6 text-nature-200" />
          </motion.div>
          <motion.div
            animate={{ y: [4, -4, 4], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            className="absolute -left-3 -bottom-3"
          >
            <Wheat className="h-5 w-5 text-yellow-200" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: phase === 'grow' || phase === 'ready' ? 1 : 0, y: phase === 'grow' || phase === 'ready' ? 0 : 10 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('AgriSight AI')}</h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'ready' ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-2 text-sm text-nature-200"
          >
            {t('Smart Farming. Smarter Decisions.')}
          </motion.p>
        </motion.div>

        {phase === 'grow' && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
            className="mt-8 h-1 w-48 origin-left rounded-full bg-gradient-to-r from-nature-400 to-leaf-400"
          />
        )}
      </div>
    </div>
  )
}
