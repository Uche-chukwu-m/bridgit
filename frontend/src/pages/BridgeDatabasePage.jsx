import React, { useState, useMemo } from 'react';
import { Search, Filter, MapPin, AlertTriangle, TrendingUp } from 'lucide-react';
import { mockBridges } from '../data/mockBridges';

export default function BridgeDatabasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, safe, caution, high-risk, critical
  const [sortBy, setSortBy] = useState('incidents'); // incidents, clearance, name

  // Filter and sort bridges
  const filteredBridges = useMemo(() => {
    let result = [...mockBridges];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(bridge =>
        bridge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bridge.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(bridge => bridge.status === filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'incidents') {
        return b.incidentCount - a.incidentCount;
      } else if (sortBy === 'clearance') {
        return a.clearanceInches - b.clearanceInches;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [searchQuery, filterStatus, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bridge Database
        </h1>
        <p className="text-lg text-gray-600">
          Comprehensive clearance data for {mockBridges.length} bridges
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bridges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter by Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="safe">Safe</option>
              <option value="caution">Caution</option>
              <option value="high-risk">High Risk</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="incidents">Most Incidents</option>
              <option value="clearance">Lowest Clearance</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredBridges.length} of {mockBridges.length} bridges
        </div>
      </div>

      {/* Bridge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBridges.map((bridge) => (
          <BridgeCard key={bridge.id} bridge={bridge} />
        ))}
      </div>

      {/* Empty State */}
      {filteredBridges.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No bridges found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

// Bridge Card Component
function BridgeCard({ bridge }) {
  const statusColors = {
    'safe': 'bg-green-100 text-green-800 border-green-300',
    'caution': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'high-risk': 'bg-orange-100 text-orange-800 border-orange-300',
    'critical': 'bg-red-100 text-red-800 border-red-300'
  };

  const statusIcons = {
    'safe': '✅',
    'caution': '⚠️',
    'high-risk': '⚠️',
    'critical': '🚫'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
      {/* Status Banner */}
      <div className={`px-4 py-2 border-b border-gray-200 ${statusColors[bridge.status]}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold uppercase flex items-center">
            <span className="mr-2">{statusIcons[bridge.status]}</span>
            {bridge.status.replace('-', ' ')}
          </span>
          {bridge.incidentCount > 0 && (
            <span className="text-xs font-semibold">
              {bridge.incidentCount} strikes
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {bridge.name}
        </h3>
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          {bridge.location}
        </div>

        {/* Clearance */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {bridge.clearanceFeet}
            </div>
            <div className="text-sm text-gray-600">
              Clearance Height
            </div>
          </div>
        </div>

        {/* Warnings */}
        {bridge.warnings && bridge.warnings.length > 0 && (
          <div className="space-y-2">
            {bridge.warnings.slice(0, 2).map((warning, idx) => (
              <div key={idx} className="flex items-start text-xs text-orange-700 bg-orange-50 rounded p-2">
                <AlertTriangle className="w-3 h-3 mr-2 flex-shrink-0 mt-0.5" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {bridge.incidentCount}
              </div>
              <div className="text-xs text-gray-600">Incidents</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {bridge.lastIncident ? new Date(bridge.lastIncident).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'None'}
              </div>
              <div className="text-xs text-gray-600">Last Strike</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4">
          <button className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors text-sm">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}
