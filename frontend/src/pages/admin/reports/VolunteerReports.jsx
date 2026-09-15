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
  UserCheck,
  CheckCircle2,
  Clock,
  Award,
  ArrowLeft,
  RefreshCw,
  Search,
  Download,
  Filter,
  Eye,
  X,
  Phone,
  Mail
} from 'lucide-react';

export default function VolunteerReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [summary, setSummary] = useState({
    totalVolunteers: 0,
    activeVolunteers: 0,
    inactiveVolunteers: 0,
    totalAssignedTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overallCompletionRate: 0,
    volunteers: []
  });

  const loadReport = async (params = dateRange) => {
    setLoading(true);
    try {
      const res = await reportService.getVolunteersSummary(params);
      if (res.data?.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load volunteers summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectVolunteer = async (id) => {
    setDetailLoading(true);
    try {
      const res = await reportService.getVolunteerActivity(id);
      if (res.data?.success) {
        setSelectedVolunteer(res.data.data);
      }
    } catch (err) {
      console.error('Failed to inspect volunteer:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleDateChange = (newRange) => {
    setDateRange(newRange);
    loadReport(newRange);
  };

  const filteredVolunteers = (summary.volunteers || []).filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.skills.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['Volunteer Name', 'Email', 'Phone', 'Status', 'Skills', 'Availability', 'Assigned Tasks', 'Completed Tasks', 'Pending Tasks', 'Completion %'];
    const rows = filteredVolunteers.map(v => [
      `"${v.name.replace(/"/g, '""')}"`,
      v.email,
      v.phone || '',
      v.status,
      `"${(v.skills || '').replace(/"/g, '""')}"`,
      `"${(v.availability || '').replace(/"/g, '""')}"`,
      v.assignedCount,
      v.completedCount,
      v.pendingCount,
      `${v.completionRate}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SevaConnect_Volunteers_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusSplitData = [
    { name: 'Active On-Duty', value: summary.activeVolunteers, color: '#2EAD62' },
    { name: 'Inactive / Resting', value: summary.inactiveVolunteers, color: '#94A3B8' }
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
                <Link to="/admin/analytics" className="text-xs font-bold text-[#087F73] hover:underline flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Analytics Hub
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-xs text-[#667085]">Volunteers</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#17243A] tracking-tight">
                Volunteer Activity & Task Reports
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
              onClick={() => loadReport()}
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
              label="Registered Force"
              value={(summary.totalVolunteers || 0).toLocaleString()}
              subtext={`${summary.activeVolunteers} active on-call`}
              icon={UserCheck}
              colorScheme="blue"
            />
            <SummaryCard
              label="Completed Tasks"
              value={(summary.completedTasks || 0).toLocaleString()}
              subtext="Relief missions fulfilled"
              icon={CheckCircle2}
              colorScheme="emerald"
            />
            <SummaryCard
              label="Pending Tasks"
              value={(summary.pendingTasks || 0).toLocaleString()}
              subtext="In progress or assigned"
              icon={Clock}
              colorScheme="amber"
            />
            <SummaryCard
              label="Overall Completion Rate"
              value={`${summary.overallCompletionRate || 0}%`}
              subtext={`${summary.completedTasks} completed of ${summary.totalAssignedTasks}`}
              icon={Award}
              colorScheme="teal"
            />
          </div>

          {/* Volunteer Status & Workload Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#17243A]">
                  Task Velocity Summary
                </h3>
                <p className="text-xs text-[#667085] mt-0.5">
                  Aggregate workload allocation across active team members
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl">
                  <p className="text-xs font-bold text-blue-900 uppercase">Assigned Relief Tasks</p>
                  <p className="text-3xl font-black text-blue-800 mt-1">{summary.totalAssignedTasks}</p>
                  <p className="text-[11px] text-blue-700 mt-1">Total requests routed to volunteers</p>
                </div>
                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                  <p className="text-xs font-bold text-emerald-900 uppercase">Successfully Fulfilled</p>
                  <p className="text-3xl font-black text-[#2EAD62] mt-1">{summary.completedTasks}</p>
                  <p className="text-[11px] text-emerald-700 mt-1">Confirmed beneficiary deliveries</p>
                </div>
                <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl">
                  <p className="text-xs font-bold text-amber-900 uppercase">Active Dispatch Pipeline</p>
                  <p className="text-3xl font-black text-amber-700 mt-1">{summary.pendingTasks}</p>
                  <p className="text-[11px] text-amber-700 mt-1">Currently in progress or pending</p>
                </div>
              </div>

              <div className="text-xs text-[#667085] flex items-center justify-between pt-3 border-t border-gray-100">
                <span>Task fulfillment rate across selected timeframe:</span>
                <span className="font-extrabold text-[#087F73] text-sm">{summary.overallCompletionRate}%</span>
              </div>
            </div>

            <BreakdownChart
              title="Volunteer Force Status"
              subtitle="Active on-call vs. resting volunteers"
              data={statusSplitData}
              dataKey="value"
              nameKey="name"
              height={220}
              colors={['#2EAD62', '#94A3B8']}
            />
          </div>

          {/* Volunteer Table */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#17243A]">
                  Individual Volunteer Productivity
                </h3>
                <p className="text-xs text-[#667085] mt-0.5">
                  Completed missions, pending assignments, and specialized competencies
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search volunteer by name/skill..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#087F73] text-[#17243A] w-52"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-[#17243A]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#17243A]">
                <thead className="bg-[#EAF6F3]/50 text-[#667085] uppercase tracking-wider text-[11px] font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Volunteer</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Specialized Skills</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4 text-center">Assigned</th>
                    <th className="py-3 px-4 text-center">Completed</th>
                    <th className="py-3 px-4 text-center">Pending</th>
                    <th className="py-3 px-4 text-center">Rate %</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredVolunteers.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-[#667085]">
                        No matching volunteer records found.
                      </td>
                    </tr>
                  ) : (
                    filteredVolunteers.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#17243A]">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs shrink-0">
                              {v.name.charAt(0)}
                            </span>
                            <span>{v.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#667085]">
                          <div>{v.email}</div>
                          <div className="text-[10px] text-gray-400">{v.phone}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-[#667085]">
                          {v.skills}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                            {v.availability}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold">{v.assignedCount}</td>
                        <td className="py-3 px-4 text-center font-black text-[#2EAD62]">{v.completedCount}</td>
                        <td className="py-3 px-4 text-center font-semibold text-amber-600">{v.pendingCount}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-xs text-[#087F73]">
                            {v.completionRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleInspectVolunteer(v.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAF6F3] text-[#087F73] hover:bg-[#087F73] hover:text-white text-xs font-bold transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Tasks</span>
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

      {/* Volunteer Tasks Inspect Modal */}
      {selectedVolunteer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm">
                  {selectedVolunteer.volunteer?.name?.charAt(0)}
                </span>
                <div>
                  <h3 className="text-lg font-black text-[#17243A]">
                    {selectedVolunteer.volunteer?.name}
                  </h3>
                  <p className="text-xs text-[#667085]">
                    {selectedVolunteer.volunteer?.email} · {selectedVolunteer.volunteer?.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVolunteer(null)}
                className="p-1.5 rounded-lg text-[#667085] hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-[10px] font-bold text-[#667085] uppercase">Total Assigned</p>
                <p className="text-xl font-black text-[#17243A] mt-0.5">{selectedVolunteer.totalTasks}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-center">
                <p className="text-[10px] font-bold text-[#2EAD62] uppercase">Completed</p>
                <p className="text-xl font-black text-[#2EAD62] mt-0.5">{selectedVolunteer.completedTasks}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-center">
                <p className="text-[10px] font-bold text-amber-700 uppercase">Pending Tasks</p>
                <p className="text-xl font-black text-amber-700 mt-0.5">{selectedVolunteer.pendingTasks}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                Assigned Relief Requests / Tasks:
              </h4>

              {(!selectedVolunteer.tasks || selectedVolunteer.tasks.length === 0) ? (
                <p className="text-xs text-[#667085] py-4 text-center">
                  No individual tasks assigned to this volunteer yet.
                </p>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl max-h-60 overflow-y-auto">
                  {selectedVolunteer.tasks.map((task) => (
                    <div key={task.id} className="p-3 flex items-center justify-between text-xs hover:bg-gray-50">
                      <div>
                        <p className="font-bold text-[#17243A]">
                          Request #REQ-00{task.id} — {task.category}
                        </p>
                        <p className="text-[11px] text-[#667085]">
                          Beneficiary: {task.beneficiary_name} {task.deadline ? `· Deadline: ${task.deadline}` : ''}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        task.status === 'Completed' || task.status === 'Fulfilled'
                          ? 'bg-emerald-50 text-[#2EAD62]'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedVolunteer(null)}
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
