'use client';

import React from 'react';

interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
}

interface SimpleMapProps {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  height?: string;
  className?: string;
}

function latLngToPixel(lat: number, lng: number, centerLat: number, centerLng: number, zoom: number, width: number, height: number): { x: number; y: number } {
  const scale = Math.pow(2, zoom) * 256;
  const worldX = ((lng + 180) / 360) * scale;
  const worldY = ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * scale;
  const centerWorldX = ((centerLng + 180) / 360) * scale;
  const centerWorldY = ((1 - Math.log(Math.tan((centerLat * Math.PI) / 180) + 1 / Math.cos((centerLat * Math.PI) / 180)) / Math.PI) / 2) * scale;
  return { x: width / 2 + (worldX - centerWorldX), y: height / 2 + (worldY - centerWorldY) };
}

export default function SimpleMap({ center, zoom = 12, markers = [], height = '300px', className = '' }: SimpleMapProps) {
  const width = 600;
  const heightNum = parseInt(height) || 300;
  const markerPositions = markers.map((m) => ({ ...m, ...latLngToPixel(m.lat, m.lng, center[0], center[1], zoom, width, heightNum) }));

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-surface-secondary ${className}`} style={{ height }}>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-blue-900/30" />
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox={`0 0 ${width} ${heightNum}`}>
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`lat-${i}`} x1={0} y1={(i + 1) * (heightNum / 10)} x2={width} y2={(i + 1) * (heightNum / 10)} stroke="currentColor" strokeWidth={0.5} className="text-ink-tertiary" />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`lng-${i}`} x1={(i + 1) * (width / 10)} y1={0} x2={(i + 1) * (width / 10)} y2={heightNum} stroke="currentColor" strokeWidth={0.5} className="text-ink-tertiary" />
        ))}
      </svg>
      {markerPositions.map((m, i) => (
        <div key={i} className="absolute -translate-x-1/2 -translate-y-full group" style={{ left: `${(m.x / width) * 100}%`, top: `${(m.y / heightNum) * 100}%` }}>
          <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse" style={{ backgroundColor: m.color || 'oklch(0.65 0.18 145)' }} />
          {m.label && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded bg-surface-elevated/90 border border-white/10 text-[10px] text-white font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {m.label}
            </div>
          )}
        </div>
      ))}
      <div className="absolute bottom-1 right-2 text-[9px] text-white/30 font-medium">
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="hover:text-white/50">OpenStreetMap</a>
      </div>
      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-surface-elevated/60 border border-white/10 text-[9px] text-white/40 font-mono">z{zoom}</div>
    </div>
  );
}
