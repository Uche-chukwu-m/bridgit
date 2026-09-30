import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { AlertTriangle, CheckCircle2, Play, Square, Volume2, VolumeX, Zap } from 'lucide-react';
import RouteMap from '../components/RouteMap';
import ClearanceSign from '../components/ClearanceSign';
import { OFF_ROUTE_M, alertStage, announcement } from '../lib/drive';
import { buildRoute, locate, nextClearance, pointAt } from '../lib/route';
import { formatDistance, formatSpare } from '../lib/units';
import { useBridgit } from '../state';

const SIM_SPEED_MS = 200; // metres per second: highway speed, sped up 8x so a demo doesn't take all day
const SIM_TICK_MS = 250;

function say(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

export default function DrivePage() {
  const { trip, vehicle } = useBridgit();
  const plan = trip?.plan;
  const stale = plan && vehicle && (plan.vehicle_height_in !== vehicle.heightIn || plan.margin_in !== vehicle.marginIn);
  const routeData = plan?.routes[trip.selected];
  const route = useMemo(() => routeData && buildRoute(routeData.geometry), [routeData]);
  const clearances = routeData?.clearances ?? [];

  const [mode, setMode] = useState('idle'); // idle | gps | sim
  const [fix, setFix] = useState(null); // { position, along, offset, accuracy }
  const [gpsError, setGpsError] = useState(null);
  const [sound, setSound] = useState(true);
  const announced = useRef(new Set());

  // Real GPS.
  useEffect(() => {
    if (mode !== 'gps' || !route) return undefined;
    if (!navigator.geolocation) {
      setGpsError("This device can't share its location.");
      setMode('idle');
      return undefined;
    }
    const id = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const position = [coords.latitude, coords.longitude];
        setGpsError(null);
        setFix({ position, accuracy: coords.accuracy, ...locate(route, position) });
      },
      (err) => setGpsError(err.code === 1 ? 'Location permission is off. Allow it to get alerts.' : 'Waiting for GPS…'),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [mode, route]);

  // Simulated drive along the route, for trying Bridgit out.
  useEffect(() => {
    if (mode !== 'sim' || !route) return undefined;
    let along = 0;
    const timer = setInterval(() => {
      along = Math.min(route.length, along + (SIM_SPEED_MS * SIM_TICK_MS) / 1000);
      setFix({ position: pointAt(route, along), along, offset: 0, accuracy: 0 });
      if (along >= route.length) clearInterval(timer);
    }, SIM_TICK_MS);
    return () => clearInterval(timer);
  }, [mode, route]);

  // Keep the screen on while driving.
  useEffect(() => {
    if (mode === 'idle' || !navigator.wakeLock) return undefined;
    let lock;
    navigator.wakeLock.request('screen').then((l) => { lock = l; }).catch(() => {});
    return () => lock?.release();
  }, [mode]);

  const start = (next) => {
    announced.current = new Set();
    setFix(null);
    setMode(next);
  };

  const offRoute = mode === 'gps' && fix && fix.offset > OFF_ROUTE_M && fix.accuracy < OFF_ROUTE_M;
  const arrived = fix && route && fix.along >= route.length - 30 && !offRoute;
  const next = fix && !offRoute ? nextClearance(clearances, fix.along) : null;
  const stage = next && alertStage(next.distance);

  // Speak each warning once.
  useEffect(() => {
    if (mode === 'idle') return;
    let key = null;
    let text = null;
    if (offRoute) {
      key = `off:${Math.round(fix.along / 500)}`;
      text = "You've left the planned route. Clearances ahead are unchecked.";
    } else if (stage) {
      key = `${next.clearance.along_m}:${stage}`;
      text = announcement(next.clearance, stage);
    }
    if (key && !announced.current.has(key)) {
      announced.current.add(key);
      if (sound) say(text);
      navigator.vibrate?.([200, 100, 200]);
    }
  });

  if (!routeData || stale) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12 text-center">
        <h1 className="text-3xl font-black">{stale ? 'Your vehicle changed' : 'No route yet'}</h1>
        <p className="mt-2 text-black/70">
          {stale
            ? 'This route was planned for a different height or margin. Plan it again before you drive.'
            : 'Plan a route first, then come back here to drive it.'}
        </p>
        <Link to="/plan" className="btn-primary mt-6">Plan a route</Link>
      </main>
    );
  }

  const danger = next && (next.clearance.status !== 'ok' || stage === 'near');

  return (
    <main className="relative h-[calc(100vh-4rem)]">
      <RouteMap routes={[routeData]} clearances={clearances} position={fix?.position} follow={mode !== 'idle'} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] p-3 sm:p-5">
        <div className="pointer-events-auto mx-auto max-w-xl space-y-3">
          {offRoute && (
            <div className="card flex items-center gap-3 border-blocked bg-blocked text-white">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <p className="font-bold">You've left the planned route. Clearances ahead are unchecked. Watch for signs.</p>
            </div>
          )}
          {!plan.checked && (
            <p className="card bg-amber-50 text-sm">Clearances on this route couldn't be double-checked, so there are no alerts.</p>
          )}

          <div className={`card ${danger ? 'border-blocked bg-red-50' : stage ? 'border-tight bg-amber-50' : ''}`}>
            {mode === 'idle' && !plan.checked ? (
              <p className="text-lg">You can still follow the route on the map. It avoids low clearances the router knows about.</p>
            ) : mode === 'idle' ? (
              <p className="text-lg">
                {clearances.length
                  ? `${clearances.length} low clearance${clearances.length === 1 ? '' : 's'} on this route. Bridgit will call each one out a mile ahead.`
                  : 'No low clearances are mapped on this route.'}
              </p>
            ) : arrived ? (
              <p className="flex items-center gap-2 text-xl font-black text-ok"><CheckCircle2 className="h-6 w-6" /> You've arrived.</p>
            ) : next ? (
              <div className="flex items-center gap-4">
                <ClearanceSign inches={next.clearance.clearance_in} size="lg" />
                <div>
                  <p className="text-3xl font-black">{formatDistance(next.distance)}</p>
                  <p className="font-bold">{next.clearance.name || 'Unnamed road'}</p>
                  <p className={next.clearance.status === 'ok' ? 'text-ok' : 'font-bold text-blocked'}>
                    {next.clearance.status === 'blocked'
                      ? 'Your vehicle will not fit. Stop and find another way.'
                      : `${formatSpare(next.clearance.spare_in)} to spare`}
                  </p>
                </div>
              </div>
            ) : fix && plan.checked ? (
              <p className="flex items-center gap-2 text-lg font-bold text-ok"><CheckCircle2 className="h-5 w-5" /> No more low clearances on this route.</p>
            ) : fix ? (
              <p className="text-lg">Following the route. No alerts: clearances weren't checked.</p>
            ) : (
              <p className="text-lg">{gpsError || 'Finding your position…'}</p>
            )}

            <div className="mt-4 flex gap-2">
              {mode === 'idle' ? (
                <>
                  <button type="button" className="btn-primary flex-1" onClick={() => start('gps')}>
                    <Play className="h-5 w-5" /> Start driving
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => start('sim')} title="Simulate the drive">
                    <Zap className="h-5 w-5" /> Simulate
                  </button>
                </>
              ) : (
                <button type="button" className="btn-secondary flex-1" onClick={() => setMode('idle')}>
                  <Square className="h-5 w-5" /> Stop
                </button>
              )}
              <button type="button" className="btn-secondary px-3" onClick={() => setSound(!sound)}
                aria-label={sound ? 'Mute voice alerts' : 'Turn on voice alerts'}>
                {sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
