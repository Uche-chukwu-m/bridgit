import { useEffect, useRef, useState } from 'react';
import { LocateFixed, MapPin } from 'lucide-react';
import { searchPlaces } from '../lib/api';

/** A place picker with suggestions. value is { label, lat, lon } or null. */
export default function PlaceSearch({ label, value, onChange, allowCurrentLocation = false, placeholder }) {
  const [text, setText] = useState(value?.label ?? '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [locating, setLocating] = useState(false);
  const typed = useRef(false);

  // Show a chosen place's name; clearing the choice (because the user is typing) leaves their text alone.
  useEffect(() => {
    if (value) setText(value.label);
  }, [value]);

  useEffect(() => {
    if (!typed.current || text.trim().length < 3) {
      setResults([]);
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchPlaces(text.trim(), controller.signal)
        .then((places) => {
          setResults(places);
          setError(places.length ? null : 'No matches. Try adding a city or state.');
        })
        .catch((e) => e.name !== 'AbortError' && setError(e.message));
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text]);

  const choose = (place) => {
    typed.current = false;
    onChange(place);
    setOpen(false);
    setResults([]);
    setError(null);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return setError("This browser can't share your location.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        choose({ label: 'My location', lat: coords.latitude, lon: coords.longitude });
      },
      () => {
        setLocating(false);
        setError("Couldn't get your location. Type an address instead.");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  return (
    <div className="relative">
      <span className="label">{label}</span>
      <div className="flex gap-2">
        <input
          className="field"
          value={text}
          placeholder={placeholder}
          onChange={(e) => {
            typed.current = true;
            setText(e.target.value);
            setOpen(true);
            if (value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          aria-label={label}
        />
        {allowCurrentLocation && (
          <button type="button" className="btn-secondary px-3" onClick={useMyLocation} disabled={locating}
            title="Use my location" aria-label="Use my location">
            <LocateFixed className={`h-5 w-5 ${locating ? 'animate-pulse' : ''}`} />
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-blocked">{error}</p>}
      {open && results.length > 0 && (
        <ul className="absolute z-[1000] mt-1 w-full overflow-hidden rounded-lg border border-black/10 bg-white shadow-lg">
          {results.map((place) => (
            <li key={`${place.lat},${place.lon},${place.label}`}>
              <button type="button" className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-road"
                onMouseDown={(e) => e.preventDefault()} onClick={() => choose(place)}>
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-black/40" />
                <span>{place.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
