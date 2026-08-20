import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
  style?: React.CSSProperties
  animate?: boolean
  glass?: boolean
}

interface CardHeaderProps {
  children?: React.ReactNode
  className?: string
  action?: React.ReactNode
  title?: React.ReactNode
  subtitle?: string
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className, hover = true, gradient = false, style, animate = true, glass = false }: CardProps) {
  const Component = animate ? motion.div : 'div'

  return (
    <Component
      style={style}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-surface-200/80 dark:border-surface-700/60 bg-white/90 dark:bg-surface-800/90 shadow-soft backdrop-blur-sm',
        hover && 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1',
        gradient && 'bg-gradient-to-br from-nature-50/80 to-white dark:from-surface-700/80 dark:to-surface-800',
        glass && 'glass-card',
        className
      )}
      initial={animate ? { opacity: 0, y: 10 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={animate ? { duration: 0.4, ease: [0.16, 1, 0.3, 1] } : undefined}
    >
      {gradient && (
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-nature-100/40 to-transparent" />
      )}
      {children}
    </Component>
  )
}

export function CardHeader({ children, className, action, title, subtitle }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between border-b border-surface-100 dark:border-surface-700 px-6 py-4', className)}>
      <div className="flex-1">
        {title && <h3 className="text-base font-bold text-surface-900 dark:text-gray-100">{title}</h3>}
        {subtitle && <p className="text-sm text-surface-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  )
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('border-t border-surface-100 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-700/30 px-6 py-4', className)}>
      {children}
    </div>
  )
}
