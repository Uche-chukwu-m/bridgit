import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { estimateHeight } from '../lib/api';
import { formatHeight } from '../lib/units';

// Photos are shrunk before upload: smaller is faster, and plenty for a rough estimate.
async function shrink(file, maxSide = 1024) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
}

export default function PhotoEstimate({ onUse }) {
  const [state, setState] = useState({ status: 'idle' });

  const onFile = async (file) => {
    if (!file) return;
    setState({ status: 'working' });
    try {
      setState({ status: 'done', estimate: await estimateHeight(await shrink(file)) });
    } catch (e) {
      setState({ status: 'error', message: e.message });
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-black">Not sure? Start from a photo</h2>
      <p className="mt-1 text-black/60">
        A side-on photo of the whole vehicle gives a rough range. It's a starting point, not a measurement.
      </p>
      <label className="btn-secondary mt-4 cursor-pointer">
        {state.status === 'working' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
        {state.status === 'working' ? 'Looking at your photo…' : 'Choose a photo'}
        <input type="file" accept="image/*" capture="environment" className="sr-only"
          disabled={state.status === 'working'} onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      {state.status === 'error' && <p className="mt-3 text-blocked">{state.message}</p>}
      {state.status === 'done' && (
        <div className="mt-4 rounded-lg bg-road p-4">
          <p>
            Looks like a <strong>{state.estimate.vehicle}</strong>, about{' '}
            <strong>{formatHeight(state.estimate.low_in)} to {formatHeight(state.estimate.high_in)}</strong> tall.
          </p>
          {state.estimate.notes && <p className="mt-1 text-sm text-black/60">{state.estimate.notes}</p>}
          <button type="button" className="btn-primary mt-3" onClick={() => onUse(state.estimate.high_in)}>
            Use {formatHeight(state.estimate.high_in)}, the high end
          </button>
          <p className="mt-2 text-sm text-black/60">Then check it with a tape measure if you can.</p>
        </div>
      )}
    </div>
  );
}
