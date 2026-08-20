import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'low' | 'moderate' | 'high' | 'info' | 'primary'
  className?: string
  icon?: React.ReactNode
  animate?: boolean
}

const variantStyles: Record<string, string> = {
  default: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
}

export function Badge({ children, variant = 'default', className, icon, animate = true }: BadgeProps) {
  const Component = animate ? motion.span : 'span'

  return (
    <Component
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        variantStyles[variant],
        className
      )}
      initial={animate ? { opacity: 0, scale: 0.8 } : undefined}
      animate={animate ? { opacity: 1, scale: 1 } : undefined}
      transition={animate ? { duration: 0.3, ease: [0.16, 1, 0.3, 1] } : undefined}
    >
      {icon && <span className="h-3 w-3">{icon}</span>}
      {children}
    </Component>
  )
}
