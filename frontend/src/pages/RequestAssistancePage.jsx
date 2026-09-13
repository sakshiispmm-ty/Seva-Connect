import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import RequestStatusBadge from '../components/RequestStatusBadge';
import { assistanceRequestService } from '../services/api';
import { 
  HeartHandshake, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Package, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  'Food & Nutrition',
  'Winter Relief',
  'Medical & Health',
  'Education',
  'Hygiene & Water',
  'Emergency Disaster Relief'
];

export default function RequestAssistancePage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    category: 'Food & Nutrition',
    description: '',
    quantity_needed: '1 Kit',
    urgency: 'Medium',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submittedRequest, setSubmittedRequest] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.phone.trim()) errs.phone = 'Contact phone number is required.';
    if (!formData.address.trim()) errs.address = 'Detailed address or location is required for fulfillment.';
    if (!formData.description.trim()) errs.description = 'Please describe what assistance is urgently needed.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const response = await assistanceRequestService.submit(formData);
      if (response.data && response.data.success) {
        setSubmittedRequest(response.data.request);
      } else {
        setServerError(response.data?.message || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Unable to submit assistance request right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#087F73] via-[#05665D] to-[#17243A] text-white py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-semibold text-[#F7BA3E] mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Community Relief Support Channel
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Request NGO Aid & Resource Assistance
            </h1>
            <p className="mt-3 text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
              Are you or a family in your neighborhood in need of emergency food, winter woollens, medical supplies, or educational materials? Submit your request below for verified NGO dispatch.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-16">
          {submittedRequest ? (
            /* Success View */
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-[#17243A]">
                Assistance Request Submitted!
              </h2>
              <p className="mt-2 text-sm text-[#667085] max-w-md mx-auto">
                Your request has been securely recorded. An NGO coordinator will review your needs, verify available stock, and assign a local volunteer for doorstep delivery.
              </p>

              <div className="mt-6 p-5 rounded-xl bg-[#EAF6F3] border border-[#087F73]/20 max-w-lg mx-auto text-left space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#087F73]/10">
                  <span className="text-xs text-[#667085] font-semibold">Request Reference ID</span>
                  <span className="text-sm font-bold text-[#087F73]">#REQ-00{submittedRequest.id}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#087F73]/10">
                  <span className="text-xs text-[#667085] font-semibold">Current Status</span>
                  <RequestStatusBadge status={submittedRequest.status} size="sm" />
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#087F73]/10">
                  <span className="text-xs text-[#667085] font-semibold">Beneficiary Name</span>
                  <span className="text-xs font-bold text-[#17243A]">{submittedRequest.beneficiary_name}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#087F73]/10">
                  <span className="text-xs text-[#667085] font-semibold">Urgency</span>
                  <span className={`text-xs font-bold ${submittedRequest.urgency === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>
                    {submittedRequest.urgency} Priority
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#667085] font-semibold block mb-0.5">Assistance Needed</span>
                  <p className="text-xs text-[#17243A] italic bg-white p-2.5 rounded-lg border border-gray-100">
                    "{submittedRequest.description}" ({submittedRequest.quantity_needed})
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSubmittedRequest(null);
                    setFormData({
                      name: '',
                      phone: '',
                      email: '',
                      address: '',
                      category: 'Food & Nutrition',
                      description: '',
                      quantity_needed: '1 Kit',
                      urgency: 'Medium',
                      notes: ''
                    });
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-[#17243A] hover:bg-gray-50 transition-colors"
                >
                  Submit Another Request
                </button>
                <Link
                  to="/"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#087F73] text-sm font-semibold text-white hover:bg-[#05665D] transition-colors"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          ) : (
            /* Form View */
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#17243A]">
                  Beneficiary & Requirement Details
                </h2>
                <p className="text-xs sm:text-sm text-[#667085] mt-1">
                  All requests are reviewed directly by SevaConnect NGO administrators. No login is required.
                </p>
              </div>

              {serverError && (
                <Alert
                  type="error"
                  title="Submission Error"
                  message={serverError}
                  className="mb-6"
                  onClose={() => setServerError('')}
                />
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Beneficiary Info */}
                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#087F73]">
                    1. Beneficiary Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="name"
                      name="name"
                      label="Full Name of Beneficiary"
                      placeholder="e.g. Ramesh Chandra"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      required
                    />
                    <Input
                      id="phone"
                      name="phone"
                      label="Contact Phone Number"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      icon={Phone}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="email"
                      name="email"
                      label="Email Address (Optional)"
                      placeholder="e.g. contact@example.org"
                      value={formData.email}
                      onChange={handleChange}
                      icon={Mail}
                    />
                    <div>
                      <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                        Assistance Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#087F73]/20 focus:border-[#087F73]"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                      Delivery Address / Location Landmark <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      rows={2}
                      placeholder="House/Plot no., Area/Ward, Colony, Landmark for volunteer delivery"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#087F73]/20 ${
                        errors.address ? 'border-rose-400 focus:border-rose-500' : 'border-gray-300 focus:border-[#087F73]'
                      }`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.address}</p>
                    )}
                  </div>
                </div>

                {/* Need Details */}
                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#087F73]">
                    2. Specific Assistance Needed
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="quantity_needed"
                      name="quantity_needed"
                      label="Quantity / Estimated Count"
                      placeholder="e.g. 2 Ration Kits / 3 Blankets"
                      value={formData.quantity_needed}
                      onChange={handleChange}
                      icon={Package}
                    />

                    <div>
                      <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                        Urgency Level <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#087F73]/20 focus:border-[#087F73]"
                      >
                        <option value="Low">Low (Within 7-10 Days)</option>
                        <option value="Medium">Medium (Within 2-4 Days)</option>
                        <option value="High">High (Immediate / 24-48 Hours)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                      Detailed Description of Situation & Need <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      placeholder="Describe what items or support are required and any specific family/household circumstances..."
                      value={formData.description}
                      onChange={handleChange}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#087F73]/20 ${
                        errors.description ? 'border-rose-400 focus:border-rose-500' : 'border-gray-300 focus:border-[#087F73]'
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                      Additional Notes / Special Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      name="notes"
                      placeholder="e.g. Best time to call, family has newborn baby, elderly member at home"
                      value={formData.notes}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#087F73]/20 focus:border-[#087F73]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <span>Submit Assistance Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
