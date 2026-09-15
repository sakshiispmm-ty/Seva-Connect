import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import NotificationBell from '../../../components/NotificationBell';
import DateRangeFilter from '../../../components/DateRangeFilter';
import SummaryCard from '../../../components/charts/SummaryCard';
import TrendChart from '../../../components/charts/TrendChart';
import BreakdownChart from '../../../components/charts/BreakdownChart';
import { reportService } from '../../../services/api';
import {
  Menu,
  Gift,
  TrendingUp,
  CreditCard,
  Package,
  ArrowLeft,
  RefreshCw,
  Search,
  Download,
  IndianRupee,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

export default function DonationReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [groupBy, setGroupBy] = useState('day');
  const [searchQuery, setSearchQuery] = useState('');

  const [summary, setSummary] = useState({
    totalDonations: 0,
    totalMoneyAmount: 0,
    totalMoneyCount: 0,
    totalItemCount: 0,
    averageDonation: 0,
    moneyVsItemSplit: { moneyCount: 0, itemCount: 0, moneyPercent: 0, itemPercent: 0 },
    statusCounts: { pending: 0, verified: 0, completed: 0, rejected: 0 }
  });

  const [trendData, setTrendData] = useState([]);
  const [campaignReport, setCampaignReport] = useState([]);

  const loadAllReports = async (params = dateRange, period = groupBy) => {
    setLoading(true);
    try {
      const [sumRes, trendRes, campRes] = await Promise.all([
        reportService.getDonationSummary(params),
        reportService.getDonationsByPeriod({ ...params, groupBy: period }),
        reportService.getDonationsByCampaign(params)
      ]);

      if (sumRes.data?.success) setSummary(sumRes.data.data);
      if (trendRes.data?.success) setTrendData(trendRes.data.data || []);
      if (campRes.data?.success) setCampaignReport(campRes.data.data || []);
    } catch (err) {
      console.error('Failed to load donation reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReports();
  }, []);

  const handleDateChange = (newRange) => {
    setDateRange(newRange);
    loadAllReports(newRange, groupBy);
  };

  const handlePeriodChange = (newGroupBy) => {
    setGroupBy(newGroupBy);
    loadAllReports(dateRange, newGroupBy);
  };

  const filteredCampaigns = campaignReport.filter(c =>
    c.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['Campaign Title', 'Category', 'Status', 'Goal Amount', 'Total Collected', 'Total Donations', 'Money Don.', 'Item Don.', 'Progress %'];
    const rows = filteredCampaigns.map(c => [
      `"${c.campaignTitle.replace(/"/g, '""')}"`,
      c.category,
      c.status,
      c.goalAmount,
      c.totalCollected,
      c.totalDonationsCount,
      c.moneyCount,
      c.itemCount,
      `${c.progressPercent}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SevaConnect_Donations_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const splitData = [
    { name: 'Monetary Funds', value: summary.moneyVsItemSplit.moneyCount, color: '#087F73' },
    { name: 'Physical Relief Goods', value: summary.moneyVsItemSplit.itemCount, color: '#F7BA3E' }
  ];

  return (
    <div className="min-h-screen bg-[#EAF6F3]/40 flex flex-col lg:flex-row">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="Admin" />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-[#667085] hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/analytics"
                  className="text-xs font-bold text-[#087F73] hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Analytics Hub
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-xs text-[#667085]">Donations</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#17243A] tracking-tight">
                Donation Reports & Trends
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#17243A] bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              title="Export as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={() => loadAllReports()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#087F73] bg-[#EAF6F3] hover:bg-[#087F73] hover:text-white rounded-xl transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <NotificationBell align="right" />
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Filter */}
          <DateRangeFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={handleDateChange}
            onReset={() => handleDateChange({ startDate: '', endDate: '' })}
          />

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Total Monetary Relief"
              value={`₹${(summary.totalMoneyAmount || 0).toLocaleString('en-IN')}`}
              subtext="Verified & completed contributions"
              icon={TrendingUp}
              colorScheme="teal"
            />
            <SummaryCard
              label="Total Contributions"
              value={(summary.totalDonations || 0).toLocaleString()}
              subtext={`${summary.totalMoneyCount} Money · ${summary.totalItemCount} Items`}
              icon={Gift}
              colorScheme="emerald"
            />
            <SummaryCard
              label="Avg. Contribution"
              value={`₹${(summary.averageDonation || 0).toLocaleString('en-IN')}`}
              subtext="Average completed monetary pledge"
              icon={IndianRupee}
              colorScheme="amber"
            />
            <SummaryCard
              label="Verification Ratio"
              value={`${summary.totalDonations > 0 ? Math.round(((summary.statusCounts.completed + summary.statusCounts.verified) / summary.totalDonations) * 100) : 0}%`}
              subtext={`${summary.statusCounts.completed + summary.statusCounts.verified} verified out of ${summary.totalDonations}`}
              icon={CheckCircle2}
              colorScheme="blue"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trend Chart (2 columns) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#17243A]">
                    Contribution Trends Over Time
                  </h3>
                  <p className="text-xs text-[#667085] mt-0.5">
                    Temporal distribution grouped by chosen time window
                  </p>
                </div>
                <div className="inline-flex rounded-xl bg-gray-100 p-1">
                  {['day', 'week', 'month'].map((g) => (
                    <button
                      key={g}
                      onClick={() => handlePeriodChange(g)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-all ${
                        groupBy === g
                          ? 'bg-white text-[#087F73] shadow-xs'
                          : 'text-[#667085] hover:text-[#17243A]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

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
            </div>

            {/* Split Chart (1 column) */}
            <BreakdownChart
              title="Donation Channel Split"
              subtitle="Cash contributions vs. physical relief supplies"
              data={splitData}
              dataKey="value"
              nameKey="name"
              height={240}
              colors={['#087F73', '#F7BA3E']}
            />
          </div>

          {/* Donations Grouped by Campaign Table */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#17243A]">
                  Donations Broken Down by Campaign
                </h3>
                <p className="text-xs text-[#667085] mt-0.5">
                  Aggregate financial and physical support received across all causes
                </p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campaign or category..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#087F73] text-[#17243A]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#17243A]">
                <thead className="bg-[#EAF6F3]/50 text-[#667085] uppercase tracking-wider text-[11px] font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Campaign Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Goal Target</th>
                    <th className="py-3 px-4 text-right">Collected (Funds)</th>
                    <th className="py-3 px-4 text-center">Progress %</th>
                    <th className="py-3 px-4 text-center">Donations Count</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-[#667085]">
                        No matching campaign donation records found.
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((c) => (
                      <tr key={c.campaignId} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#17243A]">
                          {c.campaignTitle}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#087F73] border border-teal-200/50">
                            {c.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          ₹{Number(c.goalAmount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-[#087F73]">
                          ₹{Number(c.totalCollected).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#087F73] rounded-full"
                                style={{ width: `${Math.min(c.progressPercent, 100)}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold">{c.progressPercent}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold">{c.totalDonationsCount}</span>{' '}
                          <span className="text-[10px] text-[#667085]">
                            ({c.moneyCount} M / {c.itemCount} I)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : c.status === 'Completed'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
