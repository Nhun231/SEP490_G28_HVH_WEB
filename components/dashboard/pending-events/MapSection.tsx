import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icon for leaflet in Next.js/react-leaflet
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Props for MapSection: all required to match usage in detail.tsx
interface MapSectionProps {
  lat: number;
  lng: number;
  popupText: string;
}

export default function MapSection({ lat, lng, popupText }: MapSectionProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      style={{ height: '400px', width: '100%', zIndex: 1 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={[lat, lng]} icon={markerIcon}>
        {popupText && <Popup>{popupText}</Popup>}
      </Marker>
      {/* Example: Circle around marker */}
      <Circle center={[lat, lng]} radius={200} color="blue" />
    </MapContainer>
  );
}
