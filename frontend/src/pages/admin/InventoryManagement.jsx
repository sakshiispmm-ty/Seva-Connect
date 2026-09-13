import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Alert from '../../components/Alert';
import LowStockTag from '../../components/LowStockTag';
import SearchFilterBar from '../../components/SearchFilterBar';
import NotificationBell from '../../components/NotificationBell';
import { inventoryService } from '../../services/api';
import { 
  Package, 
  Plus, 
  Search, 
  History, 
  Edit3, 
  Menu, 
  X, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Layers
} from 'lucide-react';

const CATEGORIES = [
  'Food & Nutrition',
  'Winter Relief',
  'Medical & Health',
  'Education',
  'Hygiene & Water',
  'General Relief'
];

export default function InventoryManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    category: 'Food & Nutrition',
    unit: 'Kits',
    quantity_available: 50,
    low_stock_threshold: 20
  });
  const [addErrors, setAddErrors] = useState({});
  const [adding, setAdding] = useState(false);

  // Adjust Stock Modal
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustForm, setAdjustForm] = useState({
    changeType: 'Addition',
    quantityChange: 10,
    reason: '',
    lowStockThreshold: ''
  });
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  // History Drawer
  const [historyItem, setHistoryItem] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getAll();
      if (response.data && response.data.success) {
        setItems(response.data.items || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory stock.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenAdd = () => {
    setAddForm({
      name: '',
      category: 'Food & Nutrition',
      unit: 'Kits',
      quantity_available: 50,
      low_stock_threshold: 20
    });
    setAddErrors({});
    setShowAddModal(true);
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!addForm.name.trim()) errs.name = 'Item name is required.';
    if (!addForm.unit.trim()) errs.unit = 'Unit is required.';
    if (Object.keys(errs).length > 0) {
      setAddErrors(errs);
      return;
    }

    setAdding(true);
    setError('');
    setSuccess('');

    try {
      const response = await inventoryService.create(addForm);
      if (response.data && response.data.success) {
        setSuccess(`Inventory item "${response.data.item.name}" registered successfully.`);
        setShowAddModal(false);
        fetchInventory();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create inventory item.');
    } finally {
      setAdding(false);
    }
  };

  const handleOpenAdjust = (item) => {
    setAdjustItem(item);
    setAdjustForm({
      changeType: 'Addition',
      quantityChange: 10,
      reason: 'Procurement / In-kind receipt',
      lowStockThreshold: item.low_stock_threshold
    });
    setAdjustError('');
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    if (!adjustItem) return;
    setAdjusting(true);
    setAdjustError('');

    try {
      const response = await inventoryService.adjust(adjustItem.id, adjustForm);
      if (response.data && response.data.success) {
        setSuccess(`Stock adjusted for "${adjustItem.name}".`);
        setAdjustItem(null);
        fetchInventory();
      }
    } catch (err) {
      setAdjustError(err.response?.data?.message || 'Failed to adjust stock.');
    } finally {
      setAdjusting(false);
    }
  };

  const handleOpenHistory = async (item) => {
    setHistoryItem(item);
    setHistoryLoading(true);
    try {
      const response = await inventoryService.getHistory(item.id);
      if (response.data && response.data.success) {
        setHistoryLogs(response.data.history || []);
      }
    } catch (err) {
      console.error('Failed to load item history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredItems = items.filter(it => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      (it.name || '').toLowerCase().includes(q) ||
      (it.category || '').toLowerCase().includes(q) ||
      (it.unit || '').toLowerCase().includes(q);
    const matchesLowStock = !filterLowStockOnly || it.is_low_stock;
    const matchesCategory = categoryFilter === 'All' || it.category === categoryFilter;
    return matchesQuery && matchesLowStock && matchesCategory;
  });

  const lowStockCount = items.filter(it => it.is_low_stock).length;

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="Admin" />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-[#667085] hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-[#17243A]">Inventory & Stock Desk</h1>
              <p className="text-xs text-[#667085] hidden sm:block">
                Track physical relief inventory, trigger restock thresholds, and view audit history.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell align="right" />
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stock Item</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {error && (
            <Alert
              type="error"
              title="Notice"
              message={error}
              onClose={() => setError('')}
            />
          )}

          {success && (
            <Alert
              type="success"
              title="Success"
              message={success}
              onClose={() => setSuccess('')}
            />
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#667085]">Total Tracked SKUs</p>
                <p className="text-2xl font-extrabold text-[#17243A]">{items.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#EAF6F3] text-[#087F73] flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#667085]">Low-Stock Alerts</p>
                <p className={`text-2xl font-extrabold ${lowStockCount > 0 ? 'text-amber-600' : 'text-[#17243A]'}`}>
                  {lowStockCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#667085]">Total Distributed</p>
                <p className="text-2xl font-extrabold text-emerald-700">
                  {items.reduce((sum, it) => sum + (it.quantity_distributed || 0), 0)} Units
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar (V2.1) */}
          <SearchFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search inventory items by name, SKU, or category..."
            filters={[
              {
                id: 'category',
                label: 'Category',
                value: categoryFilter,
                onChange: setCategoryFilter,
                options: [
                  { value: 'All', label: 'All Categories' },
                  ...CATEGORIES.map(c => ({ value: c, label: c }))
                ]
              }
            ]}
            toggle={{
              id: 'low-stock-toggle',
              label: 'Low Stock Only',
              checked: filterLowStockOnly,
              onChange: setFilterLowStockOnly,
              badge: lowStockCount > 0 ? String(lowStockCount) : undefined
            }}
            onClearAll={() => {
              setSearchQuery('');
              setCategoryFilter('All');
              setFilterLowStockOnly(false);
            }}
          />

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-[#087F73] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-[#667085]">Loading inventory records...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#17243A]">No Inventory Items Found</h3>
                <p className="text-xs text-[#667085] mt-1">
                  Click "Add Stock Item" above to add new supplies to inventory.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] uppercase tracking-wider text-[#667085]">
                      <th className="py-3.5 px-4 font-bold">Item Name & Category</th>
                      <th className="py-3.5 px-4 font-bold">Unit</th>
                      <th className="py-3.5 px-4 font-bold text-right">Available Stock</th>
                      <th className="py-3.5 px-4 font-bold text-right">Distributed</th>
                      <th className="py-3.5 px-4 font-bold text-right">Low-Stock Alert Level</th>
                      <th className="py-3.5 px-4 font-bold text-center">Status</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50/50 transition-colors ${
                          item.is_low_stock ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="py-4 px-4 font-bold text-[#17243A]">
                          <div>{item.name}</div>
                          <span className="text-[11px] font-normal text-[#667085]">{item.category}</span>
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold text-[#667085]">
                          {item.unit}
                        </td>
                        <td className="py-4 px-4 text-right font-extrabold text-sm text-[#17243A]">
                          {item.quantity_available}
                        </td>
                        <td className="py-4 px-4 text-right text-xs text-gray-500 font-semibold">
                          {item.quantity_distributed}
                        </td>
                        <td className="py-4 px-4 text-right text-xs text-[#667085]">
                          &le; {item.low_stock_threshold}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <LowStockTag
                            isLowStock={item.is_low_stock}
                            quantity={item.quantity_available}
                            threshold={item.low_stock_threshold}
                            unit={item.unit}
                          />
                        </td>
                        <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenAdjust(item)}
                            className="text-xs"
                          >
                            Adjust Stock
                          </Button>
                          <button
                            onClick={() => handleOpenHistory(item)}
                            className="p-1.5 rounded-lg text-[#087F73] hover:bg-[#EAF6F3] transition-colors"
                            title="View Stock History Audit Log"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#17243A]">
                Add New Inventory Item
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <Input
                id="item_name"
                name="name"
                label="Item Name"
                placeholder="e.g. Dry Food Ration Kit (15kg)"
                value={addForm.name}
                onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                error={addErrors.name}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                    Category
                  </label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <Input
                  id="item_unit"
                  name="unit"
                  label="Unit"
                  placeholder="e.g. Kits, Pieces, Boxes, Kg"
                  value={addForm.unit}
                  onChange={(e) => setAddForm(prev => ({ ...prev, unit: e.target.value }))}
                  error={addErrors.unit}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="item_quantity"
                  name="quantity_available"
                  type="number"
                  min="0"
                  step="any"
                  label="Initial Available Stock"
                  value={addForm.quantity_available}
                  onChange={(e) => setAddForm(prev => ({ ...prev, quantity_available: e.target.value }))}
                  required
                />

                <Input
                  id="item_threshold"
                  name="low_stock_threshold"
                  type="number"
                  min="0"
                  step="any"
                  label="Low-Stock Alert Level"
                  value={addForm.low_stock_threshold}
                  onChange={(e) => setAddForm(prev => ({ ...prev, low_stock_threshold: e.target.value }))}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  disabled={adding}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={adding}
                >
                  Register Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-[#17243A]">
                  Adjust Stock &mdash; {adjustItem.name}
                </h3>
                <p className="text-xs text-[#667085]">
                  Current Stock: {adjustItem.quantity_available} {adjustItem.unit}
                </p>
              </div>
              <button
                onClick={() => setAdjustItem(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adjustError && (
              <Alert
                type="error"
                title="Adjustment Error"
                message={adjustError}
                onClose={() => setAdjustError('')}
              />
            )}

            <form onSubmit={handleSaveAdjust} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                    Operation
                  </label>
                  <select
                    value={adjustForm.changeType}
                    onChange={(e) => setAdjustForm(prev => ({ ...prev, changeType: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm"
                  >
                    <option value="Addition">+ Add Stock</option>
                    <option value="Deduction">- Deduct Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                    Quantity ({adjustItem.unit})
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={adjustForm.quantityChange}
                    onChange={(e) => setAdjustForm(prev => ({ ...prev, quantityChange: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                  Update Low-Stock Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={adjustForm.lowStockThreshold}
                  onChange={(e) => setAdjustForm(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                  Reason for Adjustment <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Received outside donation, Warehouse audit adjustment"
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAdjustItem(null)}
                  disabled={adjusting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={adjusting}
                >
                  Update Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Audit History Modal */}
      {historyItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-[#17243A]">
                  Inventory Audit Trail &mdash; {historyItem.name}
                </h3>
                <p className="text-xs text-[#667085]">
                  Current Available: {historyItem.quantity_available} {historyItem.unit}
                </p>
              </div>
              <button
                onClick={() => setHistoryItem(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {historyLoading ? (
                <div className="py-12 text-center">
                  <div className="w-6 h-6 border-2 border-[#087F73] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-[#667085]">Loading audit history...</p>
                </div>
              ) : historyLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#667085]">
                  No history entries recorded yet for this item.
                </div>
              ) : (
                historyLogs.map((log) => {
                  const isAdd = log.change_type === 'Addition';

                  return (
                    <div
                      key={log.id}
                      className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                        isAdd
                          ? 'bg-emerald-50/50 border-emerald-200/60'
                          : 'bg-amber-50/50 border-amber-200/60'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          {isAdd ? (
                            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-amber-600" />
                          )}
                          <span className={isAdd ? 'text-emerald-800' : 'text-amber-800'}>
                            {log.change_type}: {log.quantity} {historyItem.unit}
                          </span>
                        </div>
                        <p className="text-[#17243A] font-medium">{log.reason || 'General inventory transaction'}</p>
                        <p className="text-[11px] text-[#667085]">
                          Recorded by: {log.performed_by_name || 'Admin'}
                          {log.reference_type && ` (${log.reference_type})`}
                        </p>
                      </div>
                      <span className="text-[11px] text-[#667085] shrink-0">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryItem(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
