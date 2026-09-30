import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { AlertTriangle, Loader2, Navigation, Route as RouteIcon } from 'lucide-react';
import PlaceSearch from '../components/PlaceSearch';
import RouteMap from '../components/RouteMap';
import ClearanceList from '../components/ClearanceList';
import Verdict from '../components/Verdict';
import { planTrip } from '../lib/api';
import { formatDistance, formatDuration, formatHeight } from '../lib/units';
import { describeRoute } from '../lib/verdict';
import { useBridgit } from '../state';

export default function PlanPage() {
  const { vehicle, trip, setTrip } = useBridgit();
  const navigate = useNavigate();
  const [from, setFrom] = useState(trip?.from ?? null);
  const [to, setTo] = useState(trip?.to ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!vehicle) return <Navigate to="/" replace />;

  const plan = trip?.plan;
  const selected = trip?.selected ?? 0;
  const route = plan?.routes[selected];
  const stale = plan && (plan.vehicle_height_in !== vehicle.heightIn || plan.margin_in !== vehicle.marginIn);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await planTrip({ origin: from, destination: to, heightIn: vehicle.heightIn, marginIn: vehicle.marginIn });
      setTrip({ from, to, plan: result, selected: result.recommended });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const select = (i) => setTrip({ ...trip, selected: i });

  return (
    <main className="lg:grid lg:h-[calc(100vh-4rem)] lg:grid-cols-[28rem_1fr]">
      <div className="space-y-5 px-4 py-6 lg:overflow-y-auto">
        <form onSubmit={submit} className="card space-y-4">
          <PlaceSearch label="From" value={from} onChange={setFrom} allowCurrentLocation placeholder="Address, city or place" />
          <PlaceSearch label="To" value={to} onChange={setTo} placeholder="Address, city or place" />
          <button className="btn-primary w-full text-lg" disabled={!from || !to || loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RouteIcon className="h-5 w-5" />}
            {loading ? 'Checking every clearance…' : `Find a route for ${formatHeight(vehicle.heightIn)}`}
          </button>
          {error && <p className="text-blocked">{error}</p>}
        </form>

        {plan && stale && (
          <p className="card border-tight/40 bg-amber-50">
            Your vehicle has changed since this route was planned. Plan again before you drive.
          </p>
        )}

        {plan && !plan.checked && (
          <div className="card flex gap-3 border-tight/40 bg-amber-50">
            <AlertTriangle className="h-5 w-5 shrink-0 text-tight" />
            <p>
              We couldn't double-check the clearances along these routes just now, so there will be no alerts.
              The routes still avoid low clearances the router knows about. Watch for signs.
            </p>
          </div>
        )}

        {plan && (
          <section className="space-y-3">
            {plan.routes.map((r, i) => (
              <button key={i} type="button" onClick={() => select(i)}
                className={`card w-full text-left transition ${i === selected ? 'ring-4 ring-ink' : 'hover:border-black/30'}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black">
                    {formatDuration(r.duration_s)} <span className="font-normal text-black/60">· {formatDistance(r.distance_m)}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    {i === plan.recommended && <span className="text-xs font-bold uppercase text-black/50">Best</span>}
                    <Verdict verdict={r.verdict} />
                  </div>
                </div>
                <p className="mt-1 text-black/70">{describeRoute(r, plan.margin_in)}</p>
              </button>
            ))}
          </section>
        )}

        {route && (
          <section className="card">
            <h2 className="text-lg font-black">Low clearances on this route</h2>
            <div className="mt-2">
              {plan.checked ? <ClearanceList clearances={route.clearances} /> : <p className="text-black/60">Not checked this time.</p>}
            </div>
            <button type="button" className="btn-primary mt-4 w-full text-lg" disabled={stale || route.verdict === 'unsafe'}
              onClick={() => navigate('/drive')}>
              <Navigation className="h-5 w-5" /> Drive this route
            </button>
            {route.verdict === 'unsafe' && (
              <p className="mt-2 text-sm text-blocked">Pick a route that fits, or <Link to="/" className="underline">check your height</Link>.</p>
            )}
          </section>
        )}
      </div>

      <div className="h-80 lg:h-full">
        <RouteMap routes={plan?.routes ?? []} selected={selected} onSelect={plan ? select : undefined} clearances={route?.clearances} />
      </div>
    </main>
  );
}
