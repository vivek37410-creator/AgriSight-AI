import React from 'react'
import { Leaf, Sprout, CloudRain, Sun, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface LeafLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  variant?: 'leaf' | 'sprout' | 'droplet' | 'sun' | 'default'
}

export default function LeafLoader({ size = 'md', text, variant = 'leaf' }: LeafLoaderProps) {
  const { t } = useTranslation()
  const displayText = text || t('Loading...')

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const renderIcon = () => {
    switch (variant) {
      case 'leaf':
        return (
          <div className={`${sizeClasses[size]} flex items-center justify-center`}>
            <Leaf className={`${iconSizes[size]} text-nature-500 animate-leaf-float`} />
          </div>
        )
      case 'sprout':
        return (
          <div className={`${sizeClasses[size]} flex items-center justify-center`}>
            <Sprout className={`${iconSizes[size]} text-nature-600 animate-plant-grow`} />
          </div>
        )
      case 'droplet':
        return (
          <div className={`${sizeClasses[size]} flex items-center justify-center`}>
            <CloudRain className={`${iconSizes[size]} text-sky-500 animate-droplet`} />
          </div>
        )
      case 'sun':
        return (
          <div className={`${sizeClasses[size]} flex items-center justify-center`}>
            <Sun className={`${iconSizes[size]} text-amber-500 animate-sun-spin`} />
          </div>
        )
      default:
        return (
          <Loader2 className={`${iconSizes[size]} text-nature-600 animate-spin`} />
        )
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {renderIcon()}
      {displayText && (
        <p className="text-sm text-surface-500 animate-pulse-soft">
          {displayText}
        </p>
      )}
    </div>
  )
}
