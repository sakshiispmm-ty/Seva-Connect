import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Alert from '../components/Alert';
import {
  Menu,
  Users,
  HeartHandshake,
  Shield,
  Activity,
  Megaphone,
  Gift,
  Package,
  FileText,
  RefreshCw,
  Clock,
  Sparkles,
  Server,
  Heart,
  CheckCircle,
  AlertTriangle,
  Building,
  TrendingUp
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalAdmins: 0,
    systemStatus: 'Operational',
    databaseStatus: 'Healthy'
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers()
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }
      if (usersRes.data?.success) {
        setRecentUsers(usersRes.data.users || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not fetch real-time administration statistics from backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const futureModules = [
    { title: 'Campaigns', icon: Megaphone, description: 'Fundraising & relief drives' },
    { title: 'Donations', icon: Gift, description: 'Fund allocation & tax receipts' },
    { title: 'Volunteers', icon: Users, description: 'Rosters & ground field relief' },
    { title: 'Beneficiaries', icon: HeartHandshake, description: 'Family aid & verification' },
    { title: 'Inventory', icon: Package, description: 'Relief rations & supplies' },
    { title: 'Reports', icon: FileText, description: 'NGO audit & impact summaries' }
  ];

  return (
    <div className="min-h-screen bg-[#EAF6F3] flex">
      {/* Responsive Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role="Admin"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-[#17243A] hover:bg-gray-100 lg:hidden"
              aria-label="Open Sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Official Logo on Admin Header */}
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo.png"
                alt="SevaConnect Official Logo"
                className="h-10 w-auto max-h-10 object-contain hidden sm:block"
              />
              <span className="h-6 w-px bg-gray-200 hidden sm:block"></span>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-[#17243A] leading-none">
                  NGO Administration Hub
                </h1>
                <p className="text-[11px] text-[#667085] hidden sm:block mt-0.5">
                  Resource Oversight & Member Coordination
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="p-2 text-[#087F73] hover:bg-[#EAF6F3] rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh Statistics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-[#17243A] text-[#F7BA3E] flex items-center justify-center font-bold text-sm shadow-xs">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#17243A] via-[#05665D] to-[#087F73] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F7BA3E]/20 text-[#F7BA3E] border border-[#F7BA3E]/40 rounded-full text-xs font-bold">
                <Shield className="w-3.5 h-3.5" />
                NGO Operations & Governance Center
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-sm text-gray-200 leading-relaxed">
                Supervise donor engagement, monitor registered members, and oversee community resource initiatives across the SevaConnect network.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <span className="bg-white/15 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#2EAD62]" /> Database Connected
                </span>
                <span className="bg-white/15 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#F7BA3E]" /> Real-time Metric Synchronization
                </span>
              </div>
            </div>
          </div>

          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
            />
          )}

          {/* DYNAMIC STATISTICS CARDS (CONNECTED TO MYSQL DATABASE) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Registered Users */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#667085] uppercase tracking-wider">Registered Members</p>
                <p className="text-3xl font-black text-[#17243A] mt-2">
                  {loading ? '...' : stats.totalUsers}
                </p>
                <p className="text-[11px] text-[#087F73] font-semibold mt-1">Donors & NGO Personnel</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#EAF6F3] text-[#087F73]">
                <Users className="w-7 h-7" />
              </div>
            </div>

            {/* Total Donors */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#667085] uppercase tracking-wider">Active Donors</p>
                <p className="text-3xl font-black text-[#087F73] mt-2">
                  {loading ? '...' : stats.totalDonors}
                </p>
                <p className="text-[11px] text-[#2EAD62] font-semibold mt-1">Community Contributors</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#EAF6F3] text-[#2EAD62]">
                <HeartHandshake className="w-7 h-7" />
              </div>
            </div>

            {/* Total Admins */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#667085] uppercase tracking-wider">NGO Administrators</p>
                <p className="text-3xl font-black text-[#17243A] mt-2">
                  {loading ? '...' : stats.totalAdmins}
                </p>
                <p className="text-[11px] text-[#F7BA3E] font-semibold mt-1">Operations Supervisors</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FFF4D6] text-[#F7BA3E]">
                <Shield className="w-7 h-7" />
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#667085] uppercase tracking-wider">System Health</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-3 h-3 rounded-full bg-[#2EAD62] animate-pulse"></span>
                  <p className="text-xl font-bold text-[#17243A]">{stats.systemStatus}</p>
                </div>
                <p className="text-[11px] text-[#2EAD62] font-semibold mt-1">Donation & Portal Services Online</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-[#2EAD62]">
                <Server className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* REGISTERED USERS TABLE */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-bold text-[#17243A]">Registered Community Members & Staff</h3>
                <p className="text-xs text-[#667085]">Directory of registered Donors and NGO Administrators stored in MySQL</p>
              </div>
              <span className="text-xs font-semibold text-[#087F73] bg-[#EAF6F3] px-3 py-1 rounded-full">
                {recentUsers.length} Active Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-[#EAF6F3]/60 text-xs font-bold text-[#17243A] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Member ID</th>
                    <th className="py-3.5 px-6">Full Name</th>
                    <th className="py-3.5 px-6">Email Address</th>
                    <th className="py-3.5 px-6">Phone Number</th>
                    <th className="py-3.5 px-6">Assigned Role</th>
                    <th className="py-3.5 px-6">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[#17243A]">
                  {recentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-sm text-[#667085]">
                        No registered members found.
                      </td>
                    </tr>
                  ) : (
                    recentUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-6 font-mono text-xs text-[#667085]">#{u.id}</td>
                        <td className="py-3.5 px-6 font-semibold">{u.name}</td>
                        <td className="py-3.5 px-6 text-[#667085]">{u.email}</td>
                        <td className="py-3.5 px-6 text-[#667085]">{u.phone}</td>
                        <td className="py-3.5 px-6">
                          <span
                            className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                              u.role === 'Admin'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-xs text-[#667085]">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* FUTURE ADMINISTRATIVE MODULES (INFORMATIONAL PREVIEWS ONLY) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-bold text-[#17243A]">Future NGO Resource Modules</h3>
                <p className="text-xs text-[#667085]">Informational previews of planned operational modules for NGO donation & resource management</p>
              </div>
              <span className="text-xs font-semibold text-[#087F73] bg-[#EAF6F3] px-2.5 py-1 rounded-full">
                Roadmap Preview
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {futureModules.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col items-center text-center opacity-85 hover:opacity-100 transition-all hover:border-[#087F73]/30"
                  >
                    <div className="p-3 rounded-xl bg-[#EAF6F3] text-[#087F73] mb-2">
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-[#17243A]">{item.title}</p>
                    <p className="text-[11px] text-[#667085] mt-1 leading-snug">{item.description}</p>
                    <span className="text-[10px] text-gray-400 mt-2 bg-gray-50 px-2 py-0.5 rounded">
                      Planned
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
