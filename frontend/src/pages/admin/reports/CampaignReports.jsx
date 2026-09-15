import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import NotificationBell from '../../../components/NotificationBell';
import DateRangeFilter from '../../../components/DateRangeFilter';
import SummaryCard from '../../../components/charts/SummaryCard';
import { reportService } from '../../../services/api';
import {
  Menu,
  Megaphone,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RefreshCw,
  Search,
  Download,
  Filter,
  Eye,
  X,
  IndianRupee
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function CampaignReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [summaryData, setSummaryData] = useState({
    statusCounts: { active: 0, completed: 0, closed: 0, total: 0 },
    overallGoalVsCollected: { totalGoal: 0, totalCollected: 0, overallProgressPercent: 0 },
    topByAmount: [],
    topByProgress: [],
    campaigns: []
  });

  const loadSummary = async (params = dateRange) => {
    setLoading(true);
    try {
      const res = await reportService.getCampaignsSummary(params);
      if (res.data?.success) {
        setSummaryData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load campaigns summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectCampaign = async (id) => {
    setDetailLoading(true);
    try {
      const res = await reportService.getCampaignPerformance(id);
      if (res.data?.success) {
        setSelectedCampaign(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load campaign performance:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleDateChange = (newRange) => {
    setDateRange(newRange);
    loadSummary(newRange);
  };

  const categories = ['All', ...new Set((summaryData.campaigns || []).map(c => c.category).filter(Boolean))];

  const filteredCampaigns = (summaryData.campaigns || []).filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCat = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCat;
  });

  const exportCSV = () => {
    const headers = ['Title', 'Category', 'Status', 'Goal Amount', 'Amount Collected', 'Progress %', 'Donations Count', 'Start Date', 'Deadline'];
    const rows = filteredCampaigns.map(c => [
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.status,
      c.goalAmount,
      c.amountCollected,
      `${c.progressPercent}%`,
      c.donationCount,
      c.startDate || '',
      c.deadline || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SevaConnect_Campaigns_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const topComparisonData = (summaryData.topByAmount || []).map(c => ({
    name: c.title.length > 18 ? c.title.substring(0, 16) + '...' : c.title,
    goal: c.goalAmount,
    collected: c.amountCollected
  }));

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
                <Link to="/admin/analytics" className="text-xs font-bold text-[#087F73] hover:underline flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Analytics Hub
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-xs text-[#667085]">Campaigns</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#17243A] tracking-tight">
                Campaign Performance Analytics
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#17243A] bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={() => loadSummary()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#087F73] bg-[#EAF6F3] hover:bg-[#087F73] hover:text-white rounded-xl transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <NotificationBell align="right" />
          </div>
        </header>

        {/* Main Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <DateRangeFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={handleDateChange}
            onReset={() => handleDateChange({ startDate: '', endDate: '' })}
          />

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Overall Funds Raised"
              value={`₹${(summaryData.overallGoalVsCollected.totalCollected || 0).toLocaleString('en-IN')}`}
              subtext={`Target goal: ₹${(summaryData.overallGoalVsCollected.totalGoal || 0).toLocaleString('en-IN')}`}
              icon={TrendingUp}
              colorScheme="teal"
            />
            <SummaryCard
              label="Overall Fulfillment %"
              value={`${summaryData.overallGoalVsCollected.overallProgressPercent || 0}%`}
              subtext="Aggregated percentage across all causes"
              icon={Award}
              colorScheme="emerald"
            />
            <SummaryCard
              label="Active Relief Campaigns"
              value={(summaryData.statusCounts.active || 0).toLocaleString()}
              subtext="Ongoing causes collecting relief"
              icon={Megaphone}
              colorScheme="amber"
            />
            <SummaryCard
              label="Completed Causes"
              value={(summaryData.statusCounts.completed || 0).toLocaleString()}
              subtext={`${summaryData.statusCounts.closed || 0} closed / archived`}
              icon={CheckCircle2}
              colorScheme="blue"
            />
          </div>

          {/* Top Causes Comparison Chart */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#17243A]">
                  Top Campaigns Comparison (Goal vs. Collected)
                </h3>
                <p className="text-xs text-[#667085] mt-0.5">
                  Visual comparison of leading causes by total monetary contributions
                </p>
              </div>
            </div>

            <div className="h-[280px] w-full">
              {topComparisonData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#667085]">
                  No campaign data found
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topComparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#667085' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#667085' }} tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} />
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

          {/* Campaign Analytics Data Table */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#17243A]">
                  Individual Campaign Performance Table
                </h3>
                <p className="text-xs text-[#667085] mt-0.5">
                  Comprehensive progress overview, status, and contribution counts
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search campaign..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#087F73] text-[#17243A] w-44 sm:w-56"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-[#17243A]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-[#17243A]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#17243A]">
                <thead className="bg-[#EAF6F3]/50 text-[#667085] uppercase tracking-wider text-[11px] font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Campaign Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Goal Target</th>
                    <th className="py-3 px-4 text-right">Collected</th>
                    <th className="py-3 px-4 text-center">Progress %</th>
                    <th className="py-3 px-4 text-center">Donations</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-[#667085]">
                        No matching campaign performance records found.
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#17243A] max-w-xs truncate">
                          {c.title}
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
                          ₹{Number(c.amountCollected).toLocaleString('en-IN')}
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
                        <td className="py-3 px-4 text-center font-bold">
                          {c.donationCount}
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
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleInspectCampaign(c.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAF6F3] text-[#087F73] hover:bg-[#087F73] hover:text-white text-xs font-bold transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
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

      {/* Single Campaign Inspect Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#087F73]">
                  {selectedCampaign.category} · {selectedCampaign.status}
                </span>
                <h3 className="text-lg font-black text-[#17243A] mt-1">
                  {selectedCampaign.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-1.5 rounded-lg text-[#667085] hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#667085] leading-relaxed">
              {selectedCampaign.description}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-[#667085] uppercase">Target Goal</p>
                <p className="text-base font-black text-[#17243A]">₹{Number(selectedCampaign.goalAmount).toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-[#EAF6F3] rounded-xl">
                <p className="text-[10px] font-bold text-[#087F73] uppercase">Amount Raised</p>
                <p className="text-base font-black text-[#087F73]">₹{Number(selectedCampaign.amountCollected).toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-[#667085] uppercase">Progress Reached</p>
                <p className="text-base font-black text-[#17243A]">{selectedCampaign.progressPercent}%</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-[#667085] uppercase">Remaining Deficit</p>
                <p className="text-base font-black text-[#17243A]">₹{Number(selectedCampaign.remainingAmount).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs font-bold text-[#17243A] mb-2">Total Contributions Breakdown:</p>
              <div className="flex items-center gap-4 text-xs text-[#667085]">
                <span>Total Donations: <strong className="text-[#17243A]">{selectedCampaign.totalDonationsCount}</strong></span>
                <span>Money: <strong className="text-[#17243A]">{selectedCampaign.moneyDonationsCount}</strong></span>
                <span>Items: <strong className="text-[#17243A]">{selectedCampaign.itemDonationsCount}</strong></span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#17243A] rounded-xl transition-all"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
