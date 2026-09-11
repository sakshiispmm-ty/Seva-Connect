import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { donationService } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import DonationStatusBadge from '../components/DonationStatusBadge';
import {
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck
} from 'lucide-react';

export default function DonationSuccessPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get('token');

  const [donation, setDonation] = useState(location.state?.donation || null);
  const token = location.state?.token || tokenFromQuery || '';
  const [copied, setCopied] = useState(false);

  const fetchDonationByToken = async (tok) => {
    try {
      const res = await donationService.getByToken(tok);
      if (res.data?.success) {
        setDonation(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch donation token:', err);
    }
  };

  useEffect(() => {
    if (!donation && token) {
      fetchDonationByToken(token);
    }
  }, [token]);

  const handleCopy = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAFCFB] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Success Animation Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm text-center">
          {/* Animated Green Badge */}
          <div className="w-20 h-20 rounded-full bg-[#EAF6F3] text-[#087F73] flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
            Registration Confirmed
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-[#17243A] tracking-tight">
            Thank You for Your Generosity!
          </h1>
          <p className="text-sm sm:text-base text-[#667085] mt-2 max-w-lg mx-auto">
            Your donation intent has been securely recorded. Our NGO coordinators will review and verify your contribution shortly.
          </p>

          {/* Prominent Unique Tracking Token Card */}
          <div className="my-8 p-6 rounded-2xl bg-[#EAF6F3]/60 border-2 border-dashed border-[#087F73]/30 max-w-md mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#05665D]">
              Unique Donation Tracking Token
            </span>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-mono font-black text-[#087F73] tracking-widest">
                {token || 'SC-DON-PENDING'}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 bg-white border border-gray-200 hover:border-[#087F73] text-gray-700 hover:text-[#087F73] rounded-xl transition-all shadow-xs"
                title="Copy Token"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[11px] text-[#667085] mt-2">
              Save this reference token to check status or retrieve your official tax receipt.
            </p>
          </div>

          {/* Details Summary Table */}
          {donation && (
            <div className="border border-gray-100 bg-gray-50/70 rounded-2xl p-6 text-left text-xs sm:text-sm space-y-3 mb-8">
              <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                <span className="text-[#667085]">Donor</span>
                <span className="font-bold text-[#17243A]">{donation.donor_name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                <span className="text-[#667085]">Email</span>
                <span className="font-medium text-[#17243A]">{donation.donor_email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                <span className="text-[#667085]">Initiative / Campaign</span>
                <span className="font-bold text-[#087F73]">
                  {donation.campaign_title || 'General Community Relief Fund'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                <span className="text-[#667085]">Contribution</span>
                <span className="font-bold font-mono text-base text-[#17243A]">
                  {donation.donation_type === 'Money'
                    ? `₹${Number(donation.amount).toLocaleString('en-IN')}`
                    : `${donation.quantity} ${donation.unit || 'units'} (${donation.item_category})`}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#667085]">Verification Status</span>
                <DonationStatusBadge status={donation.status || 'Pending Verification'} />
              </div>
            </div>
          )}

          {/* Workflow Steps Explanation */}
          <div className="text-left bg-white border border-gray-200 rounded-2xl p-6 mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#087F73]" /> What Happens Next?
            </h3>
            <ol className="space-y-3 text-xs sm:text-sm text-[#17243A]">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#EAF6F3] text-[#087F73] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <strong>Coordinator Review:</strong> Our administrative team verifies the contribution and contacts you if offline handover or collection is needed.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#EAF6F3] text-[#087F73] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <strong>Official Verification:</strong> Once verified, status changes to <span className="font-semibold text-[#087F73]">Verified</span> and you can view your digital receipt.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#EAF6F3] text-[#087F73] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <strong>Completion & Impact:</strong> Once funds or items reach the field, status marks <span className="font-semibold text-emerald-700">Completed</span>, updating the public campaign progress bar.
                </span>
              </li>
            </ol>
          </div>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/donor/history" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full justify-center">
                View My Donations
              </Button>
            </Link>
            <Link to="/campaigns" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full justify-center">
                Explore More Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
