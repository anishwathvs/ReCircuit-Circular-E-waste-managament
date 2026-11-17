import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Navigation, Truck, ShieldCheck, CheckCircle2, Clock, 
  MapPin, ExternalLink, RefreshCw, Layers, ZoomIn, ZoomOut, Compass 
} from 'lucide-react';
import { api } from '../services/api';

interface PickupPin {
  id: string;
  requestId: string;
  customId: string;
  device: string;
  category: string;
  status: string;
  timeSlot: string;
  locality: string;
  city: string;
  lat: number;
  lng: number;
  assignedAgentName: string | null;
  assignedAgentPhone: string | null;
  routeStopIndex: number;
}

interface AgentPin {
  id: string;
  employeeId: string;
  name: string;
  phone: string;
  serviceArea: string;
  lat: number;
  lng: number;
  rating: number;
  completedPickups: number;
  currentVehicle: string;
}

interface LocationMapViewProps {
  title?: string;
  filterMode?: 'ALL' | 'PENDING' | 'ASSIGNED';
  compact?: boolean;
}

export const LocationMapView: React.FC<LocationMapViewProps> = ({
  title = 'Chennai Metropolitan Fleet & Doorstep Mapping',
  filterMode = 'ALL',
  compact = false,
}) => {
  const [pickupPins, setPickupPins] = useState<PickupPin[]>([]);
  const [agentPins, setAgentPins] = useState<AgentPin[]>([]);
  const [selectedPin, setSelectedPin] = useState<PickupPin | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ASSIGNED'>(filterMode);
  const [loading, setLoading] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Fetch geographic data
  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await api.getMapLocations();
      setPickupPins(data.pickupPins || []);
      setAgentPins(data.agentPins || []);
      if (data.pickupPins?.length > 0) {
        setSelectedPin(data.pickupPins[0]);
      }
    } catch (err) {
      console.error('Failed to load map locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  // Filtered pins
  const filteredPins = pickupPins.filter((pin) => {
    if (filter === 'PENDING') return pin.status === 'PENDING';
    if (filter === 'ASSIGNED') return pin.status === 'ASSIGNED' || pin.status === 'IN_PROGRESS';
    return true;
  });

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [13.0067, 80.2206], // Chennai Metropolitan Center
        zoom: 12,
        zoomControl: false, // Custom position
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | ReCircuit Fleet Engine',
        maxZoom: 18,
      }).addTo(map);

      // Add Zoom control at top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers, route polyline and popups whenever data or filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    const boundsPoints: [number, number][] = [];

    // 1. Render Agent Markers (EV Fleet Vans)
    agentPins.forEach((agent) => {
      boundsPoints.push([agent.lat, agent.lng]);

      const agentIcon = L.divIcon({
        className: 'reciruit-agent-marker',
        html: `
          <div style="
            position: relative;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              position: absolute;
              inset: -4px;
              border-radius: 9999px;
              background-color: #22C55E;
              opacity: 0.35;
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></span>
            <div style="
              width: 38px;
              height: 38px;
              background-color: #084D36;
              border: 3px solid #FFFFFF;
              box-shadow: 0 4px 12px rgba(8, 77, 54, 0.4);
              border-radius: 9999px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFFFFF;
            ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <div style="
              position: absolute;
              bottom: -18px;
              left: 50%;
              transform: translateX(-50%);
              background: #084D36;
              color: #FFFFFF;
              font-size: 10px;
              font-weight: 700;
              padding: 1px 6px;
              border-radius: 6px;
              white-space: nowrap;
              border: 1px solid rgba(255,255,255,0.4);
              box-shadow: 0 2px 4px rgba(0,0,0,0.15);
            ">
              ${agent.name.split(' ')[0]} (EV Van)
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -24],
      });

      const popupContent = `
        <div style="font-family: Inter, system-ui, sans-serif; padding: 4px; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: #084D36; text-transform: uppercase;">ReCircuit Fleet Vehicle</span>
            <span style="background: #EBF8E9; color: #084D36; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Electric EV</span>
          </div>
          <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #151A17;">${agent.name}</h4>
          <p style="margin: 2px 0 8px 0; font-size: 11px; color: #6B756E;">Zone: <strong>${agent.serviceArea}</strong></p>
          <div style="font-size: 11px; color: #374151; background: #F8FAF7; padding: 6px 8px; border-radius: 8px; border: 1px solid #E5EBE5;">
            <div>Employee ID: <strong>${agent.employeeId}</strong></div>
            <div>Phone: <strong>${agent.phone}</strong></div>
            <div>Completed Pickups: <strong>${agent.completedPickups}</strong></div>
          </div>
        </div>
      `;

      const marker = L.marker([agent.lat, agent.lng], { icon: agentIcon });
      marker.bindPopup(popupContent);
      markersLayer.addLayer(marker);
    });

    // 2. Render Pickup Stops
    const routeCoords: [number, number][] = [];
    if (agentPins.length > 0) {
      routeCoords.push([agentPins[0].lat, agentPins[0].lng]);
    }

    filteredPins.forEach((pin, idx) => {
      boundsPoints.push([pin.lat, pin.lng]);
      if (pin.status === 'ASSIGNED' || pin.status === 'IN_PROGRESS') {
        routeCoords.push([pin.lat, pin.lng]);
      }

      const isPending = pin.status === 'PENDING';
      const isSelected = selectedPin?.id === pin.id;
      const markerColor = isPending ? '#F59E0B' : '#084D36';
      const labelColor = isPending ? '#B45309' : '#084D36';

      const pickupIcon = L.divIcon({
        className: 'reciruit-pickup-marker',
        html: `
          <div style="
            position: relative;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s;
            ${isSelected ? 'transform: scale(1.2);' : ''}
          ">
            <div style="
              width: 32px;
              height: 32px;
              background-color: ${markerColor};
              border: 2.5px solid #FFFFFF;
              box-shadow: 0 4px 10px rgba(0,0,0,0.25);
              border-radius: 9999px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFFFFF;
              font-weight: 800;
              font-size: 12px;
            ">
              ${idx + 1}
            </div>
            <div style="
              position: absolute;
              bottom: -18px;
              left: 50%;
              transform: translateX(-50%);
              background: #FFFFFF;
              color: ${labelColor};
              font-size: 10px;
              font-weight: 800;
              padding: 1px 6px;
              border-radius: 6px;
              white-space: nowrap;
              border: 1px solid #E5EBE5;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">
              ${pin.locality}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });

      const gmapsLink = `https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`;

      const popupContent = `
        <div style="font-family: Inter, system-ui, sans-serif; padding: 6px; min-width: 240px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; color: #6B756E; font-family: monospace;">${pin.requestId}</span>
            <span style="
              background-color: ${isPending ? '#FEF3C7' : '#EBF8E9'};
              color: ${isPending ? '#92400E' : '#084D36'};
              font-size: 10px;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 6px;
            ">
              ${pin.status}
            </span>
          </div>

          <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #151A17;">${pin.device}</h4>
          <p style="margin: 2px 0 6px 0; font-size: 11px; color: #6B756E;">Category: <strong>${pin.category}</strong></p>

          <div style="background: #F8FAF7; padding: 8px; border-radius: 8px; border: 1px solid #E5EBE5; margin-bottom: 10px; font-size: 11px;">
            <div style="color: #374151; margin-bottom: 2px;">📍 Locality: <strong>${pin.locality}, Chennai</strong></div>
            <div style="color: #6B756E; margin-bottom: 2px;">⏰ Slot: <strong>${pin.timeSlot}</strong></div>
            ${pin.assignedAgentName ? `<div style="color: #084D36;">🚚 Assigned Agent: <strong>${pin.assignedAgentName}</strong></div>` : ''}
          </div>

          <a 
            href="${gmapsLink}" 
            target="_blank" 
            rel="noopener noreferrer" 
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              width: 100%;
              padding: 7px 12px;
              background-color: #084D36;
              color: #FFFFFF;
              font-size: 11px;
              font-weight: 700;
              text-decoration: none;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(8, 77, 54, 0.2);
            "
          >
            <span>Navigate with Google Maps</span>
            <span>↗</span>
          </a>
        </div>
      `;

      const marker = L.marker([pin.lat, pin.lng], { icon: pickupIcon });
      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setSelectedPin(pin);
      });
      markersLayer.addLayer(marker);
    });

    // 3. Render Route Polyline connecting fleet vehicle to assigned stops
    if (routeCoords.length >= 2) {
      const polyline = L.polyline(routeCoords, {
        color: '#16834D',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);
      routeLayerRef.current = polyline;
    }

    // Fit map bounds if pins exist
    if (boundsPoints.length > 0) {
      map.fitBounds(L.latLngBounds(boundsPoints), {
        padding: [50, 50],
        maxZoom: 14,
      });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [filteredPins, agentPins, selectedPin]);

  const handleSelectStop = (pin: PickupPin) => {
    setSelectedPin(pin);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([pin.lat, pin.lng], 14, {
        duration: 0.8,
      });
    }
  };

  const handleRecenterChennai = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([13.0067, 80.2206], 12, {
        duration: 0.8,
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E5EBE5] overflow-hidden shadow-xs">
      {/* Map Control Header */}
      <div className="p-5 border-b border-[#E5EBE5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8FAF7]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#084D36] text-white flex items-center justify-center shadow-xs">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-base text-[#151A17] flex items-center space-x-2">
              <span>{title}</span>
              <span className="text-[10px] bg-[#EBF8E9] text-[#084D36] font-bold px-2.5 py-0.5 rounded-full border border-[#084D36]/20">
                Live GPS Routing
              </span>
            </h3>
            <p className="text-xs text-[#6B756E] flex items-center space-x-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16834D]" />
              <span>Zero-PII Address Protection: Street-level masked to neighborhood localities</span>
            </p>
          </div>
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex items-center space-x-2">
          {(['ALL', 'PENDING', 'ASSIGNED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                filter === tab
                  ? 'bg-[#084D36] text-white'
                  : 'bg-white text-[#6B756E] border border-[#E5EBE5] hover:bg-gray-50'
              }`}
            >
              {tab === 'ALL' ? 'All Stops' : tab === 'PENDING' ? 'Pending' : 'Assigned (In Transit)'}
            </button>
          ))}

          <button
            onClick={loadLocations}
            className="p-2 bg-white border border-[#E5EBE5] rounded-xl hover:bg-gray-50 text-[#6B756E] transition-colors"
            title="Refresh Locations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Map Body Grid */}
      <div className={`grid grid-cols-1 ${compact ? '' : 'lg:grid-cols-3'} min-h-[440px]`}>
        {/* Real Leaflet Map Container */}
        <div className={`relative ${compact ? 'h-[360px]' : 'lg:col-span-2 min-h-[440px] h-full'} bg-[#EBF3ED] border-b lg:border-b-0 lg:border-r border-[#E5EBE5]`}>
          <div ref={mapContainerRef} className="w-full h-full z-10 min-h-[400px]" />

          {/* Quick Hub Badge Overlay */}
          <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#E5EBE5] shadow-md text-xs font-bold text-[#084D36] flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-ping" />
            <span>Chennai Central Hub • 13.0067° N, 80.2206° E</span>
          </div>

          {/* Recenter Button */}
          <button
            onClick={handleRecenterChennai}
            className="absolute bottom-4 left-4 z-20 px-3 py-1.5 bg-white/95 hover:bg-white text-[#084D36] border border-[#E5EBE5] rounded-xl shadow-md text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-[#16834D]" />
            <span>Recenter Map</span>
          </button>
        </div>

        {/* Sidebar: Doorstep Stops & Route Order */}
        {!compact && (
          <div className="p-5 bg-white flex flex-col justify-between max-h-[520px] overflow-y-auto space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5]">
                <span className="text-xs font-bold text-[#151A17] uppercase tracking-wider">
                  Pickup Itinerary ({filteredPins.length} stops)
                </span>
                <span className="text-[11px] font-bold text-[#084D36] bg-[#EBF8E9] px-2 py-0.5 rounded-md">
                  Active Shift
                </span>
              </div>

              {/* Stop Cards */}
              <div className="space-y-2.5 mt-3">
                {filteredPins.map((pin, i) => {
                  const isSelected = selectedPin?.id === pin.id;
                  const isPending = pin.status === 'PENDING';

                  return (
                    <div
                      key={pin.id}
                      onClick={() => handleSelectStop(pin)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-[#084D36] bg-[#EBF8E9]/40 shadow-xs'
                          : 'border-[#E5EBE5] hover:border-[#CCD7CE] bg-[#F8FAF7]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className={`w-5 h-5 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 ${
                            isPending ? 'bg-amber-500' : 'bg-[#084D36]'
                          }`}>
                            {i + 1}
                          </span>
                          <div>
                            <h4 className="font-heading font-bold text-xs text-[#151A17] line-clamp-1">{pin.device}</h4>
                            <p className="text-[11px] text-[#6B756E] font-mono">{pin.requestId} • {pin.locality}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 ${
                          isPending ? 'bg-amber-100 text-amber-800' : 'bg-[#EBF8E9] text-[#084D36]'
                        }`}>
                          {pin.status}
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#E5EBE5] flex items-center justify-between text-[11px] text-[#6B756E]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#16834D]" />
                          <span>{pin.timeSlot}</span>
                        </span>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#084D36] hover:underline font-bold flex items-center gap-0.5"
                        >
                          <span>Directions</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Fleet Van Status Banner */}
            {agentPins.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#084D36] text-white space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-lime-400" />
                    <span className="font-heading font-bold text-xs">{agentPins[0].name} (Fleet Agent)</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md text-emerald-200 font-mono">
                    Online
                  </span>
                </div>
                <div className="text-[11px] text-emerald-100 flex items-center justify-between">
                  <span>Assigned Vehicle:</span>
                  <span className="font-bold text-white">{agentPins[0].currentVehicle}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
