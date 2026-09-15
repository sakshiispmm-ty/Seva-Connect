import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import NotificationBell from '../../../components/NotificationBell';
import DateRangeFilter from '../../../components/DateRangeFilter';
import SummaryCard from '../../../components/charts/SummaryCard';
import BreakdownChart from '../../../components/charts/BreakdownChart';
import { reportService } from '../../../services/api';
import {
  Menu,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RefreshCw,
  Search,
  Download,
  Filter,
  AlertTriangle,
  HeartHandshake
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function BeneficiaryReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const [summary, setSummary] = useState({
    totalBeneficiaries: 0,
    totalRequests: 0,
    fulfillmentRate: 0,
    requestsByStatus: { submitted: 0, approved: 0, inProgress: 0, completed: 0, rejected: 0 },
    requestsByUrgency: { high: 0, medium: 0, low: 0 },
    requestsByPriority: { high: 0, medium: 0, low: 0 },
    recentRequests: []
  });

  const [categoryBreakdown, setCategoryBreakdown] = useState([]);

  const loadAll = async (params = dateRange) => {
    setLoading(true);
    try {
      const [sumRes, catRes] = await Promise.all([
        reportService.getBeneficiariesSummary(params),
        reportService.getBeneficiariesByCategory(params)
      ]);

      if (sumRes.data?.success) setSummary(sumRes.data.data);
      if (catRes.data?.success) setCategoryBreakdown(catRes.data.data || []);
    } catch (err) {
      console.error('Failed to load beneficiary reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDateChange = (newRange) => {
    setDateRange(newRange);
    loadAll(newRange);
  };

  const statusSplitData = [
    { name: 'Submitted', value: summary.requestsByStatus.submitted, color: '#3B82F6' },
    { name: 'Approved', value: summary.requestsByStatus.approved, color: '#F7BA3E' },
    { name: 'In Progress', value: summary.requestsByStatus.inProgress, color: '#8B5CF6' },
    { name: 'Fulfilled', value: summary.requestsByStatus.completed, color: '#2EAD62' },
    { name: 'Rejected', value: summary.requestsByStatus.rejected, color: '#EF4444' }
  ];

  const urgencySplitData = [
    { name: 'High Urgency', value: summary.requestsByUrgency.high, color: '#EF4444' },
    { name: 'Medium Urgency', value: summary.requestsByUrgency.medium, color: '#F7BA3E' },
    { name: 'Low Urgency', value: summary.requestsByUrgency.low, color: '#087F73' }
  ];

  const filteredCategories = categoryBreakdown.filter(c =>
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['Category', 'Total Requests', 'Fulfilled Requests', 'Pending Requests', 'High Urgency Requests'];
    const rows = filteredCategories.map(c => [
      `"${c.category.replace(/"/g, '""')}"`,
      c.totalRequests,
      c.fulfilledRequests,
      c.pendingRequests,
      c.urgentRequests
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SevaConnect_Beneficiary_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                <span className="text-xs text-[#667085]">Beneficiaries</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#17243A] tracking-tight">
                Beneficiary Support & Assistance Reports
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
              onClick={() => loadAll()}
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
              label="Registered Beneficiaries"
              value={(summary.totalBeneficiaries || 0).toLocaleString()}
              subtext="Individuals & families verified"
              icon={Users}
              colorScheme="purple"
            />
            <SummaryCard
              label="Total Assistance Inquiries"
              value={(summary.totalRequests || 0).toLocaleString()}
              subtext={`${summary.requestsByStatus.completed} successfully fulfilled`}
              icon={FileText}
              colorScheme="teal"
            />
            <SummaryCard
              label="Fulfillment Efficiency"
              value={`${summary.fulfillmentRate || 0}%`}
              subtext={`${summary.requestsByStatus.completed} of ${summary.totalRequests} closed`}
              icon={CheckCircle2}
              colorScheme="emerald"
            />
            <SummaryCard
              label="Critical Urgency Queue"
              value={(summary.requestsByUrgency.high || 0).toLocaleString()}
              subtext="High urgency or emergency relief"
              icon={AlertTriangle}
              colorScheme={summary.requestsByUrgency.high > 0 ? 'amber' : 'teal'}
              badge={summary.requestsByUrgency.high > 0 ? 'Priority' : 'Normal'}
            />
          </div>

          {/* Breakdown Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BreakdownChart
              title="Assistance Requests Workflow Status"
              subtitle="Current operational stage of all logged beneficiary needs"
              data={statusSplitData}
              dataKey="value"
              nameKey="name"
              height={240}
              colors={['#3B82F6', '#F7BA3E', '#8B5CF6', '#2EAD62', '#EF4444']}
            />

            <BreakdownChart
              title="Urgency Distribution Radar"
              subtitle="Breakdown of assistance needs by vulnerability index"
              data={urgencySplitData}
              dataKey="value"
              nameKey="name"
              height={240}
              colors={['#EF4444', '#F7BA3E', '#087F73']}
            />
          </div>

          {/* Category Performance Bar Chart */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#17243A]">
                  Assistance Demand by Category
                </h3>
                <p className="text-xs text-[#667085] mt-0.5">
                  Comparison between total assistance inquiries vs. successfully fulfilled requests
                </p>
              </div>
            </div>

            <div className="h-[260px] w-full">
              {categoryBreakdown.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#667085]">
                  No assistance category records available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#667085' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#667085' }} />
                    <Tooltip />
                    <Bar dataKey="totalRequests" fill="#93C5FD" name="Total Inquiries" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fulfilledRequests" fill="#2EAD62" name="Fulfilled" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pendingRequests" fill="#F7BA3E" name="Pending" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Category Data Table */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#17243A]">
                  Category Support Summary
                </h3>
                <p className="text-xs text-[#667085] mt-0.5">
                  Fulfillment breakdown and high-urgency volume by domain
                </p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter category..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#087F73] text-[#17243A]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#17243A]">
                <thead className="bg-[#EAF6F3]/50 text-[#667085] uppercase tracking-wider text-[11px] font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Relief Category</th>
                    <th className="py-3 px-4 text-center">Total Requests</th>
                    <th className="py-3 px-4 text-center">Fulfilled</th>
                    <th className="py-3 px-4 text-center">Pending Dispatch</th>
                    <th className="py-3 px-4 text-center">Urgent</th>
                    <th className="py-3 px-4 text-center">Fulfillment Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-[#667085]">
                        No matching category records found.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((c, i) => {
                      const rate = c.totalRequests > 0 ? Math.round((c.fulfilledRequests / c.totalRequests) * 100) : 0;
                      return (
                        <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-[#17243A]">
                            {c.category}
                          </td>
                          <td className="py-3 px-4 text-center font-bold">{c.totalRequests}</td>
                          <td className="py-3 px-4 text-center font-black text-[#2EAD62]">{c.fulfilledRequests}</td>
                          <td className="py-3 px-4 text-center font-semibold text-amber-600">{c.pendingRequests}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700">
                              {c.urgentRequests}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#087F73] rounded-full" style={{ width: `${rate}%` }} />
                              </div>
                              <span className="font-bold text-xs">{rate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
