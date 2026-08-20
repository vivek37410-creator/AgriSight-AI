import React from 'react'
import { cn } from '../../lib/utils'

interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn('w-full', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ value?: string; activeValue?: string; onValueChange?: (value: string) => void }>, {
            activeValue: value || defaultValue,
            onValueChange,
          })
        }
        return child
      })}
    </div>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
  activeValue?: string
  onValueChange?: (value: string) => void
}

export function TabsList({ children, className, activeValue, onValueChange }: TabsListProps) {
  return (
    <div className={cn('flex items-center gap-1 rounded-xl border border-surface-200 bg-surface-50 p-1', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ value?: string; isActive?: boolean; onSelect?: (value: string) => void }>, {
            isActive: activeValue === (child.props as { value?: string }).value,
            onSelect: onValueChange,
          })
        }
        return child
      })}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  isActive?: boolean
  onSelect?: (value: string) => void
}

export function TabsTrigger({ value, children, className, isActive, onSelect }: TabsTriggerProps) {
  return (
    <button
      onClick={() => onSelect?.(value)}
      className={cn(
        'flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200',
        isActive ? 'bg-white text-primary-700 shadow-sm' : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100/50',
        className
      )}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
  activeValue?: string
}

export function TabsContent({ value, children, className, activeValue }: TabsContentProps) {
  if (value !== activeValue) return null
  return <div className={cn('mt-4 animate-fade-in', className)}>{children}</div>
}
