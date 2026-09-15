import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import NotificationBell from '../../../components/NotificationBell';
import SummaryCard from '../../../components/charts/SummaryCard';
import BreakdownChart from '../../../components/charts/BreakdownChart';
import { reportService } from '../../../services/api';
import {
  Menu,
  Package,
  AlertTriangle,
  TrendingUp,
  History,
  ArrowLeft,
  RefreshCw,
  Search,
  Download,
  Filter,
  Eye,
  X,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function InventoryReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const [summary, setSummary] = useState({
    totalItemTypes: 0,
    totalStockAvailable: 0,
    totalStockDistributed: 0,
    lowStockCount: 0,
    totalAllocationsLogged: 0,
    categoryBreakdown: [],
    items: []
  });

  const [lowStockList, setLowStockList] = useState([]);
  const [selectedItemHistory, setSelectedItemHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sumRes, lowRes] = await Promise.all([
        reportService.getInventorySummary(),
        reportService.getLowStockReport()
      ]);

      if (sumRes.data?.success) setSummary(sumRes.data.data);
      if (lowRes.data?.success) setLowStockList(lowRes.data.data || []);
    } catch (err) {
      console.error('Failed to load inventory reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectHistory = async (itemId) => {
    setHistoryLoading(true);
    try {
      const res = await reportService.getItemHistory(itemId);
      if (res.data?.success) {
        setSelectedItemHistory(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load item history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const categories = ['All', ...new Set((summary.items || []).map(i => i.category).filter(Boolean))];

  const filteredItems = (summary.items || []).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesLow = !showLowStockOnly || item.is_low_stock;
    return matchesSearch && matchesCat && matchesLow;
  });

  const exportCSV = () => {
    const headers = ['Item Name', 'Category', 'Unit', 'Available Stock', 'Distributed Stock', 'Reorder Threshold', 'Status'];
    const rows = filteredItems.map(i => [
      `"${i.name.replace(/"/g, '""')}"`,
      i.category,
      i.unit,
      i.quantity_available,
      i.quantity_distributed,
      i.low_stock_threshold,
      i.is_low_stock ? 'LOW STOCK' : 'Adequate'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SevaConnect_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categoryBarData = (summary.categoryBreakdown || []).map(c => ({
    name: c.category,
    available: c.availableStock,
    distributed: c.distributedStock
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
                <span className="text-xs text-[#667085]">Inventory</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#17243A] tracking-tight">
                Warehouse Inventory & Resource Reports
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
              onClick={loadAll}
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
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Available Stock Balance"
              value={(summary.totalStockAvailable || 0).toLocaleString()}
              subtext="Total units ready for dispatch"
              icon={Package}
              colorScheme="teal"
            />
            <SummaryCard
              label="Distributed Relief Goods"
              value={(summary.totalStockDistributed || 0).toLocaleString()}
              subtext="Units delivered to community"
              icon={TrendingUp}
              colorScheme="emerald"
            />
            <SummaryCard
              label="Cataloged Item Types"
              value={(summary.totalItemTypes || 0).toLocaleString()}
              subtext={`${summary.categoryBreakdown?.length || 0} distinct categories`}
              icon={CheckCircle2}
              colorScheme="blue"
            />
            <SummaryCard
              label="Low Stock Warning Roster"
              value={(summary.lowStockCount || 0).toLocaleString()}
              subtext="Items at/below reorder threshold"
              icon={AlertTriangle}
              colorScheme={summary.lowStockCount > 0 ? 'amber' : 'emerald'}
              badge={summary.lowStockCount > 0 ? 'Action Required' : 'Adequate'}
            />
          </div>

          {/* Category Available vs Distributed Chart */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#17243A]">
                  Resource Balance by Category (Available vs. Distributed)
                </h3>
                <p className="text-xs text-[#667085] mt-0.5">
                  Comparison of remaining warehouse inventory versus historical relief allocations
                </p>
              </div>
            </div>

            <div className="h-[280px] w-full">
              {categoryBarData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#667085]">
                  No inventory category records found
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#667085' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#667085' }} />
                    <Tooltip />
                    <Bar dataKey="available" fill="#087F73" name="Available In Stock" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="distributed" fill="#2EAD62" name="Distributed Total" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Low Stock Priority Table (if any) */}
          {lowStockList.length > 0 && (
            <div className="bg-amber-50/70 rounded-2xl border border-amber-200/80 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-900">
                  Critical Low-Stock Roster ({lowStockList.length} items requiring replenishment)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockList.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl p-3 border border-amber-200 shadow-2xs flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#17243A]">{item.name}</p>
                      <p className="text-[11px] text-[#667085]">
                        Available: <strong className="text-amber-700">{item.quantity_available} {item.unit}</strong> (Threshold: {item.low_stock_threshold})
                      </p>
                    </div>
                    <button
                      onClick={() => handleInspectHistory(item.id)}
                      className="px-2 py-1 bg-[#EAF6F3] text-[#087F73] hover:bg-[#087F73] hover:text-white rounded-lg text-[10px] font-bold transition-all"
                    >
                      History
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Master Inventory Resource Report Table */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#17243A]">
                  Warehouse Stock Balance & Allocation Register
                </h3>
                <p className="text-xs text-[#667085] mt-0.5">
                  Real-time quantities, reorder thresholds, and distribution histories
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
                    placeholder="Search item..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#087F73] text-[#17243A] w-48"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-[#17243A]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    showLowStockOnly
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-gray-100 text-[#667085] border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  Low Stock Only
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#17243A]">
                <thead className="bg-[#EAF6F3]/50 text-[#667085] uppercase tracking-wider text-[11px] font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Unit</th>
                    <th className="py-3 px-4 text-right">Available</th>
                    <th className="py-3 px-4 text-right">Distributed</th>
                    <th className="py-3 px-4 text-right">Threshold</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-[#667085]">
                        No matching inventory records found.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#17243A]">
                          {item.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#087F73] border border-teal-200/50">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-[#667085]">{item.unit}</td>
                        <td className={`py-3 px-4 text-right font-black ${item.is_low_stock ? 'text-red-600' : 'text-[#087F73]'}`}>
                          {item.quantity_available}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-[#2EAD62]">
                          {item.quantity_distributed}
                        </td>
                        <td className="py-3 px-4 text-right text-[#667085]">
                          {item.low_stock_threshold}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.is_low_stock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300">
                              <AlertTriangle className="w-3 h-3" /> Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              Adequate
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleInspectHistory(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAF6F3] text-[#087F73] hover:bg-[#087F73] hover:text-white text-xs font-bold transition-all"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>History</span>
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

      {/* Item Distribution History Modal */}
      {selectedItemHistory && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#087F73]">
                  {selectedItemHistory.item?.category}
                </span>
                <h3 className="text-lg font-black text-[#17243A] mt-1">
                  Distribution History: {selectedItemHistory.item?.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemHistory(null)}
                className="p-1.5 rounded-lg text-[#667085] hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-[10px] font-bold text-[#667085] uppercase">Current Stock</p>
                <p className="text-xl font-black text-[#087F73]">
                  {selectedItemHistory.item?.quantity_available} {selectedItemHistory.item?.unit}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-center">
                <p className="text-[10px] font-bold text-[#2EAD62] uppercase">Total Distributed</p>
                <p className="text-xl font-black text-[#2EAD62]">
                  {selectedItemHistory.item?.quantity_distributed} {selectedItemHistory.item?.unit}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                Audit Log Entries ({selectedItemHistory.historyCount}):
              </h4>

              {(!selectedItemHistory.history || selectedItemHistory.history.length === 0) ? (
                <p className="text-xs text-[#667085] py-4 text-center">
                  No allocation or inventory adjustment events recorded for this item yet.
                </p>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl max-h-60 overflow-y-auto">
                  {selectedItemHistory.history.map((log) => (
                    <div key={log.id} className="p-3 flex items-center justify-between text-xs hover:bg-gray-50">
                      <div>
                        <p className="font-bold text-[#17243A]">
                          {log.change_type === 'Deduction' ? '-' : '+'}{log.quantity} {selectedItemHistory.item?.unit}
                        </p>
                        <p className="text-[11px] text-[#667085]">
                          {log.reason} · Performed by {log.performed_by_name}
                        </p>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {log.created_at ? new Date(log.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedItemHistory(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#17243A] rounded-xl transition-all"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
