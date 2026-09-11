import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { campaignService } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import QRCodeCard from '../components/QRCodeCard';
import {
  ArrowLeft,
  Calendar,
  Target,
  Heart,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCampaignDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await campaignService.getById(id);
      if (res.data?.success) {
        setCampaign(res.data.data);
      } else {
        setError('Campaign not found.');
      }
    } catch (err) {
      console.error('Failed to load campaign details:', err);
      setError(err.response?.data?.message || 'Failed to load campaign details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFCFB] flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-16 animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-10 w-3/4 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-2xl mb-8"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-[#FAFCFB] flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#17243A]">Campaign Not Found</h2>
          <p className="text-sm text-[#667085] mt-1">{error || 'Unable to display this campaign.'}</p>
          <Link to="/campaigns" className="mt-6 inline-block">
            <Button variant="primary" size="md">
              Return to Campaigns
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const target = Number(campaign.target_amount) || 0;
  const collected = Number(campaign.amount_collected) || 0;
  const percentage = target > 0 ? Math.min(Math.round((collected / target) * 100), 100) : 0;
  const donationUrl = `${window.location.origin}/donate?campaignId=${campaign.id}`;

  return (
    <div className="min-h-screen bg-[#FAFCFB] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <Link
          to="/campaigns"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#667085] hover:text-[#087F73] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Campaigns
        </Link>

        {/* Campaign Header Banner */}
        <div className="bg-gradient-to-r from-[#05665D] via-[#087F73] to-[#2EAD62] rounded-3xl p-8 sm:p-10 text-white shadow-md relative overflow-hidden mb-10">
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs border border-white/30">
                {campaign.category}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  campaign.status === 'Active'
                    ? 'bg-[#2EAD62] text-white'
                    : 'bg-amber-400 text-gray-900'
                }`}
              >
                {campaign.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {campaign.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mt-6 text-xs sm:text-sm text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Started: {new Date(campaign.start_date || campaign.created_at).toLocaleDateString('en-IN')}
                </span>
              </div>
              {campaign.end_date && (
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Target Date: {new Date(campaign.end_date).toLocaleDateString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Details & Impact */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
              <div className="flex justify-between items-baseline mb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                    Total Verified Funds
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-[#087F73] mt-0.5">
                    ₹{collected.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                    Target Goal
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-gray-700 mt-0.5">
                    ₹{target.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden my-2">
                <div
                  className="h-full bg-gradient-to-r from-[#087F73] to-[#2EAD62] rounded-full transition-all duration-700"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-[#667085] mt-2">
                <span className="font-semibold">{percentage}% of goal reached</span>
                <span>
                  Remaining: ₹{Math.max(0, target - collected).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Campaign Narrative */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-[#17243A] mb-4">
                About this Initiative
              </h2>
              <div className="prose prose-sm text-gray-600 leading-relaxed space-y-4">
                <p className="whitespace-pre-line">{campaign.description}</p>
              </div>

              {/* Integrity Notice */}
              <div className="mt-8 p-4 rounded-xl bg-[#EAF6F3]/60 border border-[#087F73]/20 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#087F73] shrink-0 mt-0.5" />
                <div className="text-xs text-[#17243A]">
                  <p className="font-bold">Transparent Verification Promise</p>
                  <p className="mt-0.5 text-[#667085]">
                    All monetary and item donations undergo stringent manual verification by our Trust coordinators. Progress metrics update only upon verified completion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Donation Action & QR Code */}
          <div className="space-y-6">
            {/* Quick Action Box */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF6F3] text-[#087F73] flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <h3 className="text-base font-bold text-[#17243A]">Support This Cause</h3>
              <p className="text-xs text-[#667085] mt-1 mb-5">
                Register your monetary contribution or item pledge directly with our volunteers.
              </p>

              <Link to={`/donate?campaignId=${campaign.id}`}>
                <Button variant="primary" size="lg" className="w-full justify-center shadow-sm" icon={Heart}>
                  Pledge Donation
                </Button>
              </Link>
            </div>

            {/* Interactive QR Code Card */}
            <QRCodeCard
              url={donationUrl}
              title="Share & Donate via QR"
              subtitle="Scan or copy link to share this campaign on WhatsApp, Telegram, or social media"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
