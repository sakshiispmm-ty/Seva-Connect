import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Alert from '../../components/Alert';
import RequestStatusBadge from '../../components/RequestStatusBadge';
import SearchFilterBar from '../../components/SearchFilterBar';
import { beneficiaryService } from '../../services/api';
import { 
  HeartHandshake, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  History, 
  Edit, 
  Menu, 
  X, 
  FileText,
  Clock,
  User
} from 'lucide-react';

export default function BeneficiaryManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    category: 'General Displaced / Low-income',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchBeneficiaries = async () => {
    setLoading(true);
    try {
      const response = await beneficiaryService.getAll({
        search: searchQuery,
        category: categoryFilter
      });
      if (response.data && response.data.success) {
        setBeneficiaries(response.data.beneficiaries || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load beneficiaries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, [categoryFilter]);

  const openAddModal = () => {
    setEditingBeneficiary(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      category: 'General Displaced / Low-income',
      notes: ''
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const openEditModal = (b) => {
    setEditingBeneficiary(b);
    setFormData({
      name: b.name || '',
      phone: b.phone || '',
      email: b.email || '',
      address: b.address || '',
      category: b.category || 'General Displaced / Low-income',
      notes: b.notes || ''
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleOpenHistory = async (b) => {
    setSelectedHistory(b);
    setHistoryLoading(true);
    try {
      const response = await beneficiaryService.getById(b.id);
      if (response.data && response.data.success) {
        setSelectedHistory(response.data.beneficiary);
      }
    } catch (err) {
      console.error('Failed to load beneficiary history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSaveBeneficiary = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.address.trim()) errs.address = 'Address is required for logistics.';
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (editingBeneficiary) {
        const response = await beneficiaryService.update(editingBeneficiary.id, formData);
        if (response.data && response.data.success) {
          setSuccess(`Beneficiary "${formData.name}" updated successfully.`);
          setShowAddModal(false);
          fetchBeneficiaries();
        }
      } else {
        const response = await beneficiaryService.create(formData);
        if (response.data && response.data.success) {
          setSuccess(`Beneficiary "${formData.name}" registered successfully.`);
          setShowAddModal(false);
          fetchBeneficiaries();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save beneficiary.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBeneficiaries = beneficiaries.filter(b => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (b.name || '').toLowerCase().includes(q) ||
      (b.phone || '').toLowerCase().includes(q) ||
      (b.address || '').toLowerCase().includes(q) ||
      (b.category || '').toLowerCase().includes(q);
    const matchesCategory = categoryFilter === 'All' || b.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
              <h1 className="text-xl font-extrabold text-[#17243A]">Beneficiary Registry</h1>
              <p className="text-xs text-[#667085] hidden sm:block">
                Manage individuals and families receiving NGO aid and track past request outcomes.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={openAddModal}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Beneficiary</span>
          </Button>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {error && (
            <Alert
              type="error"
              title="Registry Error"
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

          {/* Search & Filter Bar (V2.1) */}
          <SearchFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search beneficiaries by name, phone, category, or address..."
            filters={[
              {
                id: 'category',
                label: 'Category',
                value: categoryFilter,
                onChange: setCategoryFilter,
                options: [
                  { value: 'All', label: 'All Categories' },
                  { value: 'General Displaced / Low-income', label: 'General Displaced / Low-income' },
                  { value: 'Flood Victim', label: 'Flood Victim' },
                  { value: 'Medical Emergency', label: 'Medical Emergency' },
                  { value: 'Winter Wave Relief', label: 'Winter Wave Relief' },
                  { value: 'Elderly Care', label: 'Elderly Care' }
                ]
              }
            ]}
            onClearAll={() => {
              setSearchQuery('');
              setCategoryFilter('All');
            }}
          />

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-[#087F73] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-[#667085]">Loading beneficiaries...</p>
              </div>
            ) : filteredBeneficiaries.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#17243A]">No Beneficiaries Found</h3>
                <p className="text-xs text-[#667085] mt-1">
                  Click "Add Beneficiary" above or submit through the public Request Assistance portal.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] uppercase tracking-wider text-[#667085]">
                      <th className="py-3.5 px-4 font-bold">Beneficiary Name</th>
                      <th className="py-3.5 px-4 font-bold">Contact Info</th>
                      <th className="py-3.5 px-4 font-bold">Category & Situation</th>
                      <th className="py-3.5 px-4 font-bold">Address / Location</th>
                      <th className="py-3.5 px-4 font-bold text-center">Requests</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBeneficiaries.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4 font-bold text-[#17243A]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#EAF6F3] text-[#087F73] flex items-center justify-center font-bold text-xs shrink-0">
                              {b.name?.charAt(0)?.toUpperCase() || 'B'}
                            </div>
                            <span>{b.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs text-[#667085]">
                          <div>{b.phone || 'No phone'}</div>
                          {b.email && <div className="text-gray-400">{b.email}</div>}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {b.category || 'General'}
                          </span>
                          {b.notes && (
                            <p className="text-[11px] text-[#667085] mt-1 truncate max-w-xs">{b.notes}</p>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-[#667085] max-w-xs truncate">
                          <div className="flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <span>{b.address || 'Address not listed'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-[#EAF6F3] text-[#087F73]">
                            {b.total_requests || 0}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenHistory(b)}
                            className="p-1.5 rounded-lg text-[#087F73] hover:bg-[#EAF6F3] transition-colors"
                            title="View Assistance History"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(b)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                            title="Edit Beneficiary Details"
                          >
                            <Edit className="w-4 h-4" />
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

      {/* Add / Edit Beneficiary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#17243A]">
                {editingBeneficiary ? 'Edit Beneficiary Details' : 'Register New Beneficiary'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBeneficiary} className="space-y-4 text-left">
              <Input
                id="modal_name"
                name="name"
                label="Full Name"
                placeholder="e.g. Ramesh Chandra"
                value={formData.name}
                onChange={handleFormChange}
                error={formErrors.name}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="modal_phone"
                  name="phone"
                  label="Phone Number"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleFormChange}
                  icon={Phone}
                />
                <Input
                  id="modal_email"
                  name="email"
                  label="Email (Optional)"
                  placeholder="e.g. name@example.org"
                  value={formData.email}
                  onChange={handleFormChange}
                  icon={Mail}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                  Category / Household Classification
                </label>
                <input
                  type="text"
                  name="category"
                  placeholder="e.g. Flood Displaced, Destitute Single Parent, Elderly Destitute"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#087F73]/20 focus:border-[#087F73]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                  Delivery Address / Colony Landmark <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="address"
                  rows={2}
                  placeholder="Street / Colony / Ward details for field volunteers"
                  value={formData.address}
                  onChange={handleFormChange}
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#087F73]/20 ${
                    formErrors.address ? 'border-rose-400' : 'border-gray-300 focus:border-[#087F73]'
                  }`}
                />
                {formErrors.address && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                  Special Notes / Background
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Family composition, health vulnerabilities, urgent context..."
                  value={formData.notes}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#087F73]/20 focus:border-[#087F73]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submitting}
                >
                  {editingBeneficiary ? 'Save Changes' : 'Create Beneficiary'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Drawer / Modal */}
      {selectedHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-[#17243A]">
                  Assistance Request History &mdash; {selectedHistory.name}
                </h3>
                <p className="text-xs text-[#667085]">
                  Address: {selectedHistory.address} | Phone: {selectedHistory.phone || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setSelectedHistory(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {historyLoading ? (
                <div className="py-12 text-center">
                  <div className="w-6 h-6 border-2 border-[#087F73] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-[#667085]">Fetching request history...</p>
                </div>
              ) : !selectedHistory.requests || selectedHistory.requests.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#667085]">
                  No past assistance requests found for this beneficiary.
                </div>
              ) : (
                selectedHistory.requests.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#087F73]">#REQ-00{req.id}</span>
                      <RequestStatusBadge status={req.status} size="sm" />
                    </div>
                    <p className="text-sm font-semibold text-[#17243A]">{req.description}</p>
                    <div className="flex items-center justify-between text-[#667085] pt-1 border-t border-gray-200">
                      <span>Category: {req.category} ({req.quantity_needed})</span>
                      <span>{req.created_at ? new Date(req.created_at).toLocaleDateString() : ''}</span>
                    </div>
                    {req.admin_notes && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-md border border-amber-200">
                        Admin Note: {req.admin_notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedHistory(null)}
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
