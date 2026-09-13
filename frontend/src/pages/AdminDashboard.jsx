import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService, donationService } from '../services/api';
import Sidebar from '../components/Sidebar';
import Alert from '../components/Alert';
import DonationStatusBadge from '../components/DonationStatusBadge';
import {
  Menu,
  Users,
  HeartHandshake,
  Shield,
  Megaphone,
  Gift,
  Package,
  FileText,
  RefreshCw,
  CheckCircle,
  TrendingUp,
  Clock,
  IndianRupee,
  ArrowRight,
  Search,
  UserX,
  Filter
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
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  // Search and filter state for members directory (DEF-06)
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes, donationsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        donationService.getAll()
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }
      if (usersRes.data?.success) {
        setRecentUsers(usersRes.data.users || []);
      }
      if (donationsRes.data?.success) {
        setDonations(donationsRes.data.data || []);
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
    let isMounted = true;
    async function loadStats() {
      try {
        const [statsRes, usersRes, donationsRes] = await Promise.all([
          adminService.getStats(),
          adminService.getUsers(),
          donationService.getAll()
        ]);
        if (isMounted) {
          if (statsRes.data?.success) {
            setStats(statsRes.data.stats);
          }
          if (usersRes.data?.success) {
            setRecentUsers(usersRes.data.users || []);
          }
          if (donationsRes.data?.success) {
            setDonations(donationsRes.data.data || []);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
            'Could not fetch real-time administration statistics from backend.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickVerify = async (id) => {
    setActionLoading(true);
    try {
      await donationService.verify(id);
      await fetchStats();
    } catch (err) {
      console.error('Failed to verify donation:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickComplete = async (id) => {
    setActionLoading(true);
    try {
      await donationService.complete(id);
      await fetchStats();
    } catch (err) {
      console.error('Failed to complete donation:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === user?.id) {
      alert('You cannot deactivate your own administrative account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to deactivate and remove account #${targetUser.id} (${targetUser.name})?`)) {
      return;
    }
    setActionLoading(true);
    try {
      await adminService.deleteUser(targetUser.id);
      await fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user account.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered members list (DEF-06 / TC-ADM-04)
  const filteredUsers = recentUsers.filter((u) => {
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    const q = userSearchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      String(u.id).includes(q);
    return matchesRole && matchesSearch;
  });

  const activeModules = [
    { title: 'Campaigns', icon: Megaphone, description: 'Manage fundraising drives & targets', path: '/admin/campaigns' },
    { title: 'Donation Desk', icon: Gift, description: 'Verify intents & issue tax receipts', path: '/admin/donations' },
  ];

  const futureModules = [
    { title: 'Volunteers', icon: Users, description: 'Rosters & field teams' },
    { title: 'Beneficiaries', icon: HeartHandshake, description: 'Aid & verification' },
    { title: 'Inventory', icon: Package, description: 'Rations & supplies' },
    { title: 'Reports', icon: FileText, description: 'Impact summaries' }
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

          {/* DYNAMIC STATISTICS CARDS (CONNECTED TO PERSISTENT DATABASE) */}
          {(() => {
            const pendingDonations = donations.filter(d => d.status === 'Pending Verification');
            const completedDonations = donations.filter(d => d.status === 'Completed');
            const totalFunds = completedDonations
              .filter(d => d.donation_type === 'Money')
              .reduce((acc, d) => acc + (Number(d.amount) || 0), 0);

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Registered Users */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#667085] uppercase tracking-wider">Registered Members</p>
                    <p className="text-3xl font-black text-[#17243A] mt-2">
                      {loading ? '...' : stats.totalUsers}
                    </p>
                    <p className="text-[11px] text-[#087F73] font-semibold mt-1">Donors & Staff Accounts</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#EAF6F3] text-[#087F73]">
                    <Users className="w-7 h-7" />
                  </div>
                </div>

                {/* Total Donations */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#667085] uppercase tracking-wider">Total Donations</p>
                    <p className="text-3xl font-black text-[#087F73] mt-2">
                      {loading ? '...' : donations.length}
                    </p>
                    <p className="text-[11px] text-[#2EAD62] font-semibold mt-1">
                      {completedDonations.length} Verified & Disbursed
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#EAF6F3] text-[#087F73]">
                    <Gift className="w-7 h-7" />
                  </div>
                </div>

                {/* Pending Verification */}
                <div className={`p-6 rounded-2xl border shadow-sm flex items-center justify-between transition-colors ${
                  pendingDonations.length > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-gray-200'
                }`}>
                  <div>
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Verification</p>
                    <p className="text-3xl font-black text-amber-600 mt-2">
                      {loading ? '...' : pendingDonations.length}
                    </p>
                    <p className="text-[11px] text-amber-700 font-semibold mt-1">
                      {pendingDonations.length > 0 ? 'Requires NGO Action' : 'All Intents Verified'}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-100 text-amber-700">
                    <Clock className="w-7 h-7" />
                  </div>
                </div>

                {/* Verified Funds Collected */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#667085] uppercase tracking-wider">Verified Funds Raised</p>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
                      ₹{loading ? '...' : totalFunds.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-[#2EAD62] font-semibold mt-1">Deployed in Initiatives</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
                    <IndianRupee className="w-7 h-7" />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* V1.3 NGO OPERATIONS & DISPATCH MODULES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#17243A]">
                NGO Operational Modules & Relief Pipeline
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF6F3] text-[#087F73] border border-[#087F73]/20">
                Relief Pipeline
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/admin/assistance-requests"
                className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#087F73] shadow-xs hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#17243A] group-hover:text-[#087F73] transition-colors">
                  Assistance Requests
                </h4>
                <p className="text-xs text-[#667085] mt-1">
                  Review beneficiary needs, approve requests, and allocate relief inventory.
                </p>
              </Link>

              <Link
                to="/admin/beneficiaries"
                className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#087F73] shadow-xs hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#17243A] group-hover:text-[#087F73] transition-colors">
                  Beneficiary Registry
                </h4>
                <p className="text-xs text-[#667085] mt-1">
                  Profiles, location addresses, and past assistance request history.
                </p>
              </Link>

              <Link
                to="/admin/inventory"
                className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#087F73] shadow-xs hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#17243A] group-hover:text-[#087F73] transition-colors">
                  Inventory & Stock Desk
                </h4>
                <p className="text-xs text-[#667085] mt-1">
                  Available supplies, low-stock threshold flags, and stock audit trails.
                </p>
              </Link>

              <Link
                to="/admin/volunteers"
                className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#087F73] shadow-xs hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAF6F3] text-[#087F73] flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#17243A] group-hover:text-[#087F73] transition-colors">
                  Volunteer Force
                </h4>
                <p className="text-xs text-[#667085] mt-1">
                  Roster of active volunteers, availability windows, and task assignments.
                </p>
              </Link>
            </div>
          </div>

          {/* LIVE DONATIONS & VERIFICATION QUEUE (DIRECT ADMIN ACCESS) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#17243A]">Live Donations & Intent Verification Queue</h3>
                  {donations.filter(d => d.status === 'Pending Verification').length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                      {donations.filter(d => d.status === 'Pending Verification').length} Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#667085]">Real-time feed of all incoming pledges, bank transfers & item donations</p>
              </div>
              <Link
                to="/admin/donations"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087F73] hover:text-[#05665D] bg-[#EAF6F3] px-3.5 py-1.5 rounded-xl hover:bg-[#d5ece6] transition-colors"
              >
                Open Full Donation Desk
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-[#EAF6F3]/60 text-xs font-bold text-[#17243A] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Tracking Token</th>
                    <th className="py-3.5 px-6">Donor Details</th>
                    <th className="py-3.5 px-6">Initiative / Campaign</th>
                    <th className="py-3.5 px-6">Contribution</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[#17243A]">
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-sm text-[#667085]">
                        No donations recorded yet.
                      </td>
                    </tr>
                  ) : (
                    donations.slice(0, 6).map((d) => {
                      const isMoney = d.donation_type === 'Money';
                      return (
                        <tr key={d.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3.5 px-6 whitespace-nowrap">
                            <span className="font-mono font-bold text-[#087F73] block text-xs">
                              {d.token}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(d.created_at).toLocaleDateString('en-IN')}
                            </span>
                          </td>
                          <td className="py-3.5 px-6">
                            <p className="font-bold text-sm text-[#17243A]">{d.donor_name}</p>
                            <p className="text-xs text-[#667085]">{d.donor_email}</p>
                            {d.donor_phone && (
                              <p className="text-[10px] text-gray-400">Ph: {d.donor_phone}</p>
                            )}
                          </td>
                          <td className="py-3.5 px-6 max-w-xs">
                            <span className="font-semibold text-xs text-gray-800 line-clamp-1">
                              {d.campaign_title || 'General Relief Fund'}
                            </span>
                            {d.notes && (
                              <span className="block text-[10px] italic text-gray-400 truncate">
                                "{d.notes}"
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-6 whitespace-nowrap">
                            {isMoney ? (
                              <span className="font-bold font-mono text-sm text-[#17243A]">
                                ₹{Number(d.amount).toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <div>
                                <span className="font-bold text-xs text-gray-900">
                                  {d.item_quantity || '1 unit'}
                                </span>
                                <span className="block text-[10px] text-gray-500 max-w-xs truncate">
                                  {d.item_description || 'In-Kind Item'}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-6 whitespace-nowrap">
                            <DonationStatusBadge status={d.status} size="sm" />
                          </td>
                          <td className="py-3.5 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {d.status === 'Pending Verification' && (
                                <button
                                  onClick={() => handleQuickVerify(d.id)}
                                  disabled={actionLoading}
                                  className="px-3 py-1 rounded-lg text-xs font-bold bg-[#EAF6F3] text-[#087F73] hover:bg-[#087F73] hover:text-white transition-all shadow-xs"
                                >
                                  Verify Intent
                                </button>
                              )}
                              {d.status === 'Verified' && (
                                <button
                                  onClick={() => handleQuickComplete(d.id)}
                                  disabled={actionLoading}
                                  className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-xs"
                                >
                                  Complete
                                </button>
                              )}
                              {d.status === 'Completed' && (
                                <Link
                                  to="/admin/donations"
                                  className="text-[11px] font-semibold text-[#087F73] hover:underline"
                                >
                                  Audited & Receipted
                                </Link>
                              )}
                              {d.status === 'Rejected' && (
                                <span className="text-[11px] text-rose-600 font-medium">Declined</span>
                              )}
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

          {/* REGISTERED USERS TABLE (DEF-06 & DEF-07 / TC-ADM-04 & TC-ADM-05) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#17243A]">Registered Community Members & Staff</h3>
                <p className="text-xs text-[#667085]">Directory of registered Donors and NGO Administrators stored in MySQL</p>
              </div>

              {/* Search & Role Filter Controls */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#087F73] focus:ring-1 focus:ring-[#087F73] w-48 sm:w-56"
                  />
                </div>

                <div className="relative">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="py-1.5 px-3 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-[#17243A] focus:outline-none focus:border-[#087F73]"
                  >
                    <option value="All">All Roles</option>
                    <option value="Donor">Donor</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <span className="text-xs font-semibold text-[#087F73] bg-[#EAF6F3] px-3 py-1 rounded-full">
                  {filteredUsers.length} of {recentUsers.length} Records
                </span>
              </div>
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
                    <th className="py-3.5 px-6 text-right">Account Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[#17243A]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-sm text-[#667085]">
                        No matching registered members found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
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
                                : u.role === 'Volunteer'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-xs text-[#667085]">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          {u.id === user?.id ? (
                            <span className="text-xs text-gray-400 italic">Current User</span>
                          ) : (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg transition-colors border border-rose-200"
                              title="Deactivate and delete user account"
                            >
                              <UserX className="w-3.5 h-3.5" /> Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTIVE V1.2 OPERATIONS & ROADMAP */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-bold text-[#17243A]">Live Operational Desks</h3>
                  <p className="text-xs text-[#667085]">Active modules for campaign management and donation verification</p>
                </div>
                <span className="text-xs font-semibold text-[#087F73] bg-[#EAF6F3] px-3 py-1 rounded-full">
                  Operational Desks
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeModules.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      to={item.path}
                      className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-[#087F73] hover:shadow-md transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-[#EAF6F3] text-[#087F73] group-hover:bg-[#087F73] group-hover:text-white transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-[#17243A] group-hover:text-[#087F73] transition-colors">
                              {item.title}
                            </h4>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          </div>
                          <p className="text-xs text-[#667085] mt-0.5">{item.description}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#087F73] group-hover:translate-x-1 transition-transform">
                        Open Desk →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#17243A]">Future Roadmap Modules</h4>
                <span className="text-[11px] text-gray-400">Planned for V2</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {futureModules.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs flex flex-col items-center text-center opacity-75"
                    >
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600 mb-1.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-[#17243A]">{item.title}</p>
                      <p className="text-[10px] text-[#667085] mt-0.5">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
