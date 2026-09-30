import { NavLink, Route, Routes } from 'react-router';
import VehiclePage from './pages/VehiclePage';
import PlanPage from './pages/PlanPage';
import DrivePage from './pages/DrivePage';
import { formatHeight } from './lib/units';
import { useBridgit } from './state';

const STEPS = [
  { to: '/', label: 'Vehicle' },
  { to: '/plan', label: 'Plan' },
  { to: '/drive', label: 'Drive' },
];

export default function App() {
  const { vehicle } = useBridgit();
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-[1100] flex h-16 items-center gap-4 bg-ink px-4 text-white">
        <NavLink to="/" className="flex items-center gap-2 text-xl font-black">
          <img src="/favicon.svg" alt="" className="h-7 w-7" /> Bridgit
        </NavLink>
        <nav className="ml-auto flex items-center gap-1">
          {STEPS.map((step, i) => (
            <NavLink key={step.to} to={step.to} end
              className={({ isActive }) => `rounded-md px-2 py-1.5 text-sm font-bold sm:px-3 ${isActive ? 'bg-sign text-ink' : 'text-white/70 hover:text-white'}`}>
              <span className="hidden sm:inline">{i + 1}. </span>{step.label}
            </NavLink>
          ))}
        </nav>
        {vehicle && (
          <NavLink to="/" className="hidden rounded-md border border-white/30 px-2 py-1 text-sm font-bold sm:block" title="Your vehicle height">
            {formatHeight(vehicle.heightIn)}
          </NavLink>
        )}
      </header>
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<VehiclePage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/drive" element={<DrivePage />} />
          <Route path="*" element={<VehiclePage />} />
        </Routes>
      </div>
    </div>
  );
}
