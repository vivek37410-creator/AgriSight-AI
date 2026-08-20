import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type Step = {
  target: string
  title: string
  description: string
  placement: 'top' | 'bottom' | 'left' | 'right'
}

const TOUR_STEPS: Step[] = [
  {
    target: 'tour-sidebar',
    title: 'Navigation Hub',
    description: 'Access all features from here: Dashboard, Farms, Leaf Doctor, Alerts, Assistant, and Settings.',
    placement: 'right',
  },
  {
    target: 'tour-hero',
    title: 'Your Command Center',
    description: 'Welcome back! Create new farms or view existing ones directly from your dashboard.',
    placement: 'bottom',
  },
  {
    target: 'tour-create-farm',
    title: 'Create Your First Farm',
    description: 'Click here to add a farm. You can set location, crop type, soil, and start monitoring instantly.',
    placement: 'bottom',
  },
  {
    target: 'tour-todays-plan',
    title: "Today's Farm Plan",
    description: 'AI-powered recommendations based on weather, alerts, and crop needs. Your daily action checklist.',
    placement: 'top',
  },
  {
    target: 'tour-farms-section',
    title: 'Your Farms',
    description: 'All your farms in one place. Click any farm card to view detailed analytics, satellite data, and recommendations.',
    placement: 'top',
  },
  {
    target: 'tour-alerts-section',
    title: 'Smart Alerts',
    description: 'Get notified about heavy rainfall, high temperatures, irrigation needs, and disease risks.',
    placement: 'left',
  },
  {
    target: 'tour-profile',
    title: 'Your Profile',
    description: 'Access your profile, settings, and account preferences from here.',
    placement: 'left',
  },
]

const STORAGE_KEY = 'agrisight_tour_completed'

export default function UserTour() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  const updateTargetRect = useCallback(() => {
    const step = TOUR_STEPS[currentStep]
    const el = document.querySelector(`[data-tour="${step.target}"]`)
    if (el) {
      setTargetRect(el.getBoundingClientRect())
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentStep])

  useEffect(() => {
    let attempts = 0
    const maxAttempts = 30
    const interval = setInterval(() => {
      attempts += 1
      const step = TOUR_STEPS[currentStep]
      const el = document.querySelector(`[data-tour="${step.target}"]`)
      if (el) {
        const rect = el.getBoundingClientRect()
        setTargetRect(rect)
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => {
          const newRect = el.getBoundingClientRect()
          setTargetRect(newRect)
        }, 350)
        clearInterval(interval)
      } else if (attempts >= maxAttempts) {
        clearInterval(interval)
      }
    }, 150)

    const handleResize = () => {
      const step = TOUR_STEPS[currentStep]
      const el = document.querySelector(`[data-tour="${step.target}"]`)
      if (el) {
        setTargetRect(el.getBoundingClientRect())
      }
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize, true)
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize, true)
    }
  }, [currentStep])

  const startTour = () => {
    setCurrentStep(0)
    setIsOpen(true)
  }

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      closeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }

  const closeTour = () => {
    setIsOpen(false)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  const hasCompleted = () => localStorage.getItem(STORAGE_KEY) === 'true'

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasCompleted()) {
        setIsOpen(true)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handler = () => {
      setCurrentStep(0)
      setIsOpen(true)
    }
    window.addEventListener('restart-tour', handler)
    return () => window.removeEventListener('restart-tour', handler)
  }, [])

  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    const step = TOUR_STEPS[currentStep]
    const gap = 16
    const tooltipWidth = 320
    const tooltipHeight = 200
    const padding = 16

    let top = targetRect.top + targetRect.height / 2
    let left = targetRect.right + gap
    let transform = 'translateY(-50%)'

    if (step.placement === 'bottom') {
      top = targetRect.bottom + gap
      left = targetRect.left + targetRect.width / 2
      transform = 'translateX(-50%)'
      if (top + tooltipHeight > window.innerHeight - padding) {
        top = targetRect.top - tooltipHeight - gap
        if (top < padding) top = padding
      }
    } else if (step.placement === 'top') {
      top = targetRect.top - tooltipHeight - gap
      left = targetRect.left + targetRect.width / 2
      transform = 'translateX(-50%)'
      if (top < padding) {
        top = targetRect.bottom + gap
        if (top + tooltipHeight > window.innerHeight - padding) top = padding
      }
    } else if (step.placement === 'left') {
      left = targetRect.left - tooltipWidth - gap
      top = targetRect.top + targetRect.height / 2
      transform = 'translateY(-50%)'
      if (left < padding) {
        left = targetRect.right + gap
        transform = 'translateY(-50%)'
      }
    } else if (step.placement === 'right') {
      left = targetRect.right + gap
      top = targetRect.top + targetRect.height / 2
      transform = 'translateY(-50%)'
      if (left + tooltipWidth > window.innerWidth - padding) {
        left = targetRect.left - tooltipWidth - gap
        if (left < padding) left = padding
      }
    }

    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding))
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding))

    return { top, left, transform }
  }

  const getArrowPosition = () => {
    if (!targetRect) return {}
    const step = TOUR_STEPS[currentStep]
    const arrowSize = 8
    const gap = 16
    switch (step.placement) {
      case 'top':
        if (targetRect.top - 200 < 16) {
          return { bottom: -arrowSize, left: '50%', transform: 'translateX(-50%) rotate(45deg)' }
        }
        return { bottom: -arrowSize, left: '50%', transform: 'translateX(-50%) rotate(45deg)' }
      case 'bottom':
        return { top: -arrowSize, left: '50%', transform: 'translateX(-50%) rotate(45deg)' }
      case 'left':
        if (targetRect.left - 320 < 16) {
          return { right: -arrowSize, top: '50%', transform: 'translateY(-50%) rotate(45deg)' }
        }
        return { right: -arrowSize, top: '50%', transform: 'translateY(-50%) rotate(45deg)' }
      case 'right':
        return { left: -arrowSize, top: '50%', transform: 'translateY(-50%) rotate(45deg)' }
      default:
        return {}
    }
  }

  const getHighlightStyle = (): React.CSSProperties => {
    if (!targetRect) return {}
    return {
      position: 'fixed',
      top: targetRect.top - 4,
      left: targetRect.left - 4,
      width: targetRect.width + 8,
      height: targetRect.height + 8,
      borderRadius: 12,
      pointerEvents: 'none',
      zIndex: 9998,
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    }
  }

  const step = TOUR_STEPS[currentStep]
  const tooltipPos = getTooltipPosition()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999]"
        >
          {targetRect && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={getHighlightStyle()}
              className="border-2 border-nature-400 rounded-xl"
            />
          )}

          <motion.div
            key={`tooltip-${currentStep}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={tooltipPos}
            className="fixed z-[10000] w-80 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 p-5"
          >
            <div
              className="absolute bg-white dark:bg-surface-800 border-b border-r border-surface-200 dark:border-surface-700"
              style={getArrowPosition()}
            >
              <div className="h-4 w-4" />
            </div>

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-nature">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-surface-900 dark:text-gray-100">{step.title}</h3>
              </div>
              <button
                onClick={closeTour}
                className="rounded-lg p-1 text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-surface-600 dark:text-gray-300 leading-relaxed mb-5">
              {step.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-400 font-medium">
                {currentStep + 1} / {TOUR_STEPS.length}
              </span>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-100 transition-colors"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Back
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1 rounded-lg px-4 py-1.5 text-xs font-medium text-white gradient-nature hover:shadow-md transition-all"
                >
                  {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-1">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i === currentStep
                      ? 'bg-nature-500'
                      : i < currentStep
                        ? 'bg-nature-300'
                        : 'bg-surface-200 dark:bg-surface-700'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function startTour() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('restart-tour'))
}

export function hasCompletedTour() {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}
