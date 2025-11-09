import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Truck, Map, AlertTriangle, Camera, Home, Brain, Users } from 'lucide-react';

// Pages (we'll create these next)
import HomePage from './pages/HomePage';
import MeasureVehiclePage from './pages/MeasureVehiclePage';
import RoutePlannerPage from './pages/RoutePlannerPage';
import LiveMonitoringPage from './pages/LiveMonitoringPage';
import IncidentReportPage from './pages/IncidentReportPage';
import BridgeDatabasePage from './pages/BridgeDatabasePage';
import AgentAnalysisPage from './pages/AgentAnalysisPage';
import CommunityDashboardPage from './pages/CommunityDashboardPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation */}
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    Bridgit
                  </span>
                </Link>

                {/* Nav Links */}
                <div className="hidden md:flex space-x-1">
                  <NavLink to="/" icon={Home}>Home</NavLink>
                  <NavLink to="/measure" icon={Camera}>Measure Vehicle</NavLink>
                  <NavLink to="/agents" icon={Brain}>AI Agents</NavLink>
                  <NavLink to="/route" icon={Map}>Plan Route</NavLink>
                  <NavLink to="/monitor" icon={AlertTriangle}>Live Monitor</NavLink>
                  <NavLink to="/community" icon={Users}>Community</NavLink>

                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/measure" element={<MeasureVehiclePage />} />
            <Route path="/agents" element={<AgentAnalysisPage />} />
            <Route path="/route" element={<RoutePlannerPage />} />
            <Route path="/monitor" element={<LiveMonitoringPage />} />
            <Route path="/incident" element={<IncidentReportPage />} />
            <Route path="/bridges" element={<BridgeDatabasePage />} />
            <Route path="/community" element={<CommunityDashboardPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// Navigation Link Component
function NavLink({ to, icon: Icon, children }) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{children}</span>
    </Link>
  );
}

export default App;