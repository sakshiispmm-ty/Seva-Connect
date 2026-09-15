import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reportService } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';
import DateRangeFilter from '../../components/DateRangeFilter';
import SummaryCard from '../../components/charts/SummaryCard';
import TrendChart from '../../components/charts/TrendChart';
import BreakdownChart from '../../components/charts/BreakdownChart';
import {
  Menu,
  BarChart3,
  TrendingUp,
  Gift,
  HeartHandshake,
  Megaphone,
  Users,
  UserCheck,
  Package,
  FileText,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Calendar
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [trendGroupBy, setTrendGroupBy] = useState('day');
  const [trendData, setTrendData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    summaryCards: {
      totalDonations: 0,
      totalMoneyAmount: 0,
      activeCampaigns: 0,
      totalVolunteers: 0,
      activeVolunteers: 0,
      totalBeneficiaries: 0,
      lowStockCount: 0,
      pendingRequestsCount: 0
    },
    donationTrend: [],
    donationTypeSplit: { moneyCount: 0, itemCount: 0, moneyPercent: 0, itemPercent: 0 },
    campaignComparison: [],
    requestStatusBreakdown: [],
    inventoryCategoryBreakdown: []
  });

  const fetchDashboardData = async (params = dateRange) => {
    setLoading(true);
    setError('');
    try {
      const res = await reportService.getDashboardPayload(params);
      if (res.data?.success) {
        setDashboardData(res.data.data);
        setTrendData(res.data.data.donationTrend || []);
      }
    } catch (err) {
      console.error('Failed to load analytics dashboard payload:', err);
      setError('Could not load analytics reports. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = async (groupBy) => {
    setTrendGroupBy(groupBy);
    setTrendLoading(true);
    try {
      const res = await reportService.getDonationsByPeriod({
        ...dateRange,
        groupBy
      });
      if (res.data?.success) {
        setTrendData(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to update period trend:', err);
    } finally {
      setTrendLoading(false);
    }
  };

  const handleDateFilterChange = (newRange) => {
    setDateRange(newRange);
    fetchDashboardData(newRange);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const {
    summaryCards,
    donationTypeSplit,
    campaignComparison,
    requestStatusBreakdown,
    inventoryCategoryBreakdown
  } = dashboardData;

  const donationSplitData = [
    { name: 'Monetary Funds', value: donationTypeSplit.moneyCount || 0, color: '#087F73' },
    { name: 'Physical Relief Items', value: donationTypeSplit.itemCount || 0, color: '#F7BA3E' }
  ];

  return (
    <div className="min-h-screen bg-[#EAF6F3]/40 flex flex-col lg:flex-row">
      {/* Responsive Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role="Admin"
      />

      {/* Main Workspace Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-[#667085] hover:bg-gray-100 lg:hidden focus:outline-hidden"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#087F73] bg-[#EAF6F3] px-2.5 py-0.5 rounded-full border border-[#087F73]/20">
                  Version 2.2
                </span>
                <span className="text-xs text-[#667085] hidden sm:inline">Executive Reporting</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#17243A] tracking-tight">
                Reports & Analytics Hub
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => fetchDashboardData(dateRange)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#087F73] bg-[#EAF6F3] hover:bg-[#087F73] hover:text-white rounded-xl transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <NotificationBell align="right" />
          </div>
        </header>

        {/* Workspace Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Hero Banner with Quick Links */}
          <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#17243A] via-[#0B3A36] to-[#087F73] text-white shadow-md border border-teal-500/20 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-[#F7BA3E] border border-[#F7BA3E]/30 rounded-full text-xs font-extrabold backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Version 2.2: Reports & Analytics Suite</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Real-Time Operational Intelligence
                </h2>
                <p className="text-xs sm:text-sm text-teal-100/85 leading-relaxed">
                  Consolidated multi-dimensional insights across contributions, relief campaigns, volunteer task velocity, community assistance fulfillment, and warehouse resource inventories.
                </p>
              </div>

              {/* Fast Report Shortcuts */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 shrink-0">
                <Link
                  to="/admin/reports/donations"
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/10 transition-all text-center"
                >
                  Donation Report →
                </Link>
                <Link
                  to="/admin/reports/campaigns"
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/10 transition-all text-center"
                >
                  Campaign Analytics →
                </Link>
                <Link
                  to="/admin/reports/volunteers"
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/10 transition-all text-center"
                >
                  Volunteer Report →
                </Link>
                <Link
                  to="/admin/reports/beneficiaries"
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/10 transition-all text-center"
                >
                  Beneficiary Report →
                </Link>
                <Link
                  to="/admin/reports/inventory"
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/10 transition-all text-center col-span-2 sm:col-span-2"
                >
                  Inventory & Low Stock →
                </Link>
              </div>
            </div>
          </div>

          {/* Global Date Range Filter */}
          <DateRangeFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={handleDateFilterChange}
            onReset={() => handleDateFilterChange({ startDate: '', endDate: '' })}
          />

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
              {error}
            </div>
          )}

          {/* 8 Primary KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Total Monetary Relief"
              value={`₹${(summaryCards.totalMoneyAmount || 0).toLocaleString('en-IN')}`}
              subtext="Verified & completed funds"
              icon={TrendingUp}
              colorScheme="teal"
              badge="Total"
            />
            <SummaryCard
              label="Total Donations"
              value={(summaryCards.totalDonations || 0).toLocaleString()}
              subtext="Monetary & item pledges"
              icon={Gift}
              colorScheme="emerald"
            />
            <SummaryCard
              label="Active Campaigns"
              value={(summaryCards.activeCampaigns || 0).toLocaleString()}
              subtext="Public causes accepting funds"
              icon={Megaphone}
              colorScheme="amber"
            />
            <SummaryCard
              label="Registered Volunteers"
              value={(summaryCards.totalVolunteers || 0).toLocaleString()}
              subtext={`${summaryCards.activeVolunteers || 0} currently active`}
              icon={UserCheck}
              colorScheme="blue"
            />
            <SummaryCard
              label="Beneficiaries Served"
              value={(summaryCards.totalBeneficiaries || 0).toLocaleString()}
              subtext="Verified individuals / groups"
              icon={Users}
              colorScheme="purple"
            />
            <SummaryCard
              label="Pending Assistance"
              value={(summaryCards.pendingRequestsCount || 0).toLocaleString()}
              subtext="Awaiting review or dispatch"
              icon={FileText}
              colorScheme={summaryCards.pendingRequestsCount > 0 ? 'amber' : 'teal'}
              badge={summaryCards.pendingRequestsCount > 0 ? 'Needs Review' : 'Clear'}
            />
            <SummaryCard
              label="Low Stock Alerts"
              value={(summaryCards.lowStockCount || 0).toLocaleString()}
              subtext="Items below reorder threshold"
              icon={AlertTriangle}
              colorScheme={summaryCards.lowStockCount > 0 ? 'amber' : 'emerald'}
              badge={summaryCards.lowStockCount > 0 ? 'Restock Soon' : 'Healthy'}
            />
            <SummaryCard
              label="System Operations"
              value="Healthy"
              subtext="100% active uptime & failover"
              icon={HeartHandshake}
              colorScheme="navy"
            />
          </div>

          {/* Primary Charts Row: Donation Trend & Donation Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trend Chart (2 columns) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#17243A]">
                    Donation Volume & Velocity Trend
                  </h3>
                  <p className="text-xs text-[#667085] mt-0.5">
                    Total financial contributions recorded across selected timeframe
                  </p>
                </div>

                {/* Group By Switcher */}
                <div className="inline-flex rounded-xl bg-gray-100 p-1 self-start sm:self-auto">
                  {['day', 'week', 'month'].map((g) => (
                    <button
                      key={g}
                      onClick={() => handlePeriodChange(g)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-all ${
                        trendGroupBy === g
                          ? 'bg-white text-[#087F73] shadow-xs'
                          : 'text-[#667085] hover:text-[#17243A]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {trendLoading ? (
                <div className="h-[280px] flex items-center justify-center text-xs text-[#667085]">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#087F73] mr-2" />
                  Updating trend data...
                </div>
              ) : (
                <TrendChart
                  data={trendData}
                  dataKey="moneyAmount"
                  xKey="period"
                  type="area"
                  color="#087F73"
                  height={280}
                  moneyFormat={true}
                  className="border-0 p-0 shadow-none"
                />
              )}
            </div>

            {/* Donation Type Breakdown Donut (1 column) */}
            <BreakdownChart
              title="Donation Channel Split"
              subtitle="Monetary funds vs. physical relief items"
              data={donationSplitData}
              dataKey="value"
              nameKey="name"
              height={220}
              colors={['#087F73', '#F7BA3E']}
            />
          </div>

          {/* Secondary Charts Row: Campaign Goal vs Collected & Assistance Request Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Performance Bar Chart */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#17243A]">
                    Campaign Performance (Top Causes)
                  </h3>
                  <p className="text-xs text-[#667085] mt-0.5">
                    Goal target vs. funds collected for prominent campaigns
                  </p>
                </div>
                <Link
                  to="/admin/reports/campaigns"
                  className="text-xs font-bold text-[#087F73] hover:underline inline-flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="h-[260px] w-full">
                {campaignComparison.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#667085]">
                    No campaign data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaignComparison} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: '#667085' }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#667085' }}
                        tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          `₹${Number(value).toLocaleString('en-IN')}`,
                          name === 'goal' ? 'Target Goal' : 'Amount Collected'
                        ]}
                      />
                      <Bar dataKey="goal" fill="#E2E8F0" name="goal" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="collected" fill="#087F73" name="collected" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Assistance Request Pipeline Status */}
            <BreakdownChart
              title="Community Assistance Pipeline"
              subtitle="Distribution of beneficiary requests across workflow statuses"
              data={requestStatusBreakdown.map((r) => ({ name: r.name, value: r.count, color: r.color }))}
              dataKey="value"
              nameKey="name"
              height={220}
              colors={['#3B82F6', '#F7BA3E', '#8B5CF6', '#2EAD62', '#EF4444']}
            />
          </div>

          {/* Deep-Dive Reports Portal Grid */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#17243A]">
                Comprehensive Dedicated Reports Suite
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF6F3] text-[#087F73]">
                5 Granular Views
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Link
                to="/admin/reports/donations"
                className="p-5 rounded-2xl bg-white border border-gray-200/80 hover:border-[#087F73] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#087F73] flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <Gift className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#17243A] group-hover:text-[#087F73] transition-colors">
                    Donation Reports
                  </h4>
                  <p className="text-xs text-[#667085] mt-1">
                    Temporal trends, payment splits, and contributions by campaign.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#087F73] inline-flex items-center gap-1 mt-3">
                  Inspect Report →
                </span>
              </Link>

              <Link
                to="/admin/reports/campaigns"
                className="p-5 rounded-2xl bg-white border border-gray-200/80 hover:border-[#087F73] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#17243A] group-hover:text-[#087F73] transition-colors">
                    Campaign Analytics
                  </h4>
                  <p className="text-xs text-[#667085] mt-1">
                    Goal progress %, collection velocity, and cause comparison.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#087F73] inline-flex items-center gap-1 mt-3">
                  Inspect Report →
                </span>
              </Link>

              <Link
                to="/admin/reports/volunteers"
                className="p-5 rounded-2xl bg-white border border-gray-200/80 hover:border-[#087F73] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#17243A] group-hover:text-[#087F73] transition-colors">
                    Volunteer Reports
                  </h4>
                  <p className="text-xs text-[#667085] mt-1">
                    Active availability, task completion rates, and individual workloads.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#087F73] inline-flex items-center gap-1 mt-3">
                  Inspect Report →
                </span>
              </Link>

              <Link
                to="/admin/reports/beneficiaries"
                className="p-5 rounded-2xl bg-white border border-gray-200/80 hover:border-[#087F73] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#17243A] group-hover:text-[#087F73] transition-colors">
                    Beneficiary Reports
                  </h4>
                  <p className="text-xs text-[#667085] mt-1">
                    Assistance demand by category, urgency breakdown, and fulfillment rate.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#087F73] inline-flex items-center gap-1 mt-3">
                  Inspect Report →
                </span>
              </Link>

              <Link
                to="/admin/reports/inventory"
                className="p-5 rounded-2xl bg-white border border-gray-200/80 hover:border-[#087F73] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <Package className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#17243A] group-hover:text-[#087F73] transition-colors">
                    Inventory Reports
                  </h4>
                  <p className="text-xs text-[#667085] mt-1">
                    Stock balance, distributed relief goods, low-stock roster, and history logs.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#087F73] inline-flex items-center gap-1 mt-3">
                  Inspect Report →
                </span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
