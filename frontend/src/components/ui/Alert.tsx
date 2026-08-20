import React from 'react'
import { X, AlertTriangle, Info, CheckCircle, XCircle, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

interface AlertProps {
  title?: string
  children: React.ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error'
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

const variantConfig = {
  info: {
    container: 'bg-sky-50 border-sky-200 text-sky-800',
    icon: Info,
    iconClassName: 'text-sky-600',
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: CheckCircle,
    iconClassName: 'text-green-600',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: AlertTriangle,
    iconClassName: 'text-amber-600',
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: XCircle,
    iconClassName: 'text-red-600',
  },
}

export function Alert({
  title,
  children,
  variant = 'info',
  dismissible = false,
  onDismiss,
  className,
}: AlertProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4',
        config.container,
        className
      )}
    >
      <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', 
        variant === 'info' ? 'bg-sky-100' : 
        variant === 'success' ? 'bg-green-100' : 
        variant === 'warning' ? 'bg-amber-100' : 'bg-red-100'
      )}>
        <Icon className={cn('h-4 w-4', config.iconClassName)} />
      </div>
      <div className="flex-1">
        {title && <h4 className="mb-1 font-semibold">{title}</h4>}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="mt-0.5 shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
