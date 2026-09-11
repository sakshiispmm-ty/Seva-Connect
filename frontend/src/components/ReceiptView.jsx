import React, { useRef } from 'react';
import { Printer, Download, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import Button from './Button';

export default function ReceiptView({ receipt, onClose }) {
  const printRef = useRef(null);

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const isMoney = receipt.donation_type === 'Money';
  const formattedAmount = isMoney && receipt.amount ? Number(receipt.amount).toLocaleString('en-IN') : null;
  const issueDate = new Date(receipt.verified_at || receipt.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-8">
        {/* Actions bar (hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#087F73]" />
            <span className="text-sm font-bold text-[#17243A]">Digital Donation Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              icon={Printer}
            >
              Print / Save PDF
            </Button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div
          ref={printRef}
          id="printable-receipt"
          className="p-8 sm:p-10 text-[#17243A] bg-white relative print:p-8"
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
            <span className="text-8xl font-black rotate-[-30deg] tracking-widest text-[#087F73]">
              SEVACONNECT
            </span>
          </div>

          {/* Receipt Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-[#087F73]/20 gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo.png"
                alt="SevaConnect"
                className="h-12 w-auto object-contain"
              />
              <div>
                <h2 className="text-lg font-black tracking-tight text-[#087F73]">
                  SevaConnect Foundation
                </h2>
                <p className="text-xs text-[#667085]">
                  Registered Charitable Trust • Reg. No: SC-2024/DEL/8892
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-block px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded bg-[#EAF6F3] text-[#087F73] border border-[#087F73]/30">
                Official Receipt
              </span>
              <p className="text-xs font-mono font-bold text-gray-800 mt-1">
                {receipt.receipt_number || `REC-${receipt.token}`}
              </p>
              <p className="text-[11px] text-[#667085]">Date: {issueDate}</p>
            </div>
          </div>

          {/* Tax Exemption Banner */}
          <div className="my-4 px-4 py-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Donations to SevaConnect are eligible for tax deduction under Section 80G of Income Tax Act.
              </span>
            </div>
            <span className="font-bold shrink-0 hidden sm:inline">80G APPROVED</span>
          </div>

          {/* Donor & Campaign Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-sm">
            <div className="space-y-1.5 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                Received With Thanks From
              </p>
              <p className="font-bold text-base text-[#17243A]">
                {receipt.donor_name || 'Generous Donor'}
              </p>
              <p className="text-xs text-gray-600">Email: {receipt.donor_email || 'N/A'}</p>
              {receipt.donor_phone && (
                <p className="text-xs text-gray-600">Phone: {receipt.donor_phone}</p>
              )}
              {receipt.donor_pan && (
                <p className="text-xs font-mono font-semibold text-gray-700">
                  PAN: {receipt.donor_pan}
                </p>
              )}
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                Allocated Purpose / Campaign
              </p>
              <p className="font-bold text-base text-[#087F73]">
                {receipt.campaign_title || 'General Community Relief Fund'}
              </p>
              <p className="text-xs text-gray-600">
                Category: <span className="font-semibold">{receipt.campaign_category || 'Relief'}</span>
              </p>
              <p className="text-xs text-gray-600">
                Tracking Token: <span className="font-mono font-bold text-gray-800">{receipt.token}</span>
              </p>
            </div>
          </div>

          {/* Donation Summary Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden my-6">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-[#667085]">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Qty / Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isMoney ? (
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-[#17243A]">Monetary Grant</td>
                    <td className="py-3.5 px-4 text-gray-600">
                      Contribution towards {receipt.campaign_title || 'Community Project'}
                      {receipt.notes && <span className="block text-xs italic text-gray-500">"{receipt.notes}"</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold font-mono text-base text-[#087F73]">
                      ₹ {formattedAmount}
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-[#17243A]">Item / Material In-Kind</td>
                    <td className="py-3.5 px-4 text-gray-600">
                      <p className="font-semibold text-gray-900">{receipt.item_category}</p>
                      <p className="text-xs">{receipt.item_description}</p>
                      {receipt.notes && <p className="text-xs italic text-gray-500">"{receipt.notes}"</p>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-[#17243A]">
                        {receipt.quantity} {receipt.unit || 'units'}
                      </span>
                      {receipt.estimated_value && (
                        <span className="block text-xs font-mono text-gray-500">
                          (Est. ₹{Number(receipt.estimated_value).toLocaleString('en-IN')})
                        </span>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Signature & Seal Area */}
          <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gray-500">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-semibold text-gray-700">SevaConnect Trust Secretariat</p>
              <p>Email: support@sevaconnect.org • Web: www.sevaconnect.org</p>
              <p className="text-[11px] text-gray-400">
                This is a system-generated verified electronic receipt.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              {/* Seal Stamp Graphic */}
              <div className="w-24 h-12 border-2 border-dashed border-[#087F73]/50 rounded-lg flex items-center justify-center p-1 bg-[#EAF6F3]/50">
                <span className="text-[10px] font-black uppercase text-[#087F73] tracking-widest text-center leading-tight">
                  SEVACONNECT<br />VERIFIED SEAL
                </span>
              </div>
              <p className="text-[10px] font-bold text-gray-600 mt-1">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
