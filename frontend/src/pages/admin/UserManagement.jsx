import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import Pagination from '../../components/Pagination';
import { Users, UserX, UserCheck, Shield, Search, Filter, AlertTriangle, X, Check, ArrowUpDown } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Confirmation modal state
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState('');
  const [deactivateModalUser, setDeactivateModalUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Current logged in user from storage to prevent self-deactivation / self-demotion
  const currentUser = JSON.parse(localStorage.getItem('sevaconnect_user') || '{}');

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, roleFilter, statusFilter]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchUsers();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getUsers({
        page: currentPage,
        pageSize,
        search: searchTerm,
        role: roleFilter,
        status: statusFilter
      });

      if (res.data.data) {
        setUsers(res.data.data);
        setTotalUsers(res.data.total || res.data.data.length);
        setTotalPages(res.data.totalPages || 1);
      } else if (res.data.users) {
        setUsers(res.data.users);
        setTotalUsers(res.data.count || res.data.users.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Could not retrieve user directory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateModalUser) return;
    try {
      setActionLoading(true);
      await adminService.deactivateUser(deactivateModalUser.id);
      setDeactivateModalUser(null);
      setActionSuccess(`Account for ${deactivateModalUser.name} has been deactivated.`);
      setTimeout(() => setActionSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      console.error('Deactivation error:', err);
      setError(err.response?.data?.message || 'Failed to deactivate user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (user) => {
    try {
      setActionLoading(true);
      await adminService.reactivateUser(user.id);
      setActionSuccess(`Account for ${user.name} has been reactivated.`);
      setTimeout(() => setActionSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      console.error('Reactivation error:', err);
      setError(err.response?.data?.message || 'Failed to reactivate user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChangeConfirm = async () => {
    if (!roleModalUser || !selectedNewRole) return;
    try {
      setActionLoading(true);
      await adminService.updateRole(roleModalUser.id, selectedNewRole);
      setRoleModalUser(null);
      setSelectedNewRole('');
      setActionSuccess(`Role for ${roleModalUser.name} changed to ${selectedNewRole}.`);
      setTimeout(() => setActionSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      console.error('Role update error:', err);
      setError(err.response?.data?.message || 'Failed to change user role.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 mb-2">
                <Shield className="w-3.5 h-3.5" />
                <span>Administrative Access Control</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                User Account Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                View registered users, modify role designations, and manage account statuses with full audit logging.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[#087F73] dark:text-emerald-400 block">
                {totalUsers}
              </span>
              <span className="text-xs text-slate-400">Total Registered Users</span>
            </div>
          </div>
        </div>

        {/* Notifications & Alert Banners */}
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>{actionSuccess}</span>
            <button onClick={() => setActionSuccess('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>{error}</span>
            <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#087F73]"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#087F73]"
              >
                <option value="all">All Roles</option>
                <option value="Donor">Donor</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#087F73]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Deactivated Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-3" />
              <p>Loading registered accounts...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p>No user accounts matched your search filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-center">Role</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Registered</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {users.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    const isActive = u.is_active !== false && u.is_active !== 0;

                    let roleBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
                    if (u.role === 'Volunteer') roleBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
                    if (u.role === 'Admin') roleBadgeColor = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';

                    return (
                      <tr
                        key={u.id}
                        className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                          !isActive ? 'opacity-60 bg-slate-50/30 dark:bg-slate-900/20' : ''
                        }`}
                      >
                        {/* Name & Initials */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {u.name}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400 block">{u.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                          {u.phone || '—'}
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${roleBadgeColor}`}>
                            {u.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Deactivated
                            </span>
                          )}
                        </td>

                        {/* Registered Date */}
                        <td className="py-3 px-4 text-center text-xs text-slate-400">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Role change button */}
                            <button
                              onClick={() => {
                                setRoleModalUser(u);
                                setSelectedNewRole(u.role);
                              }}
                              disabled={isSelf}
                              title={isSelf ? 'Cannot alter own role' : 'Change user role'}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                              Change Role
                            </button>

                            {/* Deactivate / Reactivate button */}
                            {isActive ? (
                              <button
                                onClick={() => setDeactivateModalUser(u)}
                                disabled={isSelf}
                                title={isSelf ? 'Cannot deactivate own account' : 'Deactivate account'}
                                className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(u)}
                                className="px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition"
                              >
                                Reactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Universal Pagination */}
          <div className="px-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalUsers}
              pageSize={pageSize}
              onPageChange={(p) => setCurrentPage(p)}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Change Role Confirmation Modal */}
        {roleModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
                  <Shield className="w-5 h-5 text-[#087F73]" />
                  <span>Change User Role</span>
                </div>
                <button
                  onClick={() => setRoleModalUser(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                You are updating permissions for <strong className="text-slate-900 dark:text-white">{roleModalUser.name}</strong> ({roleModalUser.email}).
              </p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select New Role:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Donor', 'Volunteer', 'Admin'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedNewRole(r)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        selectedNewRole === r
                          ? 'border-[#087F73] bg-emerald-50 dark:bg-emerald-950/60 text-[#087F73] dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {selectedNewRole === 'Admin' && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Granting <strong>Admin</strong> status allows this user to access reports, verify donations, alter accounts, and dispatch relief supplies.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setRoleModalUser(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleChangeConfirm}
                  disabled={actionLoading || selectedNewRole === roleModalUser.role}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#087F73] hover:bg-[#066359] text-white disabled:opacity-50 transition"
                >
                  {actionLoading ? 'Updating...' : 'Confirm Role Change'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Soft Deactivate Confirmation Modal */}
        {deactivateModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-lg">
                <UserX className="w-5 h-5" />
                <span>Deactivate User Account</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Are you sure you want to deactivate <strong className="text-slate-900 dark:text-white">{deactivateModalUser.name}</strong>?
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p><strong>Note on Soft Deactivation:</strong></p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>The user will be immediately blocked from signing in (HTTP 403).</li>
                  <li>All past donation receipts, task delivery logs, and feedback remain preserved.</li>
                  <li>You can reactivate this user at any time from this dashboard.</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setDeactivateModalUser(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition"
                >
                  {actionLoading ? 'Deactivating...' : 'Yes, Deactivate Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
