import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Loader2, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '../lib/api'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface CityCrop {
  city: string
  state: string
  dominant_crop: string
  crop_distribution: string
  agricultural_information: string
  latitude?: number
  longitude?: number
}

const CROP_ICONS: Record<string, string> = {
  'Rice': '🌾',
  'Wheat': '🌿',
  'Cotton': '☁️',
  'Sugarcane': '🎋',
  'Maize': '🌽',
  'Soybean': '🫘',
  'Grapes': '🍇',
  'Orange': '🍊',
  'Vegetables': '🥬',
  'Groundnut': '🥜',
  'Tomato': '🍅',
  'Chickpea': '🟤',
  'Pigeon Pea': '🟡',
  'Chillies': '🌶️',
  'Cashew': '🥜',
  'Rubber': '🌳',
  'Coconut': '🥥',
  'Ragi': '🌾',
  'Mustard': '🌼',
  'Gram': '🟢',
  'Barley': '🌾',
  'Bajra': '🌾',
  'Jute': '🪢',
  'Tea': '🍵',
}

const MAHARASHTRA_CITY_COORDS: Record<string, [number, number]> = {
  'Mumbai': [19.076, 72.8777],
  'Pune': [18.5204, 73.8567],
  'Nashik': [19.9975, 73.7898],
  'Nagpur': [21.1458, 79.0882],
  'Kolhapur': [16.705, 74.2433],
  'Thane': [19.2183, 72.9781],
  'Aurangabad': [19.8762, 75.3453],
  'Navi Mumbai': [19.033, 73.0297],
  'Solapur': [17.6599, 75.9064],
  'Bhiwandi': [19.3002, 73.0633],
  'Amravati': [20.9374, 77.7796],
}

function CropIcon({ crop, size = 28 }: { crop: string; size?: number }) {
  const emoji = CROP_ICONS[crop] || '🌱'
  return (
    <div
      className="flex items-center justify-center rounded-full bg-white shadow-lg border-2 border-nature-200"
      style={{ width: size, height: size, fontSize: size * 0.6 }}
    >
      {emoji}
    </div>
  )
}

function CropMapIcon({ crop, city }: { crop: string; city: string }) {
  const emoji = CROP_ICONS[crop] || '🌱'
  return L.divIcon({
    className: 'crop-map-icon',
    html: `<div style="
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      background:white;border:2px solid #16a34a;border-radius:12px;
      padding:6px 10px;box-shadow:0 6px 16px rgba(0,0,0,0.35);min-width:70px;
      font-family:Inter,system-ui,sans-serif;
      z-index:1000;position:relative;
    ">
      <div style="font-size:26px;line-height:1;">${emoji}</div>
      <div style="font-size:11px;font-weight:700;color:#166534;margin-top:3px;white-space:nowrap;">${city}</div>
      <div style="font-size:10px;color:#15803d;white-space:nowrap;">${crop}</div>
    </div>`,
    iconSize: [90, 64],
    iconAnchor: [45, 32],
  })
}

function FitBounds({ cities }: { cities: CityCrop[] }) {
  const map = useMap()
  if (cities.length === 0) return null
  const bounds = cities.map(c => {
    const key = c.city
    const coord = MAHARASHTRA_CITY_COORDS[key] || [20.5937, 78.9629]
    return coord as [number, number]
  })
  map.fitBounds(bounds as [number, number][], { padding: [50, 50], maxZoom: 8 })
  return null
}

export default function DashboardCropMap() {
  const { t } = useTranslation()
  const [cities, setCities] = useState<CityCrop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/knowledge/city-crops')
        const all = res.data || []
        const filtered = all.filter((c: CityCrop) => c.state === 'Maharashtra')
        setCities(filtered)
      } catch (e) {
        console.error('Failed to load city crops', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const markers = useMemo(() => {
    return cities.map(city => {
      const key = city.city
      const coord = MAHARASHTRA_CITY_COORDS[key] || [20.5937, 78.9629]
      return { ...city, lat: coord[0], lng: coord[1] }
    }).filter(c => c.lat && c.lng)
  }, [cities])

  const icons = useMemo(() => {
    return markers.map(m => CropMapIcon({ crop: m.dominant_crop, city: m.city }))
  }, [markers])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-nature-600" />
            <p className="text-sm text-surface-500">{t('Loading map...')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title={t('Crop Map')}
        subtitle={t('Dominant crop across regions')}
        action={
          <div className="flex items-center gap-2 text-xs text-surface-500">
            <MapPin className="h-4 w-4" />
            {markers.length} {t('cities')}
          </div>
        }
      />
      <CardContent>
        <div className="relative overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm" style={{ height: '420px' }}>
          <MapContainer
            key={markers.length}
            center={[19.5, 74.0]}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            zoomControl={true}
            attributionControl={false}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <FitBounds cities={cities} />
            {markers.map((m, i) => (
              <Marker key={i} position={[m.lat, m.lng] as [number, number]} icon={icons[i]}>
                <Popup>
                  <div className="text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <CropIcon crop={m.dominant_crop} size={24} />
                      <p className="font-semibold text-surface-900">{m.dominant_crop}</p>
                    </div>
                    <p className="font-medium text-surface-800">{m.city}, {m.state}</p>
                    <p className="text-surface-500 mt-1 line-clamp-2">{m.crop_distribution}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  )
}
