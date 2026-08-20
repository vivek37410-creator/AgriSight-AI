import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../lib/auth'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { Sun, Moon, Upload, Camera, PlayCircle } from 'lucide-react'
import { uploadProfilePhoto, updateProfile } from '../services/profile'
import { startTour } from '../components/UserTour'

export default function Settings() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, setUser, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const [name, setName] = useState(user?.name || '')
  const [saved, setSaved] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.profile_photo || null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    if (user?.profile_photo) {
      setPhotoPreview(user.profile_photo)
    }
  }, [user])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setPhotoFile(f)
    if (f) {
      const reader = new FileReader()
      reader.onload = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(f)
    }
  }

  const handlePhotoUpload = async () => {
    if (!photoFile) return
    setUploadingPhoto(true)
    try {
      const res = await uploadProfilePhoto(photoFile)
      setUser({ ...user, profile_photo: res.photo_url } as any)
      setPhotoFile(null)
    } catch (e) {
      console.error('Failed to upload photo', e)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSave = async () => {
    try {
      const updated = await updateProfile({ name })
      setUser(updated as any)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error('Failed to update profile', e)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('Settings')}</h1>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('Profile')}</h2>
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-nature-100 text-nature-700 overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-10 w-10" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="profile-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <Button
                variant="secondary"
                onClick={() => document.getElementById('profile-photo')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {photoFile ? 'Change Photo' : 'Upload Photo'}
              </Button>
              {photoFile && (
                <Button
                  onClick={handlePhotoUpload}
                  loading={uploadingPhoto}
                  size="sm"
                >
                  {uploadingPhoto ? 'Saving...' : 'Save Photo'}
                </Button>
              )}
            </div>
            {photoFile && (
              <p className="text-xs text-surface-500">{photoFile.name}</p>
            )}
          </div>
          <Input label={t('Name')} value={name} onChange={(e) => setName(e.target.value)} />
          <Input label={t('Email')} type="email" value={user?.email || ''} disabled />
          <Button onClick={handleSave}>{saved ? t('Saved!') : t('Save Changes')}</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('Tour')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Revisit the onboarding tour to learn about AgriSight AI features.</p>
          <Button variant="secondary" onClick={() => { navigate('/'); setTimeout(startTour, 500) }} className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            Replay Tour
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('Appearance')}</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('Theme')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('Choose your preferred color scheme')}</p>
            </div>
            <Button
              variant="secondary"
              onClick={toggle}
              className="flex items-center gap-2"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? t('Light Mode') : t('Dark Mode')}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('Account')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('Role:')}{user?.role || 'user'}</p>
          <Button variant="danger" onClick={logout}>{t('Logout')}</Button>
        </CardContent>
      </Card>
    </div>
  )
}