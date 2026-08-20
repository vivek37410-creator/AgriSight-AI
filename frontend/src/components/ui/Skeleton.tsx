import React from 'react'
import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  shimmer?: boolean
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  shimmer = true,
}: SkeletonProps) {
  const baseStyles = shimmer
    ? 'bg-gradient-to-r from-surface-200 via-surface-100 to-surface-200 bg-[length:200%_100%] animate-shimmer'
    : 'animate-pulse bg-surface-200'

  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={style}
    />
  )
}

interface SkeletonGroupProps {
  count?: number
  className?: string
  children: React.ReactNode
}

export function SkeletonGroup({ count = 1, className, children }: SkeletonGroupProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-stagger-fade-in"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
