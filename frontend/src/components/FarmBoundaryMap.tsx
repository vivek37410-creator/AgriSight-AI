import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useTranslation } from 'react-i18next'
import { calculatePolygonAreaHectares, getPolygonBounds, getPolygonCenter, GeoJsonGeometry } from '../utils/geo'

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]
const SATELLITE_TILE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const POLYGON_STYLE: L.PathOptions = {
  color: '#16a34a',
  weight: 3,
  fillColor: '#16a34a',
  fillOpacity: 0.15,
  opacity: 0.9,
}
const VERTEX_OPTIONS: L.CircleMarkerOptions = {
  radius: 5,
  color: '#fff',
  fillColor: '#16a34a',
  fillOpacity: 1,
  weight: 2,
}
const PREVIEW_STYLE: L.PathOptions = {
  color: '#2563eb',
  weight: 2,
  dashArray: '6,4',
  opacity: 0.7,
}

interface FarmBoundaryMapProps {
  value?: string
  onChange?: (geojson: string | null) => void
  editable?: boolean
  height?: string
  center?: [number, number]
  zoom?: number
  showArea?: boolean
}

function LocateControl() {
  const map = useMap()
  const { t } = useTranslation()
  const markerRef = useRef<L.CircleMarker | null>(null)

  useEffect(() => {
    const LocateControl = L.Control.extend({
      options: { position: 'topright' },
      onAdd: () => {
        const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control-locate')
        btn.textContent = '📍'
        btn.title = t('My Location')
        btn.style.cssText =
          'width:38px;height:38px;cursor:pointer;background:#fff;border:none;border-radius:4px;font-size:20px;display:flex;align-items:center;justify-content:center;'
        L.DomEvent.disableClickPropagation(btn)
        L.DomEvent.on(btn, 'click', () => {
          if (!navigator.geolocation) {
            alert(t('Geolocation is not supported by your browser'))
            return
          }
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords
              const latlng: [number, number] = [latitude, longitude]
              map.flyTo(latlng, 15, { duration: 1.5 })
              if (markerRef.current) {
                markerRef.current.setLatLng(latlng)
              } else {
                markerRef.current = L.circleMarker(latlng, {
                  radius: 8,
                  color: '#2563eb',
                  fillColor: '#2563eb',
                  fillOpacity: 0.4,
                  weight: 3,
                }).addTo(map)
              }
            },
            (err) => {
              console.error('Geolocation error:', err)
              alert(t('Unable to retrieve your location. Please check your browser permissions.'))
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          )
        })
        return btn
      },
    })
    const control = new LocateControl()
    map.addControl(control)
    return () => {
      map.removeControl(control)
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
        markerRef.current = null
      }
    }
  }, [map, t])

  return null
}

function FitBounds({ bounds }: { bounds: [[number, number], [number, number]] | null }) {
  const map = useMap()
  useEffect(() => {
    if (!bounds) return
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 16 })
  }, [map, bounds])
  return null
}

function GeoJsonLayer({ geojson }: { geojson: string | null }) {
  const map = useMap()
  const layerRef = useRef<L.GeoJSON | null>(null)

  useEffect(() => {
    if (!geojson) return
    try {
      const obj = typeof geojson === 'string' ? JSON.parse(geojson) : geojson
      layerRef.current = L.geoJSON(obj, {
        style: { ...POLYGON_STYLE },
      }).addTo(map)
    } catch {
      // ignore invalid geojson
    }
    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
    }
  }, [map, geojson])

  return null
}

interface PolygonDrawToolbarProps {
  drawing: boolean
  geojson: string | null
  onChange: (geojson: string | null) => void
  onDrawingChange: (drawing: boolean) => void
  showArea: boolean
}

function PolygonDrawToolbar({ drawing, geojson, onChange, onDrawingChange, showArea }: PolygonDrawToolbarProps) {
  const map = useMap()
  const [points, setPoints] = useState<[number, number][]>([])
  const polygonRef = useRef<L.Polygon | null>(null)
  const previewRef = useRef<L.Polyline | null>(null)
  const markersRef = useRef<L.CircleMarker[]>([])
  const syncedRef = useRef<string | null>(null)
  const callbackRef = useRef(onChange)
  callbackRef.current = onChange
  const drawingRef = useRef(drawing)
  drawingRef.current = drawing

  const clearDrawing = () => {
    if (polygonRef.current) {
      map.removeLayer(polygonRef.current)
      polygonRef.current = null
    }
    if (previewRef.current) {
      map.removeLayer(previewRef.current)
      previewRef.current = null
    }
    markersRef.current.forEach((m) => map.removeLayer(m))
    markersRef.current = []
    setPoints([])
  }

  const emit = (geojsonString: string | null) => {
    syncedRef.current = geojsonString
    callbackRef.current(geojsonString)
  }

  const completePolygon = () => {
    if (points.length < 3) return
    const closed = [...points, points[0]]
    if (polygonRef.current) {
      map.removeLayer(polygonRef.current)
    }
    polygonRef.current = L.polygon(closed, POLYGON_STYLE).addTo(map)
    markersRef.current.forEach((m) => map.removeLayer(m))
    markersRef.current = []
    if (previewRef.current) {
      map.removeLayer(previewRef.current)
      previewRef.current = null
    }
    const geojsonString = JSON.stringify(polygonRef.current.toGeoJSON())
    emit(geojsonString)
    setPoints([])
    onDrawingChange(false)
  }

  const deletePolygon = () => {
    clearDrawing()
    emit(null)
    onDrawingChange(false)
  }

  useEffect(() => {
    if (!drawing) {
      clearDrawing()
      return
    }

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng]
      const newPoints = [...points, newPoint]
      setPoints(newPoints)

      const marker = L.circleMarker([e.latlng.lat, e.latlng.lng], VERTEX_OPTIONS).addTo(map)
      markersRef.current.push(marker)

      if (previewRef.current) {
        map.removeLayer(previewRef.current)
      }
      if (newPoints.length >= 2) {
        previewRef.current = L.polyline(newPoints, PREVIEW_STYLE).addTo(map)
      }

      if (newPoints.length >= 3) {
        const firstPoint = newPoints[0]
        const dist = map.distance([e.latlng.lat, e.latlng.lng], firstPoint)
        if (dist < 10) {
          completePolygon()
        }
      }
    }

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      if (points.length === 0) return
      if (previewRef.current) {
        map.removeLayer(previewRef.current)
      }
      const lastPoint = points[points.length - 1]
      previewRef.current = L.polyline([lastPoint, [e.latlng.lat, e.latlng.lng]], PREVIEW_STYLE).addTo(map)
    }

    map.on('click', handleMapClick)
    map.on('mousemove', handleMouseMove)

    return () => {
      map.off('click', handleMapClick)
      map.off('mousemove', handleMouseMove)
    }
  }, [map, drawing, points, completePolygon])

  useEffect(() => {
    if (!geojson) {
      clearDrawing()
      return
    }
    if (syncedRef.current === geojson) return
    try {
      const obj = typeof geojson === 'string' ? JSON.parse(geojson) : geojson
      const geom = (obj.geometry || obj) as GeoJsonGeometry
      if (geom.type === 'Polygon' && Array.isArray(geom.coordinates[0])) {
        const coords = geom.coordinates[0].map((c) => [c[1], c[0]] as [number, number])
        clearDrawing()
        polygonRef.current = L.polygon(coords, POLYGON_STYLE).addTo(map)
        syncedRef.current = geojson
      }
    } catch {
      syncedRef.current = geojson
    }
  }, [geojson, map])

  useEffect(() => {
    return () => {
      clearDrawing()
    }
  }, [map])

  return null
}

export default function FarmBoundaryMap({
  value,
  onChange,
  editable = false,
  height = '400px',
  center,
  zoom = 5,
  showArea = true,
}: FarmBoundaryMapProps) {
  const { t } = useTranslation()
  const [area, setArea] = useState<number | null>(null)
  const [drawing, setDrawing] = useState(false)
  const geojson = value ?? null
  const editableMode = editable && typeof onChange === 'function'

  useEffect(() => {
    if (showArea) {
      setArea(calculatePolygonAreaHectares(geojson))
    }
  }, [geojson, showArea])

  const initialCenter = center ?? getPolygonCenter(geojson) ?? DEFAULT_CENTER
  const initialZoom = center ? zoom : (geojson ? 14 : zoom)
  const bounds = getPolygonBounds(geojson)

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-surface-200 shadow-sm"
      style={{ height, width: '100%' }}
    >
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={editableMode}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={SATELLITE_TILE}
        />
        {!editableMode && geojson && <GeoJsonLayer geojson={geojson} />}
        {editableMode && (
          <PolygonDrawToolbar
            drawing={drawing}
            geojson={geojson}
            onChange={onChange!}
            onDrawingChange={setDrawing}
            showArea={showArea}
          />
        )}
        <LocateControl />
        <FitBounds bounds={bounds} />
      </MapContainer>

      {editableMode && (
        <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
          {!drawing ? (
            <button
              onClick={() => setDrawing(true)}
              className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-surface-800 shadow-md hover:bg-surface-50 border border-surface-200"
            >
              {geojson ? t('Redraw boundary') : t('Draw boundary')}
            </button>
          ) : (
            <>
              <div className="rounded-xl bg-white/90 px-3 py-2 text-xs font-medium text-surface-600 shadow-md border border-surface-200">
                {t('Click to add points. Click first point to close.')}
              </div>
              <button
                onClick={() => setDrawing(false)}
                className="rounded-xl bg-nature-600 px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-nature-700"
              >
                {t('Cancel')}
              </button>
            </>
          )}
        </div>
      )}

      {showArea && area !== null && (
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-xl bg-white/90 px-3 py-1.5 text-sm font-medium text-surface-800 shadow-md backdrop-blur"
        >
          {t('Farm area')}: <strong>{area.toFixed(2)} {t('ha')}</strong>
        </div>
      )}
    </div>
  )
}
