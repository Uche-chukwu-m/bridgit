import { createContext, useContext, useEffect, useState } from 'react';

// The vehicle and the planned trip survive reloads, so the Drive screen still works after a refresh.

const BridgitContext = createContext(null);

function usePersistent(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable (private mode); the app still works for this visit.
    }
  }, [key, value]);
  return [value, setValue];
}

export function BridgitProvider({ children }) {
  // vehicle: { heightIn, marginIn } | null
  const [vehicle, setVehicle] = usePersistent('bridgit.vehicle', null);
  // trip: { from, to, plan, selected } | null, where plan is the /api/trip response
  const [trip, setTrip] = usePersistent('bridgit.trip', null);
  return (
    <BridgitContext.Provider value={{ vehicle, setVehicle, trip, setTrip }}>{children}</BridgitContext.Provider>
  );
}

export const useBridgit = () => useContext(BridgitContext);
