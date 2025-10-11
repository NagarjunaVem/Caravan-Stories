// src/pages/PublicPortal.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import {
  Clock, Users, CheckCircle, AlertCircle, TrendingUp,
  Activity, RefreshCw, BarChart2, PieChart as PieChartIcon,
  FileText, Timer, Target, Zap, Eye, Shield, Info,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

// Toggle dummy vs live
const USE_DUMMY = false;

// Dummy response (matches your expected shape)
const DUMMY_RESPONSE = {
  success: true,
  stats: {
    employeeCount: 48,
    totalTickets: 1245,
    resolvedTickets: 875,
    pendingTickets: 120,
    inProgressTickets: 180,
    openTickets: 60,
    reopenedTickets: 20,
    overdueTickets: 25,
    resolutionRate: 70,
    avgResolutionTime: 36,
    ticketsLast30Days: 320,
    resolvedLast30Days: 290,
    ticketsByCategory: [
      { category: 'Roads', total: 220, resolved: 180, pending: 40 },
      { category: 'Water', total: 180, resolved: 140, pending: 40 },
      { category: 'Electricity', total: 210, resolved: 170, pending: 40 },
      { category: 'Sanitation', total: 150, resolved: 120, pending: 30 },
      { category: 'Public Safety', total: 120, resolved: 95, pending: 25 },
      { category: 'Transport', total: 90, resolved: 70, pending: 20 }
    ],
    ticketsByPriority: [
      { priority: 'Low', count: 280 },
      { priority: 'Medium', count: 520 },
      { priority: 'High', count: 320 },
      { priority: 'Urgent', count: 125 }
    ],
    dailyTrend: [
      { _id: '2025-10-04', created: 40, resolved: 35 },
      { _id: '2025-10-05', created: 45, resolved: 38 },
      { _id: '2025-10-06', created: 50, resolved: 42 },
      { _id: '2025-10-07', created: 55, resolved: 48 },
      { _id: '2025-10-08', created: 60, resolved: 50 },
      { _id: '2025-10-09', created: 35, resolved: 40 },
      { _id: '2025-10-10', created: 35, resolved: 37 }
    ],
    recentTickets: [
      { ticketId: 'TCKT-1001', title: 'Potholes on Main St', status: 'Resolved', priority: 'High', category: 'Roads', createdAt: '2025-10-09T09:14:00.000Z' },
      { ticketId: 'TCKT-1002', title: 'Water leak near market', status: 'In Progress', priority: 'Medium', category: 'Water', createdAt: '2025-10-09T12:30:00.000Z' },
      { ticketId: 'TCKT-1003', title: 'Streetlights not working', status: 'Open', priority: 'Low', category: 'Electricity', createdAt: '2025-10-08T18:47:00.000Z' },
      { ticketId: 'TCKT-1004', title: 'Garbage pile-up in Sector 5', status: 'Pending', priority: 'Medium', category: 'Sanitation', createdAt: '2025-10-08T07:22:00.000Z' },
      { ticketId: 'TCKT-1005', title: 'Traffic signal malfunction', status: 'Resolved', priority: 'High', category: 'Transport', createdAt: '2025-10-07T16:05:00.000Z' },
      { ticketId: 'TCKT-1006', title: 'Open manhole repair', status: 'Reopened', priority: 'Urgent', category: 'Public Safety', createdAt: '2025-10-07T10:10:00.000Z' },
      { ticketId: 'TCKT-1007', title: 'Sewage smell in lane 3', status: 'In Progress', priority: 'Medium', category: 'Sanitation', createdAt: '2025-10-06T14:55:00.000Z' },
      { ticketId: 'TCKT-1008', title: 'Broken pedestrian railing', status: 'Closed', priority: 'Low', category: 'Public Safety', createdAt: '2025-10-06T08:40:00.000Z' },
      { ticketId: 'TCKT-1009', title: 'Power outage in Block A', status: 'Resolved', priority: 'Urgent', category: 'Electricity', createdAt: '2025-10-05T20:31:00.000Z' },
      { ticketId: 'TCKT-1010', title: 'Roadside encroachment', status: 'Pending', priority: 'High', category: 'Roads', createdAt: '2025-10-05T06:12:00.000Z' }
    ],
    activeTickets: 380,
    completionRate: 91
  },
  timestamp: '2025-10-10T12:34:56.000Z'
};

const COLORS = {
  primary: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  status: {
    Resolved: '#10B981',
    Closed: '#059669',
    Pending: '#F59E0B',
    'In Progress': '#3B82F6',
    Open: '#06B6D4',
    Reopened: '#8B5CF6',
    Overdue: '#EF4444'
  },
  priority: {
    Low: '#10B981',
    Medium: '#F59E0B',
    High: '#F97316',
    Urgent: '#EF4444'
  }
};

const formatTime = (hours) => {
  if (!hours || hours === 0) return '0h';
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return `${days}d ${remainingHours}h`;
};

const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num?.toString() || '0';
};

const PublicPortal = () => {
  const { backendUrl } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/stats/public`, { params: { t: Date.now() } });
      if (response.data.success) {
        setStats(response.data.stats);
        setLastRefresh(new Date());
        setError(null);
      } else {
        setError(response.data.message || 'Failed to fetch stats');
        setStats(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (USE_DUMMY) {
      // Use dummy once and stop loading
      setStats(DUMMY_RESPONSE.stats);
      setLastRefresh(new Date(DUMMY_RESPONSE.timestamp || Date.now()));
      setError(null);
      setLoading(false);
      return;
    }

    // Live mode
    fetchStats();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchStats, 30000);
    }
    return () => interval && clearInterval(interval);
  }, [backendUrl, autoRefresh]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleManualRefresh = () => {
    if (USE_DUMMY) {
      setStats(DUMMY_RESPONSE.stats);
      setLastRefresh(new Date());
      return;
    }
    setLoading(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading transparency data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              handleManualRefresh();
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <Info className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Available</h2>
          <p className="text-gray-600">The system is ready to display statistics once data is available.</p>
        </div>
      </div>
    );
  }

  const safeStats = {
    resolutionRate: stats.resolutionRate || 0,
    resolvedTickets: stats.resolvedTickets || 0,
    totalTickets: stats.totalTickets || 0,
    avgResolutionTime: stats.avgResolutionTime || 0,
    pendingTickets: stats.pendingTickets || 0,
    inProgressTickets: stats.inProgressTickets || 0,
    openTickets: stats.openTickets || 0,
    reopenedTickets: stats.reopenedTickets || 0,
    overdueTickets: stats.overdueTickets || 0,
    employeeCount: stats.employeeCount || 0,
    ticketsLast30Days: stats.ticketsLast30Days || 0,
    resolvedLast30Days: stats.resolvedLast30Days || 0,
    completionRate: stats.completionRate || 0,
    activeTickets: stats.activeTickets || 0,
    ticketsByCategory: stats.ticketsByCategory || [],
    ticketsByPriority: stats.ticketsByPriority || [],
    dailyTrend: stats.dailyTrend || [],
    recentTickets: stats.recentTickets || []
  };

  const statusPieData = [
    { name: 'Resolved', value: safeStats.resolvedTickets, fill: COLORS.status['Resolved'] },
    { name: 'Pending', value: safeStats.pendingTickets, fill: COLORS.status['Pending'] },
    { name: 'In Progress', value: safeStats.inProgressTickets, fill: COLORS.status['In Progress'] },
    { name: 'Open', value: safeStats.openTickets, fill: COLORS.status['Open'] },
    { name: 'Reopened', value: safeStats.reopenedTickets, fill: COLORS.status['Reopened'] },
    { name: 'Overdue', value: safeStats.overdueTickets, fill: COLORS.status['Overdue'] }
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Public Transparency Portal
                </h1>
              </div>
              <p className="text-gray-600">
                Real-time complaint management statistics and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                <Clock className="w-4 h-4 inline mr-1" />
                {lastRefresh.toLocaleTimeString()}
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  autoRefresh
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={USE_DUMMY}
                title={USE_DUMMY ? 'Auto-refresh disabled in dummy mode' : 'Toggle live auto-refresh'}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh && !USE_DUMMY ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Live' : 'Paused'}
              </button>
              <button
                onClick={handleManualRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">
                {formatNumber(safeStats.totalTickets)}
              </span>
            </div>
            <h3 className="text-gray-700 font-semibold">Total Complaints</h3>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-gray-600">{safeStats.ticketsLast30Days} in last 30 days</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-green-600">
                {safeStats.resolutionRate}%
              </span>
            </div>
            <h3 className="text-gray-700 font-semibold">Resolution Rate</h3>
            <div className="mt-2 flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-gray-600">{safeStats.resolvedTickets} resolved</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Timer className="w-8 h-8 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {formatTime(safeStats.avgResolutionTime)}
              </span>
            </div>
            <h3 className="text-gray-700 font-semibold">Avg Resolution Time</h3>
            <div className="mt-2 flex items-center text-sm">
              <Clock className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-gray-600">Based on last 30 days</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">
                {safeStats.employeeCount}
              </span>
            </div>
            <h3 className="text-gray-700 font-semibold">Active Staff</h3>
            <div className="mt-2 flex items-center text-sm">
              <Zap className="w-4 h-4 text-purple-500 mr-1" />
              <span className="text-gray-600">Available to handle complaints</span>
            </div>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatusCard label="Pending" color="bg-yellow-500" value={safeStats.pendingTickets} />
          <StatusCard label="In Progress" color="bg-blue-500" value={safeStats.inProgressTickets} />
          <StatusCard label="Open" color="bg-cyan-500" value={safeStats.openTickets} />
          <StatusCard label="Resolved" color="bg-green-500" value={safeStats.resolvedTickets} />
          <StatusCard label="Reopened" color="bg-purple-500" value={safeStats.reopenedTickets} />
          <StatusCard label="Overdue" color="bg-red-500" value={safeStats.overdueTickets} />
        </div>

        {/* Charts */}
        {safeStats.totalTickets > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-blue-600" />
                  Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {safeStats.dailyTrend.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    7-Day Activity Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={safeStats.dailyTrend}>
                      <defs>
                        <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="_id"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        stroke="#9CA3AF"
                      />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="created" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCreated)" name="New Complaints" strokeWidth={2} />
                      <Area type="monotone" dataKey="resolved" stroke="#10B981" fillOpacity={1} fill="url(#colorResolved)" name="Resolved" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {safeStats.ticketsByCategory.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-blue-600" />
                    Complaints by Category
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={safeStats.ticketsByCategory} margin={{ bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="resolved" stackId="a" fill="#10B981" name="Resolved" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {safeStats.ticketsByPriority.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                    Priority Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={safeStats.ticketsByPriority}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="priority" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {safeStats.ticketsByPriority.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.priority[entry.priority] || COLORS.primary[index % COLORS.primary.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {safeStats.recentTickets.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Recent Complaints
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeStats.recentTickets.map((ticket, index) => (
                        <tr key={ticket.ticketId} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm text-gray-600">{ticket.ticketId}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-800 font-medium truncate block max-w-xs">{ticket.title}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">{ticket.category}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              ticket.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                              ticket.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                              ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'bg-green-100 text-green-700' :
                              ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                              ticket.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                              ticket.status === 'Reopened' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Info Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p className="mt-1">Data refreshes automatically every 30 seconds when auto-refresh is enabled.</p>
        </div>
      </div>
    </div>
  );
};

function StatusCard({ label, color, value }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 ${color} rounded-full`}></div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

export default PublicPortal;