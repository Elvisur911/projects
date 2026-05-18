'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Layers, Locate, Plus, Minus, Flame, Eye, Sparkles } from 'lucide-react';
import type { DbAlert, DbRoadRisk } from '@/types';
import { DEMO_FLOOD_ZONES, DEFAULT_CENTER, DEFAULT_ZOOM, MAP_STYLES } from '@/constants';
import { cn } from '@/utils';

interface Props {
  roadRisks: DbRoadRisk[];
  alerts:    DbAlert[];
}

const RISK_COLORS: Record<string, string> = {
  low:      '#22c55e',
  moderate: '#f59e0b',
  high:     '#f97316',
  critical: '#ef4444',
};

export default function MapPanel({ roadRisks, alerts }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map          = useRef<mapboxgl.Map | null>(null);
  const [loaded, setLoaded]         = useState(false);
  const [heatmap, setHeatmap]       = useState(false);
  const [floodLayer, setFloodLayer] = useState(true);
  const [styleKey, setStyleKey]     = useState<keyof typeof MAP_STYLES>('dark');

  const initMap = useCallback(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style:     MAP_STYLES[styleKey],
      center:    DEFAULT_CENTER,
      zoom:      DEFAULT_ZOOM,
      pitch:     30,
      bearing:   0,
      attributionControl: false,
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // ---------- Flood zones ----------
      map.current.addSource('flood-zones', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: DEMO_FLOOD_ZONES.map(zone => ({
            type: 'Feature',
            properties: { name: zone.name, severity: zone.severity },
            geometry: {
              type: 'Polygon',
              coordinates: [zone.coordinates.map(c => [c[0], c[1]])],
            },
          })),
        },
      });

      map.current.addLayer({
        id: 'flood-zones-fill',
        type: 'fill',
        source: 'flood-zones',
        paint: {
          'fill-color': [
            'match', ['get', 'severity'],
            'critical', 'rgba(239,68,68,0.25)',
            'high',     'rgba(249,115,22,0.2)',
            'moderate', 'rgba(245,158,11,0.15)',
            'rgba(34,197,94,0.1)',
          ],
          'fill-outline-color': [
            'match', ['get', 'severity'],
            'critical', '#ef4444',
            'high',     '#f97316',
            'moderate', '#f59e0b',
            '#22c55e',
          ],
        },
      });

      // ---------- Road risk markers ----------
      roadRisks.forEach(road => {
        const color = RISK_COLORS[road.risk_level] ?? '#94a3b8';

        // Pulsing circle for critical/high
        const el = document.createElement('div');
        el.className = 'relative flex items-center justify-center';
        el.style.cssText = `width:20px;height:20px`;
        el.innerHTML = `
          <div style="
            position:absolute;width:20px;height:20px;border-radius:50%;
            background:${color}22;border:2px solid ${color};
            animation:${road.risk_level === 'critical' ? 'pulse-ring 1.5s infinite' : 'none'}
          "></div>
          <div style="width:8px;height:8px;border-radius:50%;background:${color};position:relative"></div>
        `;

        new mapboxgl.Marker({ element: el })
          .setLngLat([road.lng, road.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 12 }).setHTML(`
              <div style="font-family:var(--font-space-grotesk,sans-serif)">
                <p style="font-weight:700;font-size:13px;margin-bottom:4px">${road.road_name}</p>
                <p style="font-size:11px;color:${color};text-transform:uppercase;letter-spacing:1px">
                  ${road.risk_level} risk
                </p>
                <p style="font-size:11px;color:#94a3b8;margin-top:4px">
                  Score: ${road.risk_score}/10
                  ${road.flood_depth_cm ? ` · Flood depth: ${road.flood_depth_cm}cm` : ''}
                </p>
                <p style="font-size:11px;color:${road.is_passable ? '#22c55e' : '#ef4444'};margin-top:2px">
                  ${road.is_passable ? '✓ Passable' : '✕ Impassable'}
                </p>
              </div>
            `)
          )
          .addTo(map.current!);
      });

      // ---------- Alert markers ----------
      alerts.slice(0, 8).forEach(alert => {
        if (!alert.lat || !alert.lng) return;
        const color = alert.severity === 'critical' ? '#ef4444' : '#f59e0b';
        const el = document.createElement('div');
        el.style.cssText = `
          width:28px;height:28px;border-radius:6px;
          background:${color}22;border:1.5px solid ${color};
          display:flex;align-items:center;justify-content:center;
          font-size:14px;cursor:pointer;
        `;
        el.innerHTML = alert.type === 'flood_warning' ? '💧' :
                       alert.type === 'storm_warning' ? '⛈️' : '🚧';

        new mapboxgl.Marker({ element: el })
          .setLngLat([alert.lng, alert.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 12 }).setHTML(`
              <p style="font-weight:700;font-size:12px;margin-bottom:3px">${alert.title}</p>
              <p style="font-size:11px;color:#94a3b8">${alert.description}</p>
            `)
          )
          .addTo(map.current!);
      });

      setLoaded(true);
    });
  }, [styleKey, roadRisks, alerts]);

  useEffect(() => {
    initMap();
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [initMap]);

  // Toggle heatmap layer
  useEffect(() => {
    if (!map.current || !loaded) return;
    const visibility = heatmap ? 'visible' : 'none';
    if (map.current.getLayer('flood-zones-fill')) {
      map.current.setLayoutProperty('flood-zones-fill', 'visibility', visibility);
    }
  }, [heatmap, loaded]);

  function handleLocate() {
    navigator.geolocation.getCurrentPosition(pos => {
      map.current?.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: 14,
        duration: 1500,
      });
    });
  }

  return (
    <div className="sr-card overflow-hidden">
      {/* Header */}
      <div className="sr-card-header">
        <div className="sr-card-title">
          <span className="text-lg">🗺️</span>
          Live Risk Map
          <span className="badge-ai">
            <Sparkles className="w-3 h-3" /> AI Predictive
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="risk-critical text-[10px] px-2 py-0.5 rounded">FLOOD WATCH</span>
          <span className="text-[11px] text-[#64748b]">Nairobi Metro</span>
        </div>
      </div>

      {/* Map */}
      <div className="relative" style={{ height: '440px' }}>
        <div ref={mapContainer} className="w-full h-full" />

        {/* Loading overlay */}
        {!loaded && (
          <div className="absolute inset-0 bg-[#070B14] cyber-bg flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[12px] text-[#64748b]">Loading map…</p>
              <p className="text-[11px] text-[#64748b] mt-1">
                {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN
                  ? 'Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local'
                  : 'Fetching road data…'}
              </p>
            </div>
          </div>
        )}

        {/* Map toolbar */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {[
            { icon: Plus,   onClick: () => map.current?.zoomIn(),     title: 'Zoom in' },
            { icon: Minus,  onClick: () => map.current?.zoomOut(),    title: 'Zoom out' },
            { icon: Locate, onClick: handleLocate,                     title: 'My location' },
            { icon: Layers, onClick: () => setStyleKey(k =>
                k === 'dark' ? 'satellite' : k === 'satellite' ? 'navigation' : 'dark'
              ), title: 'Switch layer' },
            { icon: Flame,  onClick: () => setHeatmap(h => !h),       title: 'Risk heatmap',
              active: heatmap },
          ].map(({ icon: Icon, onClick, title, active = false }) => (
            <button key={title} onClick={onClick} title={title}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center text-[14px] cursor-pointer backdrop-blur-sm transition-all',
                'bg-[#0D1424]/90 border border-[#1e2d47]',
                active
                  ? 'border-cyan-500/50 text-cyan-400'
                  : 'text-[#94a3b8] hover:border-[#243450] hover:text-[#e2e8f0]'
              )}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-[#070B14]/90 backdrop-blur-sm border border-[#1e2d47] rounded-lg p-3 z-10">
          <p className="text-[10px] text-[#64748b] uppercase tracking-widest mb-2">Legend</p>
          {[
            { color: '#22c55e', label: 'Safe Road' },
            { color: '#ef4444', label: 'Flood Zone' },
            { color: '#f59e0b', label: 'Road Closure' },
            { color: '#00d4ff', label: 'Safe Route' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 text-[11px] text-[#94a3b8] mb-1.5 last:mb-0">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>

        {/* Active route info */}
        <div className="absolute top-3 right-3 bg-[#070B14]/90 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-3 z-10 min-w-[140px]">
          <p className="text-[10px] text-cyan-400 uppercase tracking-widest mb-2">Active Route</p>
          {[
            { label: 'Distance', value: '14.2 km' },
            { label: 'Est. Time', value: '28 min' },
            { label: 'Safety',   value: '92%',   color: 'text-green-400' },
            { label: 'Risk',     value: '2.4/10', color: 'text-yellow-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center gap-4 mb-1 last:mb-0">
              <span className="text-[11px] text-[#64748b]">{label}</span>
              <span className={cn('text-[12px] font-mono-num font-medium', color ?? 'text-[#e2e8f0]')}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Layer toggle pills */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-10">
          {[
            { label: 'Floods', active: floodLayer, toggle: () => setFloodLayer(f => !f) },
            { label: 'Heatmap', active: heatmap,   toggle: () => setHeatmap(h => !h) },
          ].map(({ label, active, toggle }) => (
            <button key={label} onClick={toggle}
              className={cn(
                'text-[10px] px-2.5 py-1 rounded-full border transition-all backdrop-blur-sm cursor-pointer',
                active
                  ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                  : 'bg-[#0D1424]/80 border-[#1e2d47] text-[#64748b]'
              )}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
