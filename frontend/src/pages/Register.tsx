import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sprout, Leaf } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { useAuth } from '../lib/auth'
import LeafLoader from '../components/LeafLoader'

export default function Register() {
  const navigate = useNavigate()
  const { register, loading } = useAuth()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await register(name, email, password)
      navigate('/')
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg || d.message || t('Validation error')).join(', '))
      } else {
        setError(detail || t('Registration failed'))
      }
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/login-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl gradient-nature shadow-lg shadow-nature-500/20">
            <Sprout className="h-8 w-8 text-white" />
            <div className="absolute -right-1 -top-1">
              <Leaf className="h-4 w-4 text-nature-200 animate-leaf-swing" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-nature-900 dark:text-nature-100">{t('Create an account')}</h2>
          <p className="mt-2 text-sm text-nature-600 dark:text-nature-300">
            {t('Already have an account?')} <Link to="/login" className="font-medium text-nature-700 hover:text-nature-800 dark:text-nature-400 dark:hover:text-nature-300">{t('Sign in')}</Link>
          </p>
        </div>
        <div className="rounded-2xl border border-nature-100 dark:border-nature-800 bg-white/90 dark:bg-surface-800/90 p-8 shadow-xl shadow-nature-500/10 backdrop-blur-sm">
          {error && <Alert variant="error" className="mb-6">{error}</Alert>}
          {loading ? (
            <LeafLoader size="md" text={t('Creating account...')} variant="sprout" />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input label={t('Full name')} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('John Doe')} required />
              <Input label={t('Email address')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('you@example.com')} required />
              <Input label={t('Password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              <Button type="submit" className="w-full" loading={loading}>{t('Sign up')}</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
