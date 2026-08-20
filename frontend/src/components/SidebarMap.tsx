import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useFarms } from '../hooks/useFarms'
import { useTranslation } from 'react-i18next'
import { Maximize2, Minimize2, Search, Satellite } from 'lucide-react'
import { parseGeoJson, GeoJsonGeometry } from '../utils/geo'

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]
const SATELLITE_TILE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

function FitBounds({ bounds }: { bounds: [[number, number], [number, number]] | null }) {
  const map = useMap()
  if (!bounds) return null
  map.fitBounds(bounds, { padding: [20, 20], maxZoom: 16 })
  return null
}

function FlyTo({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap()
  map.flyTo([lat, lng], zoom, { duration: 1.5 })
  return null
}

interface FarmMarker {
  id: number
  name: string
  lat: number
  lng: number
  boundary: GeoJsonGeometry | null
}

interface FullscreenMapProps {
  markers: FarmMarker[]
  bounds: [[number, number], [number, number]] | null
  center: [number, number]
  search: string
  onSearchChange: (value: string) => void
  onClose: () => void
}

function FullscreenMap({ markers, bounds, center, search, onSearchChange, onClose }: FullscreenMapProps) {
  const { t } = useTranslation()
  const matchedFarm = useMemo(() => {
    if (!search.trim()) return null
    const q = search.trim().toLowerCase()
    return markers.find((m) => m.name.toLowerCase().includes(q)) || null
  }, [search, markers])

  const flyTarget = matchedFarm ? { lat: matchedFarm.lat, lng: matchedFarm.lng, zoom: 14 } : null

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-surface-900 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-surface-700 dark:text-gray-200">
          <Satellite className="h-4 w-4" />
          {t('Farm Map')}
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700"
        >
          <Minimize2 className="h-5 w-5" />
        </button>
      </div>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-surface-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('Search farm...')}
          className="w-full rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 pl-9 pr-3 py-2.5 text-base text-surface-900 dark:text-gray-100 placeholder:text-surface-400"
        />
      </div>
      <div className="flex-1 min-h-0 relative overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm">
        <MapContainer
          center={center}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer url={SATELLITE_TILE} />
          {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} zoom={flyTarget.zoom} />}
          {!flyTarget && <FitBounds bounds={bounds} />}
          {markers.map((m) => (
            <Marker key={m.id} position={[m.lat, m.lng] as [number, number]}>
              <Popup>
                <div className="text-xs">
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-surface-500">
                    {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
          {markers.map((m) =>
            m.boundary && m.boundary.type === 'Polygon' ? (
              <Polygon
                key={`b-${m.id}`}
                positions={(m.boundary.coordinates[0] as number[][]).map((c) => [c[1], c[0]] as [number, number])}
                pathOptions={{
                  color: '#16a34a',
                  weight: 2,
                  fillColor: '#16a34a',
                  fillOpacity: 0.15,
                }}
              />
            ) : null
          )}
        </MapContainer>
      </div>
      <div className="mt-2 px-1 text-xs text-surface-400">
        {markers.length} {t('farms')}
      </div>
    </div>
  )
}

export default function SidebarMap() {
  const { data: farms, isLoading } = useFarms()
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')

  const markers = useMemo(() => {
    if (!farms) return []
    return farms
      .filter((f) => f.latitude && f.longitude)
      .map((f) => ({
        id: f.id,
        name: f.name,
        lat: f.latitude as number,
        lng: f.longitude as number,
        boundary: parseGeoJson(f.boundary_geojson),
      }))
  }, [farms])

  const bounds: [[number, number], [number, number]] | null = useMemo(() => {
    if (markers.length === 0) return null
    const lats = markers.map((m) => m.lat)
    const lngs = markers.map((m) => m.lng)
    return [
      [Math.min(...lats), Math.min(...lngs)] as [number, number],
      [Math.max(...lats), Math.max(...lngs)] as [number, number],
    ]
  }, [markers])

  const center: [number, number] = markers.length > 0 ? [markers[0].lat, markers[0].lng] : DEFAULT_CENTER

  const matchedFarm = useMemo(() => {
    if (!search.trim()) return null
    const q = search.trim().toLowerCase()
    return markers.find((m) => m.name.toLowerCase().includes(q)) || null
  }, [search, markers])

  const flyTarget = matchedFarm ? { lat: matchedFarm.lat, lng: matchedFarm.lng, zoom: 10 } : null

  const sidebarMap = (
    <div className="mt-4 border-t border-surface-100 dark:border-surface-700 pt-4">
      <div className="flex items-center justify-between px-3 mb-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-gray-500">
          <Satellite className="h-3.5 w-3.5" />
          {t('Farm Map')}
        </div>
        <button
          onClick={() => setExpanded(true)}
          className="rounded-lg p-1 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700"
          title={t('Expand')}
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="px-2">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-surface-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search farm...')}
            className="w-full rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 pl-9 pr-3 py-2 text-sm text-surface-900 dark:text-gray-100 placeholder:text-surface-400"
          />
        </div>
        <div
          className="relative overflow-hidden rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm"
          style={{ height: '220px', width: '100%' }}
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-xs text-surface-400">
              {t('Loading map...')}
            </div>
          ) : markers.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-surface-400 px-4 text-center">
              {t('No farm locations to display. Add a farm with coordinates to see it here.')}
            </div>
          ) : (
            <MapContainer
              center={center}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer url={SATELLITE_TILE} />
              {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} zoom={flyTarget.zoom} />}
              {!flyTarget && <FitBounds bounds={bounds} />}
              {markers.map((m) => (
                <Marker key={m.id} position={[m.lat, m.lng] as [number, number]}>
                  <Popup>
                    <div className="text-xs">
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-surface-500">
                        {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {markers.map((m) =>
                m.boundary && m.boundary.type === 'Polygon' ? (
                  <Polygon
                    key={`b-${m.id}`}
                    positions={(m.boundary.coordinates[0] as number[][]).map((c) => [c[1], c[0]] as [number, number])}
                    pathOptions={{
                      color: '#16a34a',
                      weight: 2,
                      fillColor: '#16a34a',
                      fillOpacity: 0.15,
                    }}
                  />
                ) : null
              )}
            </MapContainer>
          )}
        </div>
        <div className="mt-2 px-1 text-[10px] text-surface-400">{markers.length} {t('farms')}</div>
      </div>
    </div>
  )

  return (
    <>
      {sidebarMap}
      {expanded &&
        createPortal(
          <FullscreenMap
            markers={markers}
            bounds={bounds}
            center={center}
            search={search}
            onSearchChange={setSearch}
            onClose={() => {
              setExpanded(false)
              setSearch('')
            }}
          />,
          document.body
        )}
    </>
  )
}
