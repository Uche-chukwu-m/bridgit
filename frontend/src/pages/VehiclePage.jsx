import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import HeightInput from '../components/HeightInput';
import PhotoEstimate from '../components/PhotoEstimate';
import ClearanceSign from '../components/ClearanceSign';
import { getHealth } from '../lib/api';
import { useBridgit } from '../state';

const MARGINS = [0, 3, 6, 12];

export default function VehiclePage() {
  const { vehicle, setVehicle } = useBridgit();
  const navigate = useNavigate();
  const [height, setHeight] = useState(vehicle?.heightIn ?? null);
  const [margin, setMargin] = useState(vehicle?.marginIn ?? 3);
  const [photos, setPhotos] = useState(false);

  useEffect(() => {
    getHealth().then((h) => setPhotos(h.photo_estimate)).catch(() => setPhotos(false));
  }, []);

  const valid = height != null && height >= 36 && height <= 240;

  const save = (e) => {
    e.preventDefault();
    setVehicle({ heightIn: height, marginIn: margin });
    navigate('/plan');
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-4xl font-black leading-tight">How tall is your vehicle?</h1>
      <p className="mt-2 text-lg text-black/70">
        Measure from the ground to the very top, including anything on the roof.
      </p>

      <form onSubmit={save} className="card mt-6 space-y-6">
        <HeightInput value={height} onChange={setHeight} />
        {height != null && !valid && <p className="text-blocked">Enter a height between 3′ and 20′.</p>}
        {valid && (
          <div className="flex items-center gap-4">
            <ClearanceSign inches={height + margin} />
            <p className="text-black/70">
              Bridgit will only use clearances of at least this height.
            </p>
          </div>
        )}
        <fieldset>
          <legend className="label">Extra room to leave</legend>
          <div className="grid grid-cols-4 gap-2">
            {MARGINS.map((m) => (
              <button key={m} type="button" onClick={() => setMargin(m)}
                className={`rounded-lg border-2 py-2 font-bold ${m === margin ? 'border-ink bg-ink text-white' : 'border-black/15 bg-white'}`}>
                {m}″
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-black/60">
            Road resurfacing and snow can steal a few inches. 3″ is a sensible default.
          </p>
        </fieldset>
        <button className="btn-primary w-full text-lg" disabled={!valid}>
          Plan a route <ArrowRight className="h-5 w-5" />
        </button>
      </form>

      <section className="card mt-6">
        <h2 className="text-lg font-black">Where to find your height</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-black/70">
          <li>Rental trucks: printed on the rental contract, or a sticker in the cab.</li>
          <li>RVs and trucks: the owner's manual or a sticker near the driver's door.</li>
          <li>Measure the tallest point yourself: AC units, antennas, vents, ladder racks, roof boxes.</li>
        </ul>
      </section>

      {photos && (
        <div className="mt-6">
          <PhotoEstimate
            onUse={(inches) => {
              setHeight(inches);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </main>
  );
}
