import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sprout, Map, Crop, Calendar, Layers, Droplets, CheckCircle2, ChevronRight, Upload, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { createFarm, uploadFarmPhoto } from '../services/farms'
import { SOIL_TYPES, IRRIGATION_TYPES, CROPS } from '../utils/constants'
import FarmBoundaryMap from '../components/FarmBoundaryMap'

const steps = [
  { id: 0, key: 'Name', icon: Sprout },
  { id: 1, key: 'Crop', icon: Crop },
  { id: 2, key: 'Sowing', icon: Calendar },
  { id: 3, key: 'Soil', icon: Layers },
  { id: 4, key: 'Irrigation', icon: Droplets },
  { id: 5, key: 'Boundary', icon: Map },
  { id: 6, key: 'Photo', icon: Upload },
]

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 20 : -20,
    opacity: 0,
  }),
}

export default function FarmCreate() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    crop_id: undefined as number | undefined,
    sowing_date: '',
    soil_type: '',
    irrigation_type: '',
    boundary_geojson: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    photo_url: '',
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const update = (field: string, value: string | number | undefined) => setForm({ ...form, [field]: value })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setPhotoFile(f)
    if (f) {
      const reader = new FileReader()
      reader.onload = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(f)
    } else {
      setPhotoPreview(null)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      let photo_url = form.photo_url
      if (photoFile) {
        setUploadingPhoto(true)
        const uploaded = await uploadFarmPhoto(photoFile)
        photo_url = uploaded.photo_url
        setUploadingPhoto(false)
      }
      const data = { ...form, photo_url }
      const result = await createFarm(data)
      const farmId = result.farm.id
      navigate(`/farms/${farmId}`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setUploadingPhoto(false)
    }
  }

  const nextStep = () => {
    setDirection(1)
    setStep((s) => Math.min(steps.length - 1, s + 1))
  }

  const prevStep = () => {
    setDirection(-1)
    setStep((s) => Math.max(0, s - 1))
  }

  const canProceed = () => {
    switch (step) {
      case 0: return form.name.trim().length > 0
      case 1: return form.crop_id !== undefined
      case 2: return form.sowing_date.trim().length > 0
      case 3: return form.soil_type.trim().length > 0
      case 4: return form.irrigation_type.trim().length > 0
      case 5: return form.boundary_geojson.trim().length > 0
      case 6: return true
      default: return false
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            key="step-0"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <div>
              <h2 className="text-lg font-semibold text-surface-900 mb-1">{t('Farm Name')}</h2>
              <p className="text-sm text-surface-500">{t('Give your farm a memorable name.')}</p>
            </div>
            <Input
              label={t('Farm Name')}
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder={t('e.g., Green Valley Wheat Farm')}
              icon={Sprout}
              autoFocus
            />
            <Input
              label={t('Description (optional)')}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder={t('Brief description of your farm')}
            />
          </motion.div>
        )
      case 1:
        return (
          <motion.div
            key="step-1"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <div>
              <h2 className="text-lg font-semibold text-surface-900 mb-1">{t('Select Crop')}</h2>
              <p className="text-sm text-surface-500">{t("Choose the primary crop you're growing.")}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CROPS.map((crop, i) => (
                <motion.button
                  key={crop.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => update('crop_id', crop.id)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    form.crop_id === crop.id
                      ? 'border-nature-500 bg-nature-50 shadow-md shadow-nature-500/10'
                      : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 ${
                    form.crop_id === crop.id ? 'bg-nature-100 text-nature-700 scale-110' : 'bg-surface-100 text-surface-600'
                  }`}>
                    <Crop className="h-5 w-5" />
                  </div>
                  <span className={`font-medium transition-colors duration-200 ${form.crop_id === crop.id ? 'text-nature-900' : 'text-surface-700'}`}>
                    {crop.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div
            key="step-2"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <div>
              <h2 className="text-lg font-semibold text-surface-900 mb-1">{t('Sowing Date')}</h2>
              <p className="text-sm text-surface-500">{t('When did you plant this crop?')}</p>
            </div>
            <Input
              label={t('Sowing Date')}
              type="date"
              value={form.sowing_date}
              onChange={(e) => update('sowing_date', e.target.value)}
              icon={Calendar}
              autoFocus
            />
          </motion.div>
        )
      case 3:
        return (
          <motion.div
            key="step-3"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <div>
              <h2 className="text-lg font-semibold text-surface-900 mb-1">{t('Soil Type')}</h2>
              <p className="text-sm text-surface-500">{t('What type of soil dominates your farm?')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SOIL_TYPES.map((soil, i) => (
                <motion.button
                  key={soil}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => update('soil_type', soil)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    form.soil_type === soil
                      ? 'border-nature-500 bg-nature-50 shadow-md shadow-nature-500/10'
                      : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 ${
                    form.soil_type === soil ? 'bg-nature-100 text-nature-700 scale-110' : 'bg-surface-100 text-surface-600'
                  }`}>
                    <Layers className="h-5 w-5" />
                  </div>
                  <span className={`font-medium transition-colors duration-200 ${form.soil_type === soil ? 'text-nature-900' : 'text-surface-700'}`}>
                    {soil}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )
      case 4:
        return (
          <motion.div
            key="step-4"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <div>
              <h2 className="text-lg font-semibold text-surface-900 mb-1">{t('Irrigation Type')}</h2>
              <p className="text-sm text-surface-500">{t('How do you irrigate your farm?')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {IRRIGATION_TYPES.map((type, i) => (
                <motion.button
                  key={type}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => update('irrigation_type', type)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    form.irrigation_type === type
                      ? 'border-nature-500 bg-nature-50 shadow-md shadow-nature-500/10'
                      : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 ${
                    form.irrigation_type === type ? 'bg-nature-100 text-nature-700 scale-110' : 'bg-surface-100 text-surface-600'
                  }`}>
                    <Droplets className="h-5 w-5" />
                  </div>
                  <span className={`font-medium transition-colors duration-200 ${form.irrigation_type === type ? 'text-nature-900' : 'text-surface-700'}`}>
                    {type}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )
      case 5:
        return (
          <motion.div
            key="step-5"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <div>
              <h2 className="text-lg font-semibold text-surface-900 mb-1">{t('Boundary')}</h2>
              <p className="text-sm text-surface-500">{t('Draw your farm boundary on the map. This enables satellite data for your exact location.')}</p>
            </div>
            <FarmBoundaryMap
              value={form.boundary_geojson || undefined}
              onChange={(geojson) => update('boundary_geojson', geojson ?? '')}
              editable
              height="320px"
            />
            <div className="rounded-xl bg-nature-50 border border-nature-100 p-4">
              <p className="text-xs text-nature-800">
                <strong>{t('How it works')}:</strong> {t('Click "Draw Polygon", click around your farm boundary, then click the starting point to close it. Use the edit and trash icons to refine or remove the boundary. The calculated area and GeoJSON are saved automatically.')}
              </p>
            </div>
          </motion.div>
        )
      case 6:
        return (
          <motion.div
            key="step-6"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <div>
              <h2 className="text-lg font-semibold text-surface-900 mb-1">{t('Farm Photo')}</h2>
              <p className="text-sm text-surface-500">{t('Upload a photo of your farm. This helps us identify which plants are growing in each area.')}</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="flex h-40 w-full items-center justify-center rounded-2xl border-2 border-dashed border-surface-300 bg-surface-50 overflow-hidden"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Farm preview" className="h-full w-full object-cover" />
                ) : (
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex flex-col items-center gap-2 text-surface-400"
                  >
                    <ImageIcon className="h-10 w-10" />
                    <span className="text-xs">{t('No photo selected')}</span>
                  </motion.div>
                )}
              </motion.div>
              <input
                id="farm-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <Button
                variant="secondary"
                onClick={() => document.getElementById('farm-photo')?.click()}
                className="flex items-center gap-2 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <Upload className="h-4 w-4" />
                {photoPreview ? t('Change Photo') : t('Upload Photo')}
              </Button>
              {photoFile && (
                <p className="text-xs text-surface-500">{photoFile.name}</p>
              )}
            </div>
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-surface-900">{t('Create New Farm')}</h1>
        <p className="mt-1 text-sm text-surface-500">{t('Set up your farm to start monitoring with satellite data.')}</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all duration-500 ${
                i <= step
                  ? 'border-nature-500 bg-nature-50 text-nature-700 shadow-md shadow-nature-500/10'
                  : 'border-surface-200 bg-surface-50 text-surface-400'
              }`}>
                {i < step ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-nature-600" />
                  </motion.div>
                ) : (
                  <s.icon className="h-4 w-4" />
                )}
              </div>
              <span className={`text-[11px] font-medium hidden sm:block transition-colors duration-300 ${
                i <= step ? 'text-nature-700' : 'text-surface-400'
              }`}>{t(s.key)}</span>
            </motion.div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-8 sm:w-12 rounded-full transition-all duration-500 ${
                i < step ? 'bg-nature-500' : 'bg-surface-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {renderStepContent()}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-surface-100">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 0}
              className="hover:bg-surface-100 transition-colors duration-200"
            >
              {t('Back')}
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={nextStep} disabled={!canProceed()} className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                {t('Next')} <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading || uploadingPhoto} disabled={!canProceed() || uploadingPhoto} className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                <Sprout className="mr-2 h-4 w-4" /> {t('Create Farm')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
