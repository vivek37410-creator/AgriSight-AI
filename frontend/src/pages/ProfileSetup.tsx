import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, CheckCircle2, Loader2, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { uploadProfilePhoto } from '../services/profile'
import { useAuth } from '../lib/auth'

export default function ProfileSetup() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.profile_completed) {
      navigate('/farms', { replace: true })
    }
  }, [user, navigate])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    setError(null)
    if (f) {
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload a photo to continue.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await uploadProfilePhoto(file)
      setUser({ ...user, profile_photo: res.photo_url, profile_completed: true } as any)
      navigate('/farms', { replace: true })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to upload photo. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (user?.profile_completed) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-nature shadow-lg"
              >
                <User className="h-8 w-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-surface-900">Welcome to AgriSight AI</h1>
              <p className="mt-2 text-sm text-surface-500">
                Let's set up your profile. Upload a photo to get started.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="flex h-48 w-full items-center justify-center rounded-2xl border-2 border-dashed border-surface-300 bg-surface-50 overflow-hidden"
              >
                {preview ? (
                  <img src={preview} alt="Profile preview" className="h-full w-full object-cover" />
                ) : (
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex flex-col items-center gap-3 text-surface-400"
                  >
                    <Camera className="h-12 w-12" />
                    <span className="text-sm">{t('Your profile photo')}</span>
                  </motion.div>
                )}
              </motion.div>

              <input
                id="profile-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="secondary"
                onClick={() => document.getElementById('profile-photo')?.click()}
                className="w-full flex items-center justify-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {preview ? 'Change Photo' : 'Upload Photo'}
              </Button>

              {file && (
                <p className="text-xs text-surface-500 text-center">{file.name}</p>
              )}

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 text-center"
                >
                  {error}
                </motion.p>
              )}

              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={!file}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {loading ? 'Uploading...' : 'Continue to Dashboard'}
              </Button>

              <p className="text-xs text-surface-400 text-center">
                Your photo is stored securely and used only for your profile.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
