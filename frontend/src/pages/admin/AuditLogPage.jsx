import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import Pagination from '../../components/Pagination';
import { History, Shield, Filter, Search, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, pageSize, actionFilter, targetTypeFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getAuditLogs({
        page: currentPage,
        pageSize,
        action: actionFilter || undefined,
        targetType: targetTypeFilter || undefined
      });

      if (res.data.data) {
        setLogs(res.data.data);
        setTotalLogs(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError('Could not retrieve audit log entries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'USER_DEACTIVATED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">USER DEACTIVATED</span>;
      case 'USER_REACTIVATED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">USER REACTIVATED</span>;
      case 'USER_ROLE_CHANGED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">ROLE CHANGED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{action}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mb-2">
                <History className="w-3.5 h-3.5" />
                <span>Security & Compliance Record</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Administrative Audit Log
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Immutable, write-only ledger recording all sensitive administrative operations with operator identities and timestamps.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[#087F73] dark:text-emerald-400 block">
                {totalLogs}
              </span>
              <span className="text-xs text-slate-400">Total Audit Events Recorded</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Filter by Action:</label>
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#087F73]"
              >
                <option value="">All Action Types</option>
                <option value="USER_DEACTIVATED">USER_DEACTIVATED</option>
                <option value="USER_REACTIVATED">USER_REACTIVATED</option>
                <option value="USER_ROLE_CHANGED">USER_ROLE_CHANGED</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Target Resource:</label>
              <select
                value={targetTypeFilter}
                onChange={(e) => {
                  setTargetTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#087F73]"
              >
                <option value="">All Resources</option>
                <option value="User">User</option>
                <option value="Donation">Donation</option>
                <option value="Campaign">Campaign</option>
                <option value="Inventory">Inventory</option>
              </select>
            </div>
          </div>
        </div>

        {/* Log Table */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-3" />
              <p>Loading administrative audit trail...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              <History className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p>No audit log events match your filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Operator (Admin)</th>
                    <th className="py-3 px-4">Target Resource</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 text-right">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {logs.map((log) => {
                    const dateStr = log.created_at
                      ? new Date(log.created_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      : '—';

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Timestamp */}
                        <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {dateStr}
                        </td>

                        {/* Action badge */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {getActionBadge(log.action)}
                        </td>

                        {/* Admin name/email */}
                        <td className="py-3 px-4">
                          <div className="text-xs">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {log.admin_name || `Admin #${log.admin_id}`}
                            </span>
                            <span className="text-slate-400">
                              {log.admin_email || ''}
                            </span>
                          </div>
                        </td>

                        {/* Target */}
                        <td className="py-3 px-4 text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {log.target_type} #{log.target_id || 'N/A'}
                        </td>

                        {/* Details JSON preview */}
                        <td className="py-3 px-4 text-xs">
                          {log.details && typeof log.details === 'object' ? (
                            <div className="flex flex-wrap gap-1 max-w-sm">
                              {Object.entries(log.details).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
                                >
                                  <strong>{k}:</strong> {String(v)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400">{String(log.details || '—')}</span>
                          )}
                        </td>

                        {/* IP Address */}
                        <td className="py-3 px-4 text-right text-xs font-mono text-slate-400 whitespace-nowrap">
                          {log.ip_address || '127.0.0.1'}
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
              totalItems={totalLogs}
              pageSize={pageSize}
              onPageChange={(p) => setCurrentPage(p)}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
