import { useEffect, useState } from 'react';
import { splitHeight } from '../lib/units';

const toFields = (inches) => (inches == null ? { feet: '', inches: '' } : { ...splitHeight(inches) });

/** Feet + inches in, total inches (or null while incomplete) out. */
export default function HeightInput({ value, onChange }) {
  const [fields, setFields] = useState(() => toFields(value));

  // Follow outside changes (e.g. a photo estimate) without fighting the user's typing.
  useEffect(() => {
    const current = fields.feet === '' ? null : Number(fields.feet) * 12 + (Number(fields.inches) || 0);
    if (current !== value) setFields(toFields(value));
  }, [value]);

  const update = (next) => {
    const merged = { ...fields, ...next };
    setFields(merged);
    const feet = parseInt(merged.feet, 10);
    const inches = merged.inches === '' ? 0 : parseInt(merged.inches, 10);
    const valid = Number.isFinite(feet) && Number.isFinite(inches) && inches >= 0 && inches < 12;
    onChange(valid ? feet * 12 + inches : null);
  };

  return (
    <div className="flex items-end gap-3">
      <label className="flex-1">
        <span className="label">Feet</span>
        <input className="field text-center text-4xl font-black" type="number" inputMode="numeric"
          min="3" max="20" placeholder="11" value={fields.feet} onChange={(e) => update({ feet: e.target.value })} />
      </label>
      <label className="flex-1">
        <span className="label">Inches</span>
        <input className="field text-center text-4xl font-black" type="number" inputMode="numeric"
          min="0" max="11" placeholder="6" value={fields.inches} onChange={(e) => update({ inches: e.target.value })} />
      </label>
    </div>
  );
}
