import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'glass'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  icon?: React.ReactNode
  animate?: boolean
}

const variantStyles: Record<string, string> = {
  primary: 'bg-nature-600 text-white hover:bg-nature-700 shadow-sm shadow-nature-500/20 hover:shadow-md hover:shadow-nature-500/30',
  secondary: 'bg-surface-800 text-white hover:bg-surface-900 shadow-sm shadow-surface-500/20 hover:shadow-md',
  outline: 'border-2 border-nature-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-gray-100 hover:border-nature-300 hover:bg-nature-50 dark:hover:bg-surface-700',
  ghost: 'text-surface-600 dark:text-gray-300 hover:bg-surface-100 dark:hover:bg-surface-700 hover:text-surface-900 dark:hover:text-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/20 hover:shadow-md hover:shadow-red-500/30',
  success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-500/20 hover:shadow-md hover:shadow-green-500/30',
  glass: 'bg-white/80 dark:bg-surface-800/80 backdrop-blur-md border border-white/20 dark:border-surface-700/50 text-surface-800 dark:text-gray-100 hover:bg-white/90 dark:hover:bg-surface-800/90 shadow-sm',
}

const sizeStyles: Record<string, string> = {
  sm: 'h-8 px-3 text-xs font-semibold rounded-lg',
  md: 'h-10 px-4 text-sm font-semibold rounded-xl',
  lg: 'h-12 px-6 text-base font-semibold rounded-xl',
  icon: 'h-10 w-10 rounded-xl',
}

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  icon,
  animate = true,
  ...props
}: ButtonProps) {
  const Component = animate ? motion.button : 'button'

  return (
    <Component
      className={cn(
         'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300',
         'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nature-500 focus-visible:ring-offset-2',
         'disabled:pointer-events-none disabled:opacity-50',
         variantStyles[variant],
         sizeStyles[size],
         className
       )}
      disabled={disabled || loading}
      variants={animate ? buttonVariants : undefined}
      initial={animate ? 'initial' : undefined}
      whileHover={animate && !disabled ? 'hover' : undefined}
      whileTap={animate && !disabled ? 'tap' : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props as any}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!loading && icon}
      {children}
    </Component>
  )
}
