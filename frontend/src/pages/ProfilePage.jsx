import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { User, Mail, Phone, Shield, ArrowLeft, Save, CheckCircle2, Lock } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'Donor'
      });
    }
  }, [user]);

  const validate = () => {
    const errs = {};
    const phoneRegex = /^[0-9+\s\-()]{7,20}$/;

    if (!formData.name.trim()) {
      errs.name = 'Full Name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Full Name must be at least 2 characters.';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number (7-20 digits).';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const result = await updateProfile(formData.name.trim(), formData.phone.trim());
      if (result.success) {
        setSuccessMsg('Your profile has been updated successfully.');
      } else {
        setErrorMsg(result.message || 'Failed to update profile.');
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Server error updating profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const backLink = user?.role === 'Admin' ? '/admin' : '/donor';

  return (
    <div className="min-h-screen bg-[#EAF6F3] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header with Official Logo & Back Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center">
            <img
              src="/assets/logo.png"
              alt="SevaConnect Official Logo"
              className="h-12 w-auto max-h-12 object-contain"
            />
          </Link>

          <Link
            to={backLink}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#087F73] hover:text-[#05665D] bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Cover Header */}
          <div className="bg-gradient-to-r from-[#087F73] to-[#05665D] p-6 sm:p-8 text-white flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-black text-2xl shadow-inner shrink-0">
              {formData.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-black">{formData.name || 'User Profile'}</h1>
              <p className="text-xs text-[#EAF6F3] mt-0.5">{formData.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20">
                <Shield className="w-3.5 h-3.5" />
                Role: {formData.role}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {successMsg && (
              <Alert
                type="success"
                title="Success"
                message={successMsg}
                className="mb-6"
                onClose={() => setSuccessMsg('')}
              />
            )}

            {errorMsg && (
              <Alert
                type="error"
                title="Update Failed"
                message={errorMsg}
                className="mb-6"
                onClose={() => setErrorMsg('')}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name (Editable) */}
                <Input
                  id="name"
                  name="name"
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  icon={User}
                  required
                  disabled={loading}
                  helper="You can update your personal display name."
                />

                {/* Phone Number (Editable) */}
                <Input
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  icon={Phone}
                  required
                  disabled={loading}
                  helper="Used for essential notifications."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-gray-100">
                {/* Email (Read-Only in V1.1) */}
                <div>
                  <label className="block text-sm font-semibold text-[#17243A] mb-1.5 flex items-center justify-between">
                    <span>Email Address</span>
                    <span className="text-xs text-[#667085] flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="block w-full rounded-lg border border-gray-200 bg-gray-100 text-[#667085] text-sm pl-10 pr-3.5 py-2.5 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[#667085]">
                    Email address is tied to your login identity and cannot be changed in V1.1.
                  </p>
                </div>

                {/* Role (Read-Only) */}
                <div>
                  <label className="block text-sm font-semibold text-[#17243A] mb-1.5 flex items-center justify-between">
                    <span>Assigned Role</span>
                    <span className="text-xs text-[#667085] flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Fixed
                    </span>
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
                      <Shield className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.role}
                      disabled
                      className="block w-full rounded-lg border border-gray-200 bg-gray-100 text-[#667085] text-sm pl-10 pr-3.5 py-2.5 cursor-not-allowed font-bold"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[#667085]">
                    Account roles are enforced by the server and cannot be modified from profile.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-gray-100">
                <Link to={backLink} className="w-full sm:w-auto">
                  <Button variant="ghost" size="md" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  loading={loading}
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
