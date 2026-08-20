import { useTranslation } from 'react-i18next'
import CityCropMap from '../components/CityCropMap'

export default function AgricultureMap() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-3xl gradient-nature p-6 md:p-8 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('Regional Agriculture Map')}</h1>
        <p className="mt-2 text-nature-100 text-sm md:text-base max-w-xl">
          {t('Explore crop distribution across cities')}
        </p>
      </div>
      <CityCropMap />
    </div>
  )
}
