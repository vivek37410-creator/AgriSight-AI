import { Outlet } from 'react-router-dom'
import { Sprout, Leaf } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function AuthLayout() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-nature-50 via-nature-100 to-leaf-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl gradient-nature shadow-lg shadow-nature-500/20">
            <Sprout className="h-8 w-8 text-white" />
            <div className="absolute -right-1 -top-1">
              <Leaf className="h-4 w-4 text-nature-200 animate-leaf-swing" />
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-nature-900">{t('AgriSight AI')}</h1>
          <p className="mt-1 text-sm text-nature-600">{t('From satellite data to smarter farming decisions.')}</p>
        </div>
        <div className="rounded-2xl border border-nature-100 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

