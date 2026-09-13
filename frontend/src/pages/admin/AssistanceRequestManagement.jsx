import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import RequestStatusBadge from '../../components/RequestStatusBadge';
import { assistanceRequestService, inventoryService, volunteerService } from '../../services/api';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  XCircle, 
  PackageCheck, 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  Menu, 
  X, 
  Plus, 
  Trash2,
  AlertTriangle,
  Clock
} from 'lucide-react';

const STATUS_TABS = [
  'All',
  'Submitted',
  'Under Review',
  'Approved',
  'Resources Allocated',
  'Volunteer Assigned',
  'Completed',
  'Rejected'
];

export default function AssistanceRequestManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal State
  const [reviewModalRequest, setReviewModalRequest] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Allocate & Assign Modal State
  const [allocateModalRequest, setAllocateModalRequest] = useState(null);
  const [selectedAllocations, setSelectedAllocations] = useState([]);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [allocationNotes, setAllocationNotes] = useState('');
  const [allocatingSubmitting, setAllocatingSubmitting] = useState(false);
  const [allocationError, setAllocationError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, invRes, volRes] = await Promise.all([
        assistanceRequestService.getAll(),
        inventoryService.getAll(),
        volunteerService.getAll()
      ]);

      if (reqRes.data && reqRes.data.success) {
        setRequests(reqRes.data.requests || []);
      }
      if (invRes.data && invRes.data.success) {
        setInventoryItems(invRes.data.items || []);
      }
      if (volRes.data && volRes.data.success) {
        setVolunteers(volRes.data.volunteers || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assistance pipeline data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Review Actions
  const handleOpenReview = (req) => {
    setReviewModalRequest(req);
    setReviewStatus(req.status === 'Submitted' ? 'Approved' : req.status);
    setReviewNotes(req.admin_notes || '');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalRequest) return;
    setReviewSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await assistanceRequestService.review(reviewModalRequest.id, {
        status: reviewStatus,
        adminNotes: reviewNotes
      });

      if (response.data && response.data.success) {
        setSuccess(`Request #REQ-00${reviewModalRequest.id} marked as "${reviewStatus}".`);
        setReviewModalRequest(null);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Allocation & Volunteer Assignment Actions
  const handleOpenAllocate = (req) => {
    setAllocateModalRequest(req);
    setSelectedAllocations(
      inventoryItems.length > 0
        ? [{ inventory_item_id: inventoryItems[0].id, quantity: 1 }]
        : []
    );
    setSelectedVolunteerId(req.assigned_volunteer_id ? String(req.assigned_volunteer_id) : '');
    setAllocationNotes(req.admin_notes || '');
    setAllocationError('');
  };

  const addAllocationRow = () => {
    if (inventoryItems.length === 0) return;
    setSelectedAllocations(prev => [
      ...prev,
      { inventory_item_id: inventoryItems[0].id, quantity: 1 }
    ]);
  };

  const removeAllocationRow = (index) => {
    setSelectedAllocations(prev => prev.filter((_, i) => i !== index));
  };

  const updateAllocationRow = (index, field, value) => {
    setSelectedAllocations(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmitAllocate = async (e) => {
    e.preventDefault();
    if (!allocateModalRequest) return;
    setAllocationError('');
    setAllocatingSubmitting(true);

    // Client-side stock check
    for (const alloc of selectedAllocations) {
      const item = inventoryItems.find(it => it.id === parseInt(alloc.inventory_item_id, 10));
      if (!item) {
        setAllocationError('Please select a valid inventory item.');
        setAllocatingSubmitting(false);
        return;
      }
      const qty = parseFloat(alloc.quantity);
      if (isNaN(qty) || qty <= 0) {
        setAllocationError(`Please enter a valid positive quantity for "${item.name}".`);
        setAllocatingSubmitting(false);
        return;
      }
      if (item.quantity_available < qty) {
        setAllocationError(`Insufficient stock for "${item.name}": requested ${qty} ${item.unit}, but only ${item.quantity_available} available in inventory.`);
        setAllocatingSubmitting(false);
        return;
      }
    }

    try {
      const response = await assistanceRequestService.allocate(allocateModalRequest.id, {
        allocations: selectedAllocations,
        volunteerId: selectedVolunteerId ? parseInt(selectedVolunteerId, 10) : null,
        adminNotes: allocationNotes
      });

      if (response.data && response.data.success) {
        setSuccess(`Resources allocated and volunteer assignment updated for #REQ-00${allocateModalRequest.id}!`);
        setAllocateModalRequest(null);
        fetchData();
      }
    } catch (err) {
      setAllocationError(err.response?.data?.message || 'Server error allocating resources.');
    } finally {
      setAllocatingSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesTab = activeTab === 'All' || r.status === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (r.beneficiary_name || '').toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q) ||
      (r.category || '').toLowerCase().includes(q) ||
      String(r.id).includes(q);
    return matchesTab && matchesSearch;
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
              <h1 className="text-xl font-extrabold text-[#17243A]">Assistance Request Pipeline</h1>
              <p className="text-xs text-[#667085] hidden sm:block">
                Review beneficiary requests, allocate inventory stock, and assign delivery volunteers.
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {error && (
            <Alert
              type="error"
              title="Error"
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

          {/* Search and Tabs */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search requests by beneficiary name, description, category, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm text-[#17243A] focus:outline-none placeholder-gray-400"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-gray-100 pt-3">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? 'bg-[#087F73] text-white shadow-xs'
                      : 'bg-gray-100 text-[#667085] hover:text-[#17243A]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Requests Feed */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-[#087F73] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-[#667085]">Loading assistance pipeline...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#17243A]">No Requests in this Filter</h3>
                <p className="text-xs text-[#667085] mt-1">
                  Try selecting another status tab or checking search query.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 sm:p-6 hover:bg-gray-50/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-extrabold text-[#087F73]">
                          #REQ-00{req.id}
                        </span>
                        <RequestStatusBadge status={req.status} size="sm" />
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            req.urgency === 'High'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {req.urgency} Urgency
                        </span>
                        <span className="text-[11px] font-semibold text-[#667085]">
                          Category: {req.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {req.created_at ? new Date(req.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>

                      {/* Beneficiary details */}
                      <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#17243A]">
                            Beneficiary: {req.beneficiary_name}
                          </p>
                          <p className="text-xs text-[#667085] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            {req.beneficiary_address}
                          </p>
                        </div>
                        {req.beneficiary_phone && (
                          <a
                            href={`tel:${req.beneficiary_phone}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#087F73] bg-white px-2.5 py-1 rounded-lg border border-gray-200"
                          >
                            <Phone className="w-3 h-3" />
                            {req.beneficiary_phone}
                          </a>
                        )}
                      </div>

                      {/* Need & Allocations */}
                      <div>
                        <p className="text-xs font-semibold text-[#17243A]">
                          Requested: <span className="font-normal text-[#667085]">{req.description} ({req.quantity_needed})</span>
                        </p>
                        {req.allocations && req.allocations.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold text-[#087F73] uppercase tracking-wider">
                              Allocated from Inventory:
                            </span>
                            {req.allocations.map((a) => (
                              <span
                                key={a.id}
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md bg-[#EAF6F3] text-[#087F73] border border-[#087F73]/20 font-medium"
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                {a.quantity} {a.item_unit} &mdash; {a.item_name} ({a.distribution_status})
                              </span>
                            ))}
                          </div>
                        )}
                        {req.volunteer_name && (
                          <p className="mt-2 text-xs text-indigo-700 font-medium flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" />
                            Assigned Volunteer: <strong>{req.volunteer_name}</strong> ({req.volunteer_phone || 'No phone'})
                          </p>
                        )}
                        {req.admin_notes && (
                          <p className="mt-1 text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded-lg border border-amber-200">
                            Admin Note: {req.admin_notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex flex-wrap items-center gap-2.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReview(req)}
                      >
                        Review / Status
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenAllocate(req)}
                        className="flex items-center gap-1.5"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Allocate & Assign</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Review Modal */}
      {reviewModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#17243A]">
                Review Request #REQ-00{reviewModalRequest.id}
              </h3>
              <button
                onClick={() => setReviewModalRequest(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                  Verification Decision <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#087F73]/20 focus:border-[#087F73]"
                >
                  <option value="Approved">Approve (Proceed to resource allocation)</option>
                  <option value="Under Review">Under Review (Need further verification)</option>
                  <option value="Rejected">Reject (Not eligible / duplicate request)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                  Admin Verification Notes
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Verified via community leader. Situation genuine."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#087F73]/20 focus:border-[#087F73]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewModalRequest(null)}
                  disabled={reviewSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={reviewSubmitting}
                >
                  Save Decision
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Resources & Assign Volunteer Modal */}
      {allocateModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-[#17243A]">
                  Allocate Resources & Assign Volunteer
                </h3>
                <p className="text-xs text-[#667085]">
                  Request #REQ-00{allocateModalRequest.id} &mdash; {allocateModalRequest.beneficiary_name}
                </p>
              </div>
              <button
                onClick={() => setAllocateModalRequest(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {allocationError && (
              <Alert
                type="error"
                title="Allocation Error"
                message={allocationError}
                onClose={() => setAllocationError('')}
              />
            )}

            <form onSubmit={handleSubmitAllocate} className="space-y-4 flex-1 overflow-y-auto pr-1">
              {/* Item allocation rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#087F73]">
                    1. Deduct from Inventory Stock
                  </label>
                  <button
                    type="button"
                    onClick={addAllocationRow}
                    className="text-xs font-semibold text-[#087F73] hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                  </button>
                </div>

                {selectedAllocations.length === 0 ? (
                  <p className="text-xs text-[#667085] italic p-3 rounded-lg bg-gray-50">
                    No items selected. Click "Add Item" to allocate relief supplies from stock.
                  </p>
                ) : (
                  selectedAllocations.map((alloc, idx) => {
                    const currentItem = inventoryItems.find(
                      it => it.id === parseInt(alloc.inventory_item_id, 10)
                    );

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs"
                      >
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold text-[#17243A] mb-1">
                            Inventory Item
                          </label>
                          <select
                            value={alloc.inventory_item_id}
                            onChange={(e) => updateAllocationRow(idx, 'inventory_item_id', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium"
                          >
                            {inventoryItems.map(item => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.quantity_available} {item.unit} available)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full sm:w-28">
                          <label className="block text-[11px] font-semibold text-[#17243A] mb-1">
                            Quantity ({currentItem?.unit || 'qty'})
                          </label>
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={alloc.quantity}
                            onChange={(e) => updateAllocationRow(idx, 'quantity', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-bold"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeAllocationRow(idx)}
                          className="self-end sm:self-center p-2 rounded-lg text-rose-600 hover:bg-rose-50"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Volunteer Assignment */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#087F73] block">
                  2. Assign Field Volunteer
                </label>
                <select
                  value={selectedVolunteerId}
                  onChange={(e) => setSelectedVolunteerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-[#17243A]"
                >
                  <option value="">-- Select Volunteer (Or assign later) --</option>
                  {volunteers.map(vol => (
                    <option key={vol.user_id} value={vol.user_id}>
                      {vol.name} &mdash; Availability: {vol.availability} ({vol.assigned_tasks_count} active tasks)
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#17243A] mb-1">
                  Dispatch Instructions / Admin Note
                </label>
                <textarea
                  rows={2}
                  value={allocationNotes}
                  onChange={(e) => setAllocationNotes(e.target.value)}
                  placeholder="Instructions for volunteer regarding delivery timings or contact..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-[#17243A]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAllocateModalRequest(null)}
                  disabled={allocatingSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={allocatingSubmitting}
                >
                  Confirm Allocation & Assign
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
