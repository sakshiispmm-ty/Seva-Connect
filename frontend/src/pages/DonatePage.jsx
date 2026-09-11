import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { campaignService, donationService } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';
import {
  Heart,
  Package,
  IndianRupee,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

export default function DonatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const campaignIdFromQuery = searchParams.get('campaignId') || '';

  // Form State
  const [donationType, setDonationType] = useState('Money'); // 'Money' | 'Items'
  const [campaignId, setCampaignId] = useState(campaignIdFromQuery);
  const [campaigns, setCampaigns] = useState([]);

  // Donor Details
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [donorPhone, setDonorPhone] = useState(user?.phone || '');

  // Money specifics
  const [amount, setAmount] = useState('1000');
  const [customAmount, setCustomAmount] = useState('');

  // Item specifics
  const [itemCategory, setItemCategory] = useState('Food & Rations');
  const [itemDescription, setItemDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('kits');
  const [estimatedValue, setEstimatedValue] = useState('');

  // Common
  const [notes, setNotes] = useState('');

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const presetAmounts = ['500', '1000', '2500', '5000', '10000'];
  const itemCategories = [
    'Food & Rations',
    'Clothes & Woollens',
    'Medical Supplies & First Aid',
    'Books & Stationery',
    'Blankets & Bedding',
    'Electronics / Educational Tablets',
    'Hygiene & Sanitation',
    'Other Relief Materials',
  ];
  const unitOptions = ['kits', 'pieces', 'kg', 'boxes', 'sets', 'litres'];

  const fetchActiveCampaigns = async () => {
    try {
      const res = await campaignService.getAll({ status: 'Active' });
      if (res.data?.success) {
        setCampaigns(res.data.data);
        if (!campaignId && res.data.data.length > 0) {
          setCampaignId(campaignIdFromQuery || String(res.data.data[0].id));
        }
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    }
  };

  useEffect(() => {
    fetchActiveCampaigns();
  }, []);

  useEffect(() => {
    if (user) {
      if (!donorName) setDonorName(user.name || '');
      if (!donorEmail) setDonorEmail(user.email || '');
      if (!donorPhone && user.phone) setDonorPhone(user.phone || '');
    }
  }, [user]);

  const validate = () => {
    const errors = {};
    if (!donorName.trim()) errors.donorName = 'Donor full name is required';
    if (!donorEmail.trim()) {
      errors.donorEmail = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(donorEmail)) {
      errors.donorEmail = 'Please provide a valid email address';
    }

    if (donationType === 'Money') {
      const finalAmount = customAmount ? Number(customAmount) : Number(amount);
      if (!finalAmount || finalAmount < 10) {
        errors.amount = 'Minimum contribution amount is ₹10';
      }
    } else {
      if (!itemDescription.trim()) {
        errors.itemDescription = 'Please describe the donated items';
      }
      if (!quantity || Number(quantity) <= 0) {
        errors.quantity = 'Quantity must be at least 1';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      const finalAmount = customAmount ? Number(customAmount) : Number(amount);
      const payload = {
        campaign_id: campaignId ? Number(campaignId) : null,
        donation_type: donationType,
        donor_name: donorName.trim(),
        donor_email: donorEmail.trim(),
        donor_phone: donorPhone.trim() || null,
        amount: donationType === 'Money' ? finalAmount : null,
        item_category: donationType === 'Items' ? itemCategory : null,
        item_description: donationType === 'Items' ? itemDescription.trim() : null,
        quantity: donationType === 'Items' ? Number(quantity) : null,
        unit: donationType === 'Items' ? unit : null,
        estimated_value: donationType === 'Items' && estimatedValue ? Number(estimatedValue) : null,
        notes: notes.trim() || null,
      };

      const res = await donationService.register(payload);
      if (res.data?.success) {
        navigate('/donation-success', {
          state: {
            donation: res.data.data,
            token: res.data.token,
          },
        });
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Failed to submit donation intent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFCFB] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Link */}
        <Link
          to="/campaigns"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#667085] hover:text-[#087F73] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>

        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF6F3] text-[#087F73] text-xs font-bold uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5 fill-current" />
            Make a Difference
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17243A] tracking-tight">
            Pledge Your Contribution
          </h1>
          <p className="text-sm text-[#667085] mt-1.5">
            Register your monetary gift or material resources. You will receive a unique tracking token and an 80G tax receipt once verified.
          </p>
        </div>

        {/* Informational Policy Notice */}
        <div className="bg-[#EAF6F3]/70 border border-[#087F73]/25 rounded-2xl p-4 sm:p-5 mb-8 flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-[#087F73] shrink-0 mt-0.5" />
          <div className="text-xs text-[#17243A] leading-relaxed">
            <span className="font-bold text-[#05665D]">Zero-Processing Fee / Intent Model: </span>
            SevaConnect does not operate automated payment processors or debit your cards directly. Submitting this form creates a registered intent with a unique identifier token. Our NGO coordinators will verify the contribution and confirm receipt.
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" title="Submission Error" message={error} />
          </div>
        )}

        {/* Main Donation Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm space-y-8"
        >
          {/* Step 1: Donation Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#667085] mb-3">
              1. Select Donation Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDonationType('Money')}
                className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  donationType === 'Money'
                    ? 'border-[#087F73] bg-[#EAF6F3] text-[#087F73] font-bold shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <IndianRupee className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-sm font-bold">Monetary Donation</div>
                  <div className="text-[11px] text-gray-500 font-normal">Fund relief projects</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDonationType('Items')}
                className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  donationType === 'Items'
                    ? 'border-[#087F73] bg-[#EAF6F3] text-[#087F73] font-bold shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <Package className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-sm font-bold">In-Kind / Item Donation</div>
                  <div className="text-[11px] text-gray-500 font-normal">Rations, clothes, books</div>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Target Campaign */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#667085] mb-2">
              2. Target Initiative / Cause
            </label>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm text-[#17243A] font-medium focus:outline-none focus:ring-2 focus:ring-[#087F73] shadow-xs"
            >
              <option value="">General Community Relief Fund (Unallocated)</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.category})
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Type-specific Inputs */}
          {donationType === 'Money' ? (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
                3. Contribution Amount (₹)
              </label>

              {/* Preset Chips */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      amount === amt && !customAmount
                        ? 'bg-[#087F73] text-white shadow-xs'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700'
                    }`}
                  >
                    ₹{Number(amt).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              {/* Custom Amount input */}
              <div className="relative mt-3">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Or enter custom amount in Rupees"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount('');
                  }}
                  min="10"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 text-sm font-bold text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#087F73] shadow-xs"
                />
              </div>
              {fieldErrors.amount && (
                <p className="text-xs text-rose-600 font-medium">{fieldErrors.amount}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
                3. Item Details & Specifications
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 font-semibold mb-1">
                    Category *
                  </label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#087F73]"
                  >
                    {itemCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 font-semibold mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#087F73]"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-xs text-gray-600 font-semibold mb-1">
                      Unit *
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-2 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#087F73]"
                    >
                      {unitOptions.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 font-semibold mb-1">
                  Item Description *
                </label>
                <textarea
                  rows="3"
                  placeholder="E.g., 10 brand new dry ration food kits containing wheat flour, lentils, sugar, cooking oil."
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F73]"
                />
                {fieldErrors.itemDescription && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    {fieldErrors.itemDescription}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-600 font-semibold mb-1">
                  Estimated Total Value (Optional ₹)
                </label>
                <input
                  type="number"
                  placeholder="Estimated valuation in INR"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F73]"
                />
              </div>
            </div>
          )}

          {/* Step 4: Donor Identity */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
                4. Donor Information
              </label>
              {isAuthenticated && (
                <span className="text-[11px] font-semibold text-[#087F73] bg-[#EAF6F3] px-2 py-0.5 rounded-full">
                  Logged in as {user?.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                type="text"
                placeholder="Enter your name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                error={fieldErrors.donorName}
              />
              <Input
                label="Email Address *"
                type="email"
                placeholder="name@example.com"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                error={fieldErrors.donorEmail}
              />
            </div>

            <div>
              <Input
                label="Phone Number (Optional)"
                type="tel"
                placeholder="+91 98765 43210"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 font-semibold mb-1">
                Dedication or Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="E.g., In memory of..., or drop-off time preference"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F73]"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-gray-100">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center shadow-md font-bold"
              loading={loading}
              icon={Heart}
            >
              {loading ? 'Registering Intent...' : 'Confirm & Register Donation'}
            </Button>
            <p className="text-center text-[11px] text-gray-400 mt-2">
              By confirming, a unique reference token is issued for status tracking and receipt generation.
            </p>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
