import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Story, CATEGORIES, User } from '../types';
import { MapPin, Plus, Loader2 } from 'lucide-react';

// Fix for default marker icon
const markerIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
const markerIconRetina = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Cute Marker Generator
const createCuteMarker = (story: Story, zoom: number) => {
  const cat = CATEGORIES.find(c => c.value === story.category) || CATEGORIES[4];
  const colorClass = story.color || cat.color; // Use custom color if available
  
  // Scale factor: at zoom 13, size is 1.
  const scale = Math.max(0.4, Math.min(2.5, Math.pow(1.15, zoom - 13)));
  const baseSize = 24 * scale;
  const ringSize = baseSize * 1.6;
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="relative flex items-center justify-center" style="width: ${ringSize}px; height: ${ringSize}px;">
        <div class="absolute inset-0 rounded-full ${colorClass} opacity-20 animate-pulse"></div>
        <div class="rounded-full ${colorClass} border-[3px] border-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] animate-in zoom-in duration-300 flex items-center justify-center overflow-hidden" 
             style="width: ${baseSize}px; height: ${baseSize}px;">
           ${story.image_url 
             ? `<img src="${story.image_url}" class="w-full h-full object-cover" />`
             : `<div class="w-2 h-2 bg-white rounded-full opacity-60"></div>`
           }
        </div>
        <div class="absolute -top-1 -right-1 rounded-full ${colorClass} border-2 border-white opacity-80 animate-ping"
             style="width: ${baseSize/3}px; height: ${baseSize/3}px;"></div>
      </div>
    `,
    iconSize: [ringSize, ringSize],
    iconAnchor: [ringSize/2, ringSize/2],
  });
};

// User Location Marker
const createUserMarker = (user: User | null, zoom: number) => {
  // Inverse scaling: Zoom out (smaller zoom value) -> Bigger marker
  // Base size at zoom 13 is 40px
  const scale = Math.pow(0.88, zoom - 13);
  const size = Math.max(24, Math.min(80, 40 * scale));
  
  return L.divIcon({
    className: 'user-location-icon',
    html: `
      <div class="relative flex items-center justify-center" style="width: ${size * 1.5}px; height: ${size * 1.5}px;">
        <div class="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
        <div class="rounded-full border-4 border-white shadow-2xl relative z-10 overflow-hidden bg-blue-500 flex items-center justify-center" 
             style="width: ${size}px; height: ${size}px;">
          ${user?.avatar_url 
            ? `<img src="${user.avatar_url}" class="w-full h-full object-cover" />`
            : `<div class="text-white font-black" style="font-size: ${size/2.5}px;">${user?.username?.[0]?.toUpperCase() || '?'}</div>`
          }
        </div>
        <div class="absolute -bottom-1 bg-blue-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg z-20 whitespace-nowrap border border-white">
          YOU
        </div>
      </div>
    `,
    iconSize: [size * 1.5, size * 1.5],
    iconAnchor: [size * 0.75, size * 0.75],
  });
};

interface StoryMapProps {
  stories: Story[];
  onMapClick: (lat: number, lng: number) => void;
  onStoryClick: (story: Story) => void;
  onStoryMove?: (story: Story, lat: number, lng: number) => void;
  centerOnStory?: Story | null;
  currentUser?: User | null;
}

function MapEvents({ onClick, onZoom }: { onClick: (lat: number, lng: number) => void, onZoom: (zoom: number) => void }) {
  const map = useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
    zoomend() {
      onZoom(map.getZoom());
    }
  });
  return null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.flyTo(center, 15, {
      duration: 1.5
    });
  }, [center, map]);
  return null;
}

export default function StoryMap({ stories, onMapClick, onStoryClick, onStoryMove, centerOnStory, currentUser }: StoryMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (centerOnStory) {
      setUserLocation([centerOnStory.lat, centerOnStory.lng]);
    }
  }, [centerOnStory]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        // Default to Taipei if geolocation fails
        setUserLocation([25.0330, 121.5654]);
      }
    );
  }, []);

  if (!userLocation) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#FFF9F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-orange-300 animate-spin"></div>
          <p className="text-xs font-black text-orange-200 uppercase tracking-widest">尋找你的位置...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={userLocation}
      zoom={13}
      className="h-full w-full z-0"
      scrollWheelZoom={true}
      zoomControl={false} // Hide default zoom control for cleaner look
    >
      {/* Cleaner, more minimal tile layer: CartoDB Voyager */}
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <MapEvents onClick={onMapClick} onZoom={setZoom} />
      {userLocation && <ChangeView center={userLocation} />}
      
      {userLocation && (
        <Marker position={userLocation} icon={createUserMarker(currentUser || null, zoom)}>
          <Popup>您的位置</Popup>
        </Marker>
      )}

      {stories.map((story) => (
        <Marker 
          key={story.id} 
          position={[story.lat, story.lng]}
          icon={createCuteMarker(story, zoom)}
          draggable={true}
          eventHandlers={{
            click: () => onStoryClick(story),
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              onStoryMove?.(story, position.lat, position.lng);
            }
          }}
        >
          <Popup className="cute-popup">
            <div className="p-2 min-w-[150px]">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${CATEGORIES.find(c => c.value === story.category)?.color || 'bg-orange-300'}`}></div>
                <h3 className="font-black text-orange-900 leading-tight">{story.title}</h3>
              </div>
              {story.image_url && (
                <div className="w-full aspect-video rounded-xl overflow-hidden mb-2 border border-orange-50">
                  <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                </div>
              )}
              <p className="text-xs text-orange-300 line-clamp-3 leading-relaxed mb-3 font-medium">{story.content}</p>
              <div className="flex items-center justify-between border-t border-orange-50 pt-2">
                <span className="text-[10px] font-bold text-orange-200">@{story.author}</span>
                <span className="text-[10px] text-orange-100 font-bold">{new Date(story.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Coordinates Display */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-orange-100 shadow-xl pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-orange-200 uppercase tracking-widest">目前座標</span>
            <span className="text-xs font-bold text-orange-900 tabular-nums">
              {userLocation ? `${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}` : '定位中...'}
            </span>
          </div>
        </div>
      </div>
    </MapContainer>
  );
}
