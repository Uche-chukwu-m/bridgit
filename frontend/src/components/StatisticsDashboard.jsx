import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Users, Shield, AlertTriangle } from 'lucide-react';
import {
  mockStrikesByMonth,
  mockBridgesByRisk,
  mockTopProblemBridges,
  mockCommunityGrowth,
  mockUserStats
} from '../data/mockCommunityData';

export default function StatisticsDashboard() {
  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Shield className="w-6 h-6" />}
          title="Strikes Prevented"
          value="294"
          subtitle="This month"
          color="green"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Active Users"
          value="18,900"
          subtitle="+32% from last month"
          color="blue"
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6" />}
          title="Bridges Monitored"
          value="234"
          subtitle="Across 15 states"
          color="orange"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Strike Reduction"
          value="74%"
          subtitle="Since launch"
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strike Trends */}
        <ChartCard title="Bridge Strikes Over Time" subtitle="Actual vs Prevented">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockStrikesByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="strikes"
                stroke="#ef4444"
                strokeWidth={2}
                name="Actual Strikes"
              />
              <Line
                type="monotone"
                dataKey="prevented"
                stroke="#22c55e"
                strokeWidth={2}
                name="Prevented by App"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Risk Distribution */}
        <ChartCard title="Bridges by Risk Level" subtitle="Current distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockBridgesByRisk}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {mockBridgesByRisk.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Problem Bridges */}
        <ChartCard title="Most Dangerous Bridges" subtitle="By incident count">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockTopProblemBridges} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="strikes" fill="#ef4444" name="Total Strikes" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Community Growth */}
        <ChartCard title="Community Growth" subtitle="Users and bridges tracked">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockCommunityGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Active Users"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bridges"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Bridges Tracked"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Your Impact */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Impact</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <ImpactMetric
            label="Warnings Received"
            value={mockUserStats.warnings_received}
            icon="⚠️"
          />
          <ImpactMetric
            label="Strikes Prevented"
            value={mockUserStats.strikes_prevented}
            icon="🛡️"
          />
          <ImpactMetric
            label="Bridges Verified"
            value={mockUserStats.bridges_verified}
            icon="✅"
          />
          <ImpactMetric
            label="Photos Uploaded"
            value={mockUserStats.photos_uploaded}
            icon="📸"
          />
          <ImpactMetric
            label="Days Active"
            value={mockUserStats.days_active}
            icon="📅"
          />
          <ImpactMetric
            label="Trust Score"
            value={`${mockUserStats.trust_score}%`}
            icon="⭐"
          />
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, subtitle, color }) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-900 mb-1">{title}</div>
      <div className="text-xs text-gray-600">{subtitle}</div>
    </div>
  );
}

// Chart Card Component
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

// Impact Metric Component
function ImpactMetric({ label, value, icon }) {
  return (
    <div className="text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
}