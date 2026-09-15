import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { donationService } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import DonationStatusBadge from '../../components/DonationStatusBadge';
import ReceiptView from '../../components/ReceiptView';
import DonationTimelineModal from '../../components/DonationTimelineModal';
import SearchFilterBar from '../../components/SearchFilterBar';
import Button from '../../components/Button';
import {
  Menu,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function DonationVerification() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Timeline Modal State
  const [timelineDonation, setTimelineDonation] = useState(null);

  // Verify Modal State
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedDonationToVerify, setSelectedDonationToVerify] = useState(null);

  // Complete Modal State
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedDonationToComplete, setSelectedDonationToComplete] = useState(null);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectDonationId, setRejectDonationId] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fetchDonations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await donationService.getAll();
      if (res.data?.success) {
        setDonations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load donations:', err);
      setError('Unable to load donation records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const openVerifyModal = (donation) => {
    setSelectedDonationToVerify(donation);
    setVerifyModalOpen(true);
  };

  const handleConfirmVerify = async () => {
    if (!selectedDonationToVerify) return;
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      await donationService.verify(selectedDonationToVerify.id);
      setVerifyModalOpen(false);
      setSelectedDonationToVerify(null);
      await fetchDonations();
      setFeedbackMessage({ type: 'success', text: 'Donation verified successfully! (Status: Verified)' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error('Failed to verify donation:', err);
      setFeedbackMessage({ type: 'error', text: err.response?.data?.message || 'Failed to verify donation.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openCompleteModal = (donation) => {
    setSelectedDonationToComplete(donation);
    setCompleteModalOpen(true);
  };

  const handleConfirmComplete = async () => {
    if (!selectedDonationToComplete) return;
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      await donationService.complete(selectedDonationToComplete.id);
      setCompleteModalOpen(false);
      setSelectedDonationToComplete(null);
      await fetchDonations();
      setFeedbackMessage({ type: 'success', text: 'Donation marked as Completed! Campaign totals updated.' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error('Failed to complete donation:', err);
      setFeedbackMessage({ type: 'error', text: err.response?.data?.message || 'Failed to mark donation as completed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (id) => {
    setRejectDonationId(id);
    setRejectionNotes('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectDonationId) return;
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      await donationService.reject(rejectDonationId, { notes: rejectionNotes });
      setRejectModalOpen(false);
      await fetchDonations();
      setFeedbackMessage({ type: 'success', text: 'Donation marked as rejected.' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error('Failed to reject donation:', err);
      setFeedbackMessage({ type: 'error', text: err.response?.data?.message || 'Failed to reject donation.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewReceipt = async (token) => {
    try {
      const res = await donationService.getReceipt(token);
      if (res.data?.success) {
        setSelectedReceipt(res.data.data);
      }
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: 'Unable to load receipt for this donation.' });
    }
  };

  const filtered = donations.filter((d) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchToken = d.token?.toLowerCase().includes(q);
      const matchName = d.donor_name?.toLowerCase().includes(q);
      const matchEmail = d.donor_email?.toLowerCase().includes(q);
      const matchCampaign = d.campaign_title?.toLowerCase().includes(q);
      if (!matchToken && !matchName && !matchEmail && !matchCampaign) return false;
    }
    if (statusFilter !== 'All' && d.status !== statusFilter) return false;
    if (typeFilter !== 'All' && d.donation_type !== typeFilter && !(typeFilter === 'Item' && d.donation_type === 'Items')) return false;
    return true;
  });

  const pendingCount = donations.filter((d) => d.status === 'Pending Verification').length;
  const verifiedCount = donations.filter((d) => d.status === 'Verified').length;
  const completedCount = donations.filter((d) => d.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-[#FAFCFB] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="Admin" />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#17243A]">Donation Verification Desk</h1>
              <p className="text-xs text-[#667085]">
                Audit registered intents, verify physical/bank pledges, and authorize 80G receipts
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Pending Verification
                </p>
                <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#087F73]">
                  Verified (In-Process)
                </p>
                <p className="text-2xl font-black text-[#087F73] mt-1">{verifiedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EAF6F3] text-[#087F73] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Completed & Disbursed
                </p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{completedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar (V2.1) */}
          <SearchFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search token (SC-DON-000001), donor name, email or campaign..."
            filters={[
              {
                id: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'All', label: 'All Statuses' },
                  { value: 'Pending Verification', label: 'Pending Verification' },
                  { value: 'Verified', label: 'Verified' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Rejected', label: 'Rejected' }
                ]
              },
              {
                id: 'type',
                label: 'Donation Type',
                value: typeFilter,
                onChange: setTypeFilter,
                options: [
                  { value: 'All', label: 'All Types' },
                  { value: 'Money', label: 'Money' },
                  { value: 'Item', label: 'Items / In-Kind' }
                ]
              }
            ]}
            onClearAll={() => {
              setSearchQuery('');
              setStatusFilter('All');
              setTypeFilter('All');
            }}
          />

          {/* Feedback message banner */}
          {feedbackMessage && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border shadow-xs transition-all ${
                feedbackMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <span>{feedbackMessage.text}</span>
              <button
                onClick={() => setFeedbackMessage(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {/* Donations Queue Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#17243A]">Donations Verification Queue</h3>
              <span className="text-xs text-[#667085] font-medium">
                {filtered.length} entries shown
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-[#667085] animate-pulse">
                Loading verification queue...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-sm text-rose-600 font-medium">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#17243A]">No Records Found</h3>
                <p className="text-xs text-[#667085] mt-1">
                  There are no donations matching your filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-[#667085] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Token / Date</th>
                      <th className="py-3 px-4">Donor Information</th>
                      <th className="py-3 px-4">Initiative</th>
                      <th className="py-3 px-4">Contribution</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filtered.map((d) => {
                      const isMoney = d.donation_type === 'Money';

                      return (
                        <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-[#087F73] block">
                              {d.token}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {new Date(d.created_at).toLocaleDateString('en-IN')}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-bold text-[#17243A]">{d.donor_name}</p>
                            <p className="text-[11px] text-gray-500">{d.donor_email}</p>
                            {d.donor_phone && (
                              <p className="text-[10px] text-gray-400">Ph: {d.donor_phone}</p>
                            )}
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <span className="font-semibold text-gray-800 line-clamp-1">
                              {d.campaign_title || 'General Community Relief Fund'}
                            </span>
                            {d.notes && (
                              <span className="block text-[10px] italic text-gray-400 truncate">
                                "{d.notes}"
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isMoney ? (
                              <span className="font-bold font-mono text-sm text-[#17243A]">
                                ₹{Number(d.amount).toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <div>
                                <span className="font-bold text-gray-900">
                                  {d.item_quantity || (d.quantity ? `${d.quantity} ${d.unit || 'units'}` : '1 unit')}
                                </span>
                                <span className="block text-[10px] text-gray-500 max-w-xs truncate" title={d.item_description || d.item_category}>
                                  {d.item_description || d.item_category || 'Material Contribution'}
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <DonationStatusBadge status={d.status} size="sm" />
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {/* Pending Verification Actions */}
                              {d.status === 'Pending Verification' && (
                                <>
                                  <button
                                    onClick={() => openVerifyModal(d)}
                                    disabled={actionLoading}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EAF6F3] text-[#087F73] hover:bg-[#087F73] hover:text-white transition-all shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                    title="Verify donation intent"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Verify</span>
                                  </button>
                                  <button
                                    onClick={() => openRejectModal(d.id)}
                                    disabled={actionLoading}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {/* Verified Actions */}
                              {d.status === 'Verified' && (
                                <>
                                  <button
                                    onClick={() => openCompleteModal(d)}
                                    disabled={actionLoading}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                                    title="Mark funds as deployed / item received"
                                  >
                                    Mark Completed
                                  </button>
                                  <button
                                    onClick={() => handleViewReceipt(d.token)}
                                    className="p-1.5 text-gray-500 hover:text-[#087F73] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                    title="View Receipt"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {/* Completed Action */}
                              {d.status === 'Completed' && (
                                <button
                                  onClick={() => handleViewReceipt(d.token)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-[#087F73] hover:text-white transition-all"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Receipt</span>
                                </button>
                              )}

                              {/* Rejected Status */}
                              {d.status === 'Rejected' && (
                                <span className="text-[11px] text-rose-600 italic">
                                  Declined
                                </span>
                              )}

                              {/* Status History Timeline Action */}
                              <button
                                onClick={() => setTimelineDonation(d)}
                                title="View status timeline history"
                                className="p-1.5 text-gray-400 hover:text-[#087F73] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Verify Modal Popup */}
      {verifyModalOpen && selectedDonationToVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF6F3] text-[#087F73] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17243A]">
                  Confirm Verification
                </h3>
                <p className="text-xs text-[#667085]">
                  Verify this donation registration
                </p>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Tracking Token:</span>
                <span className="font-mono font-bold text-[#087F73]">{selectedDonationToVerify.token}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Donor:</span>
                <span className="font-semibold text-gray-800">{selectedDonationToVerify.donor_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Contribution:</span>
                <span className="font-bold text-gray-900">
                  {selectedDonationToVerify.donation_type === 'Money'
                    ? `₹${Number(selectedDonationToVerify.amount).toLocaleString('en-IN')}`
                    : (selectedDonationToVerify.item_quantity || 'Items / In-Kind')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Initiative:</span>
                <span className="text-gray-700 truncate max-w-[200px]">
                  {selectedDonationToVerify.campaign_title || 'General Community Relief Fund'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#667085] mt-4 leading-relaxed">
              Are you sure you want to verify this donation? Verifying marks the pledge as confirmed and authorizes receipt generation.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setVerifyModalOpen(false);
                  setSelectedDonationToVerify(null);
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <button
                onClick={handleConfirmVerify}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#087F73] hover:bg-[#06635a] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal Popup */}
      {completeModalOpen && selectedDonationToComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17243A]">
                  Confirm Completion
                </h3>
                <p className="text-xs text-[#667085]">
                  Mark donation as completed and disbursed
                </p>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Tracking Token:</span>
                <span className="font-mono font-bold text-[#087F73]">{selectedDonationToComplete.token}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Donor:</span>
                <span className="font-semibold text-gray-800">{selectedDonationToComplete.donor_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Contribution:</span>
                <span className="font-bold text-gray-900">
                  {selectedDonationToComplete.donation_type === 'Money'
                    ? `₹${Number(selectedDonationToComplete.amount).toLocaleString('en-IN')}`
                    : (selectedDonationToComplete.item_quantity || 'Items / In-Kind')}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#667085] mt-4 leading-relaxed">
              Confirm that these funds have been received and deployed for the campaign. This will update the campaign's raised amount.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCompleteModalOpen(false);
                  setSelectedDonationToComplete(null);
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <button
                onClick={handleConfirmComplete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Completion</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-base font-bold text-[#17243A] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Confirm Rejection
            </h3>
            <p className="text-xs text-[#667085] mt-1.5">
              Please provide a reason or note for rejecting this donation registration.
            </p>

            <textarea
              rows="3"
              placeholder="E.g., Donor requested cancellation, or incorrect contact details provided..."
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              className="w-full mt-4 p-3 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
              >
                Cancel
              </Button>
              <button
                onClick={handleConfirmReject}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <ReceiptView
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* Visual Status Timeline Modal */}
      {timelineDonation && (
        <DonationTimelineModal
          isOpen={!!timelineDonation}
          donationId={timelineDonation.id}
          donationToken={timelineDonation.token}
          onClose={() => setTimelineDonation(null)}
        />
      )}
    </div>
  );
}
