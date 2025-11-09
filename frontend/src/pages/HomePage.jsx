import { Link } from 'react-router-dom';
import { 
  Camera, 
  Map, 
  AlertTriangle, 
  Shield, 
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { mockBridges } from '../data/mockBridges';

export default function HomePage() {
  const totalIncidents = mockBridges.reduce((sum, b) => sum + b.incidentCount, 0);
  const problematicBridges = mockBridges.filter(b => b.incidentCount > 10).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Stop Bridge Strikes Before They Happen
        </h1>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          AI-powered vehicle measurement and route planning to prevent 
          <span className="font-bold text-red-600"> 1,000+ yearly bridge strikes</span>.
          Know your height. Know your route. Drive with confidence.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/measure"
            className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Camera className="w-5 h-5 mr-2" />
            Measure My Vehicle
          </Link>
          
          <Link
            to="/route"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Map className="w-5 h-5 mr-2" />
            Plan Safe Route
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <StatCard
          icon={AlertTriangle}
          value="1,000+"
          label="Bridge Strikes/Year"
          color="red"
        />
        <StatCard
          icon={DollarSign}
          value="$300M"
          label="Damage Costs/Year"
          color="orange"
        />
        <StatCard
          icon={Users}
          value={totalIncidents}
          label="Documented Incidents"
          color="yellow"
        />
        <StatCard
          icon={Shield}
          value={problematicBridges}
          label="Problem Bridges Tracked"
          color="blue"
        />
      </div>

      {/* How It Works */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard
            number="1"
            title="Measure Your Vehicle"
            description="Take a photo of your truck or RV. Our AI analyzes height including all roof equipment."
            icon={Camera}
            to="/measure"
          />
          
          <StepCard
            number="2"
            title="Plan Safe Routes"
            description="Enter your destination. We analyze all bridges and recommend the safest route."
            icon={Map}
            to="/route"
          />
          
          <StepCard
            number="3"
            title="Drive with Confidence"
            description="Real-time monitoring alerts you to low bridges ahead with escalating warnings."
            icon={AlertTriangle}
            to="/monitor"
          />
        </div>
      </div>

      {/* Problem Bridges Showcase */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
          Most Notorious Bridges
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockBridges
            .filter(b => b.incidentCount > 50)
            .map(bridge => (
              <BridgeCard key={bridge.id} bridge={bridge} />
            ))}
        </div>
        
        <Link
          to="/bridges"
          className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          View Full Bridge Database →
        </Link>
      </div>

      {/* Video Section */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Why This Matters</h2>
        <p className="text-lg text-gray-700 mb-6">
          Every year, trucks hit bridges causing catastrophic damage, traffic chaos, and sometimes death.
          Watch what happens when GPS routes trucks incorrectly.
        </p>
        
        {/* YouTube Video Embed */}
        <div className="aspect-video rounded-xl max-w-3xl mx-auto overflow-hidden shadow-xl">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/6nquHli7P5s"
            title="Bridge Strike Compilation"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, value, label, color }) {
  const colorClasses = {
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

// Step Card Component
function StepCard({ number, title, description, icon: Icon, to }) {
  return (
    <Link to={to} className="group">
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
            {number}
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Icon className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {title}
              </h3>
            </div>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Bridge Card Component
function BridgeCard({ bridge }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-500">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-900">{bridge.name}</h3>
        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
          {bridge.incidentCount} strikes
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{bridge.location}</p>
      <div className="text-2xl font-bold text-red-600 mb-2">
        {bridge.clearanceFeet}
      </div>
      <div className="text-xs text-gray-500">
        Last incident: {bridge.lastIncident}
      </div>
    </div>
  );
}