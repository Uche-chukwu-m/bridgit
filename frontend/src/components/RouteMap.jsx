import { useEffect } from 'react';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { formatHeight } from '../lib/units';

const TILE_URL = import.meta.env.VITE_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const STATUS_COLOR = { ok: '#15803d', tight: '#b45309', blocked: '#b91c1c' };

function FitTo({ points, follow }) {
  const map = useMap();
  const key = follow ? `${follow[0]},${follow[1]}` : points.length && `${points[0]}|${points[points.length - 1]}|${points.length}`;
  useEffect(() => {
    if (follow) map.setView(follow, Math.max(map.getZoom(), 15), { animate: true });
    else if (points.length) map.fitBounds(points, { padding: [30, 30] });
  }, [key]);
  return null;
}

/** routes: [{ geometry }], selected: index, clearances: of the selected route, position: [lat, lon] */
export default function RouteMap({ routes, selected = 0, onSelect, clearances = [], position, follow = false, className = '' }) {
  const active = routes[selected];
  return (
    <MapContainer className={`h-full w-full ${className}`} center={active?.geometry[0] ?? [39.8, -98.6]} zoom={4} scrollWheelZoom>
      <TileLayer url={TILE_URL} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
      {routes.map((route, i) =>
        i === selected ? null : (
          <Polyline key={i} positions={route.geometry} pathOptions={{ color: '#6b7280', weight: 5, opacity: 0.6 }}
            eventHandlers={{ click: () => onSelect?.(i) }} />
        ),
      )}
      {active && (
        <>
          <Polyline positions={active.geometry} pathOptions={{ color: '#15171a', weight: 9, opacity: 0.9 }} />
          <Polyline positions={active.geometry} pathOptions={{ color: '#ffcc00', weight: 4 }} />
        </>
      )}
      {clearances.map((c) => (
        <CircleMarker key={`${c.lat},${c.lon}`} center={[c.lat, c.lon]} radius={9}
          pathOptions={{ color: '#15171a', weight: 2, fillColor: STATUS_COLOR[c.status], fillOpacity: 1 }}>
          <Tooltip>
            <strong>{formatHeight(c.clearance_in)}</strong>
            {c.name ? ` · ${c.name}` : ''}
          </Tooltip>
        </CircleMarker>
      ))}
      {position && (
        <CircleMarker center={position} radius={10} pathOptions={{ color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }} />
      )}
      <FitTo points={active?.geometry ?? []} follow={follow ? position : null} />
    </MapContainer>
  );
}
