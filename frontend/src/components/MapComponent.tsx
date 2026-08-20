import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import SetMapView from './SetMapView'
import L from 'leaflet'

const SATELLITE_TILE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

interface MapComponentProps {
  center?: [number, number]
  zoom?: number
  height?: string
}

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default function MapComponent({
  center = [20.5937, 78.9629],
  zoom = 5,
  height = '400px',
}: MapComponentProps) {
  return (
    <div 
      className="relative overflow-hidden rounded-2xl border border-surface-200 shadow-sm"
      style={{ height, width: '100%' }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={SATELLITE_TILE}
        />
        <Marker position={center} icon={defaultIcon}>
          <Popup>Farm Location</Popup>
        </Marker>
        <SetMapView center={center} zoom={zoom} />
      </MapContainer>
    </div>
  )
}
