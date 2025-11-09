import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Users, TrendingUp, Clock, Trophy, Upload, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import StatisticsDashboard from '../components/StatisticsDashboard';
import {
  mockIncidents,
  mockActivityFeed,
  mockLeaderboard
} from '../data/mockCommunityData';
import 'leaflet/dist/leaflet.css';

export default function CommunityDashboardPage() {
  const [selectedTab, setSelectedTab] = useState('overview'); // overview, stats, contribute

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Community Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Real-time crowdsourced intelligence from thousands of drivers
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <TabButton
            active={selectedTab === 'overview'}
            onClick={() => setSelectedTab('overview')}
            icon={<Users className="w-5 h-5" />}
          >
            Community Overview
          </TabButton>
          <TabButton
            active={selectedTab === 'stats'}
            onClick={() => setSelectedTab('stats')}
            icon={<TrendingUp className="w-5 h-5" />}
          >
            Statistics & Charts
          </TabButton>
          <TabButton
            active={selectedTab === 'contribute'}
            onClick={() => setSelectedTab('contribute')}
            icon={<Upload className="w-5 h-5" />}
          >
            Contribute
          </TabButton>
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && <OverviewTab />}
      {selectedTab === 'stats' && <StatisticsDashboard />}
      {selectedTab === 'contribute' && <ContributeTab />}
    </div>
  );
}

// Tab Button Component
function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 px-1 border-b-2 font-medium transition-colors flex items-center space-x-2 ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

// Overview Tab
function OverviewTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Heat Map + Live Feed */}
      <div className="lg:col-span-2 space-y-8">
        {/* Incident Heat Map */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Incident Heat Map</h2>
            <p className="text-sm text-gray-600">Where bridge strikes occur</p>
          </div>
          <div style={{ height: '400px' }}>
            <IncidentHeatMap incidents={mockIncidents} />
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Live Activity Feed
              </h2>
              <p className="text-sm text-gray-600">Real-time community contributions</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Live</span>
            </div>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {mockActivityFeed.map((activity) => (
              <ActivityFeedItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Leaderboard */}
      <div className="space-y-8">
        <Leaderboard />
      </div>
    </div>
  );
}

// Incident Heat Map Component
function IncidentHeatMap({ incidents }) {
  // Center on US
  const center = [39.8283, -98.5795];

  return (
    <MapContainer
      center={center}
      zoom={4}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {incidents.map((incident) => (
        <CircleMarker
          key={incident.id}
          center={[incident.latitude, incident.longitude]}
          radius={8}
          fillColor="#ef4444"
          color="#dc2626"
          weight={2}
          opacity={0.8}
          fillOpacity={0.6}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-sm">{incident.bridge_name}</h3>
              <p className="text-xs text-gray-600 mt-1">
                {new Date(incident.date).toLocaleDateString()}
              </p>
              <p className="text-xs mt-1">
                Vehicle: {Math.floor(incident.vehicle_height/12)}'{incident.vehicle_height%12}"
              </p>
              <p className="text-xs">
                Severity: <span className="font-semibold capitalize">{incident.damage_severity}</span>
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

// Activity Feed Item Component
function ActivityFeedItem({ activity }) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{activity.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">
            <span className="font-semibold">{activity.user}</span>
            {' '}{activity.action}{' '}
            <span className="font-semibold">{activity.bridge}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

// Leaderboard Component
function Leaderboard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
          Top Contributors
        </h2>
        <p className="text-sm text-gray-600">Community leaderboard</p>
      </div>
      <div className="divide-y divide-gray-200">
        {mockLeaderboard.map((user) => (
          <LeaderboardItem key={user.rank} user={user} />
        ))}
      </div>
    </div>
  );
}

// Leaderboard Item Component
function LeaderboardItem({ user }) {
  const medals = {
    1: '🥇',
    2: '🥈',
    3: '🥉'
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="text-2xl w-8 text-center">
          {medals[user.rank] || `#${user.rank}`}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {user.username}
          </p>
          <p className="text-xs text-gray-600">
            {user.contributions} contributions
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-blue-600">
            {user.trust_score}%
          </div>
          <div className="text-xs text-gray-500">trust</div>
        </div>
      </div>
    </div>
  );
}

// Contribute Tab
function ContributeTab() {
  const [selectedContribution, setSelectedContribution] = useState(null);

  const contributionTypes = [
    {
      id: 'verify',
      title: 'Verify Bridge Clearance',
      description: 'Confirm the clearance of a bridge you just passed',
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'blue'
    },
    {
      id: 'report',
      title: 'Report Strike Incident',
      description: 'Report a bridge strike you witnessed or experienced',
      icon: '🚨',
      color: 'red'
    },
    {
      id: 'photo',
      title: 'Upload Bridge Photo',
      description: 'Add photos of bridges and clearance signs',
      icon: '📸',
      color: 'green'
    },
    {
      id: 'update',
      title: 'Report Clearance Change',
      description: 'Alert us to changed or incorrect clearance data',
      icon: '⚠️',
      color: 'orange'
    }
  ];

  return (
    <div>
      {!selectedContribution ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contributionTypes.map((type) => (
            <ContributionCard
              key={type.id}
              type={type}
              onClick={() => setSelectedContribution(type.id)}
            />
          ))}
        </div>
      ) : (
        <ContributionForm
          type={selectedContribution}
          onBack={() => setSelectedContribution(null)}
        />
      )}

      {/* Why Contribute */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Why Your Contributions Matter
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-4xl mb-2">🛡️</div>
            <h4 className="font-bold text-gray-900 mb-2">Save Lives</h4>
            <p className="text-sm text-gray-700">
              Your reports help prevent future bridge strikes and save drivers from disasters
            </p>
          </div>
          <div>
            <div className="text-4xl mb-2">📊</div>
            <h4 className="font-bold text-gray-900 mb-2">Improve Data</h4>
            <p className="text-sm text-gray-700">
              Community verification makes our bridge database more accurate for everyone
            </p>
          </div>
          <div>
            <div className="text-4xl mb-2">⭐</div>
            <h4 className="font-bold text-gray-900 mb-2">Build Trust</h4>
            <p className="text-sm text-gray-700">
              Earn trust points and climb the leaderboard as a valued community member
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Contribution Card Component
function ContributionCard({ type, onClick }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    red: 'bg-red-50 border-red-200 hover:border-red-400',
    green: 'bg-green-50 border-green-200 hover:border-green-400',
    orange: 'bg-orange-50 border-orange-200 hover:border-orange-400'
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[type.color]} border-2 rounded-xl p-6 text-left transition-all hover:shadow-lg`}
    >
      <div className="flex items-start space-x-4">
        <div className="text-4xl">{typeof type.icon === 'string' ? type.icon : type.icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{type.title}</h3>
          <p className="text-sm text-gray-700">{type.description}</p>
        </div>
      </div>
      <div className="mt-4 text-right">
        <span className="text-sm font-medium text-gray-600">Click to contribute →</span>
      </div>
    </button>
  );
}

// Contribution Form Component
function ContributionForm({ type, onBack }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Thank You for Contributing!
        </h2>
        <p className="text-gray-600 mb-6">
          Your contribution helps make roads safer for everyone.
        </p>
        <div className="inline-flex items-center space-x-2 text-sm text-green-600 font-medium">
          <span>+10 Trust Points Earned</span>
          <span>⭐</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-4"
        >
          ← Back to contributions
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {type === 'verify' && 'Verify Bridge Clearance'}
          {type === 'report' && 'Report Strike Incident'}
          {type === 'photo' && 'Upload Bridge Photo'}
          {type === 'update' && 'Report Clearance Change'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bridge Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bridge Location
          </label>
          <input
            type="text"
            placeholder="Enter bridge name or location"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {type === 'verify' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Clearance Height
              </label>
              <input
                type="text"
                placeholder="e.g., 13'6\"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo of Clearance Sign (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        )}

        {type === 'report' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Height
              </label>
              <input
                type="text"
                placeholder="e.g., 13'6\"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Damage Severity
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Minor (scrapes)</option>
                <option>Moderate (dents, equipment damage)</option>
                <option>Severe (roof damage, structural)</option>
                <option>Catastrophic (total loss)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incident Photos
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        )}

        {type === 'photo' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photos
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Please include photos of clearance signs and bridge approaches
            </p>
          </div>
        )}

        {type === 'update' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Listed Clearance
              </label>
              <input
                type="text"
                placeholder="What we currently show"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Clearance
              </label>
              <input
                type="text"
                placeholder="What it actually is"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </>
        )}

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            rows="4"
            placeholder="Any additional information..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Submit Contribution
          </button>
        </div>
      </form>
    </div>
  );
}