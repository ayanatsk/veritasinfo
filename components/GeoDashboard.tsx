
import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Globe, TrendingUp, Users } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { translations } from '../utils/translations';
import { Language } from '../types';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem',
};

const center = {
  lat: 20,
  lng: 0,
};

// Dark style for the map
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const mockTrendData = [
  { name: 'Mo', fakes: 400 },
  { name: 'Tu', fakes: 300 },
  { name: 'We', fakes: 600 },
  { name: 'Th', fakes: 800 },
  { name: 'Fr', fakes: 500 },
  { name: 'Sa', fakes: 900 },
  { name: 'Su', fakes: 750 },
  { name: 'Mo', fakes: 400 },
];

const mockHotspots = [
  { id: 1, lat: 40.7128, lng: -74.0060, intensity: "High" }, // New York
  { id: 2, lat: 51.5074, lng: -0.1278, intensity: "Critical" }, // London
  { id: 3, lat: 35.6762, lng: 139.6503, intensity: "Medium" }, // Tokyo
  { id: 4, lat: -33.8688, lng: 151.2093, intensity: "Low" }, // Sydney
];

export const GeoDashboard: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].geo;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const mapOptions = useMemo(() => ({
    styles: darkMapStyle,
    disableDefaultUI: true,
    zoomControl: true,
  }), []);

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-guard-800 p-6 rounded-2xl border border-guard-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-lg text-red-400">
              <TrendingUp />
            </div>
            <div>
              <p className="text-guard-gray text-sm">{t.active}</p>
              <h3 className="text-2xl font-bold text-white">124</h3>
            </div>
          </div>
        </div>
        <div className="bg-guard-800 p-6 rounded-2xl border border-guard-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-guard-cyan/20 rounded-lg text-guard-cyan">
              <Users />
            </div>
            <div>
              <p className="text-guard-gray text-sm">{t.protected}</p>
              <h3 className="text-2xl font-bold text-white">45.2k</h3>
            </div>
          </div>
        </div>
        <div className="bg-guard-800 p-6 rounded-2xl border border-guard-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
              <Globe />
            </div>
            <div>
              <p className="text-guard-gray text-sm">{t.risk}</p>
              <h3 className="text-2xl font-bold text-white">{t.riskLevel}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Real Google Map Visualization */}
        <div className="bg-guard-800 border border-guard-700 rounded-2xl p-6 h-[400px] flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6">{t.mapTitle}</h3>
          <div className="relative w-full flex-1 bg-guard-900 rounded-xl overflow-hidden border border-guard-700">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={2}
                options={mapOptions}
              >
                {mockHotspots.map((spot) => (
                  <Marker
                    key={spot.id}
                    position={{ lat: spot.lat, lng: spot.lng }}
                    title={spot.intensity}
                  />
                ))}
              </GoogleMap>
            ) : (
              <div className="flex items-center justify-center h-full text-guard-gray animate-pulse">
                Loading Google Maps...
              </div>
            )}
            <div className="absolute bottom-4 right-4 bg-guard-900/80 p-2 rounded text-xs text-gray-400 backdrop-blur z-10 pointer-events-none">
              {t.mapNote}
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-guard-800 border border-guard-700 rounded-2xl p-6 h-[400px] flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6">{t.chartTitle}</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient id="colorFakes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151E32', borderColor: '#2A3650', color: '#fff' }}
                  itemStyle={{ color: '#00F0FF' }}
                />
                <Area type="monotone" dataKey="fakes" stroke="#00F0FF" fillOpacity={1} fill="url(#colorFakes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};