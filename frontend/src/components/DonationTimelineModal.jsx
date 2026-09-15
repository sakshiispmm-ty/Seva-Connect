import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, X, Loader2, ArrowRight } from 'lucide-react';
import { donationService } from '../services/api';
import Alert from './Alert';
import Button from './Button';

export default function DonationTimelineModal({
  donationId,
  donationToken,
  isOpen = false,
  onClose
}) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !donationId) return;

    const fetchTimeline = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await donationService.getTimeline(donationId);
        setTimeline(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load donation timeline:', err);
        setError('Failed to load status history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [isOpen, donationId]);

  if (!isOpen) return null;

  // Expected stages in typical flow
  const stages = [
    { key: 'Submitted', label: 'Donation Submitted', desc: 'Registered in the system by donor' },
    { key: 'Pending Verification', label: 'Pending Verification', desc: 'Under review by NGO finance team' },
    { key: 'Verified', label: 'Payment Verified', desc: 'Transaction verified and receipt issued' },
    { key: 'Completed', label: 'Allocation Completed', desc: 'Funds or items allocated to beneficiary cause' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#087F73] to-[#05665D] text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Donation Status Timeline</h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              Donation #{donationId} {donationToken ? `· Ref: ${donationToken}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
              className="mb-4"
            />
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#087F73]" />
              <p className="text-sm">Loading timeline records...</p>
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Clock className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-medium">No timeline events recorded yet.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-[#087F73] before:to-gray-200">
              {timeline.map((entry, idx) => {
                const isRejected = entry.new_status === 'Rejected';
                const isCompleted = entry.new_status === 'Completed';
                const isVerified = entry.new_status === 'Verified';

                const formattedDate = entry.created_at
                  ? new Date(entry.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '—';

                return (
                  <div key={entry.id || idx} className="relative group">
                    {/* Circle Node on Timeline */}
                    <div
                      className={`absolute -left-[31px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${
                        isRejected
                          ? 'border-rose-500 text-rose-500'
                          : isCompleted || isVerified
                          ? 'border-[#087F73] text-[#087F73]'
                          : 'border-amber-500 text-amber-500'
                      }`}
                    >
                      {isRejected ? (
                        <XCircle className="w-3.5 h-3.5" />
                      ) : isCompleted || isVerified ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Step Card */}
                    <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-4 space-y-1.5 transition hover:bg-white hover:shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-sm font-bold ${
                            isRejected
                              ? 'text-rose-700'
                              : isCompleted
                              ? 'text-emerald-700'
                              : isVerified
                              ? 'text-[#087F73]'
                              : 'text-amber-800'
                          }`}
                        >
                          {entry.new_status}
                        </span>
                        <span className="text-xs text-gray-400">{formattedDate}</span>
                      </div>

                      {entry.old_status && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <span>Transitioned from</span>
                          <span className="font-semibold text-gray-600">{entry.old_status}</span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span className="font-semibold text-gray-800">{entry.new_status}</span>
                        </div>
                      )}

                      {entry.notes && (
                        <p className="text-xs text-gray-600 bg-white border border-gray-100 rounded-lg p-2.5 mt-1.5">
                          {entry.notes}
                        </p>
                      )}

                      {entry.changed_by_name && (
                        <p className="text-[11px] text-gray-400 pt-0.5">
                          Updated by: <span className="font-medium text-gray-600">{entry.changed_by_name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
