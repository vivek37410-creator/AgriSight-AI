import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
  illustration?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  illustration,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-nature-200 bg-nature-50/50 p-12 text-center',
        className
      )}
    >
      {illustration || (Icon && (
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600"
        >
          <Icon className="h-8 w-8" />
        </motion.div>
      ))}
      <h3 className="mb-2 text-lg font-bold text-surface-900">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-surface-500 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
