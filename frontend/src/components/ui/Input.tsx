import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { LucideIcon } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: LucideIcon
  helperText?: string
  animate?: boolean
}

export function Input({ label, error, helperText, icon: Icon, className, id, animate = true, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const InputComponent = animate ? motion.input : 'input'

  return (
    <div className="w-full">
      {label && (
        <motion.label
          htmlFor={inputId}
          initial={animate ? { opacity: 0, y: -5 } : undefined}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={animate ? { duration: 0.3 } : undefined}
          className="mb-1.5 block text-sm font-semibold text-surface-800 dark:text-gray-200"
        >
          {label}
        </motion.label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-2.5 h-4 w-4 text-surface-400 dark:text-gray-500" />
        )}
        <InputComponent
          id={inputId}
          className={cn(
            'flex h-11 w-full rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-700 px-4 py-2.5 text-sm text-surface-800 dark:text-gray-100 placeholder:text-surface-300 dark:placeholder:text-gray-500 transition-all duration-300',
            'focus:border-nature-500 focus:outline-none focus:ring-2 focus:ring-nature-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-50 dark:disabled:bg-surface-800',
            Icon && 'pl-10',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          initial={animate ? { opacity: 0, scale: 0.98 } : undefined}
          animate={animate ? { opacity: 1, scale: 1 } : undefined}
          transition={animate ? { duration: 0.3, delay: 0.1 } : undefined}
          {...props as any}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-xs text-surface-500 dark:text-gray-400">{helperText}</p>}
    </div>
  )
}
