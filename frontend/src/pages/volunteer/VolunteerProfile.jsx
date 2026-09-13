import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { volunteerService } from '../../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  Wrench, 
  Calendar, 
  CheckCircle2, 
  Menu, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function VolunteerProfile() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    skills: '',
    availability: 'Available on Weekends & Evenings',
    status: 'Active'
  });

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError('');
      try {
        const response = await volunteerService.getProfile();
        if (response.data && response.data.success) {
          const prof = response.data.profile || {};
          setFormData({
            name: prof.name || user?.name || '',
            email: prof.email || user?.email || '',
            phone: prof.phone || user?.phone || '',
            skills: prof.skills || '',
            availability: prof.availability || 'Available on Weekends & Evenings',
            status: prof.status || 'Active'
          });
        }
      } catch (err) {
        console.warn('Could not load existing volunteer profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await volunteerService.updateProfile({
        skills: formData.skills,
        availability: formData.availability,
        status: formData.status
      });

      if (response.data && response.data.success) {
        setSuccess('Volunteer profile and availability successfully updated!');
      } else {
        setError(response.data?.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="Volunteer" />

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
              <h1 className="text-xl font-extrabold text-[#17243A]">Volunteer Profile & Skills</h1>
              <p className="text-xs text-[#667085] hidden sm:block">
                Manage your capabilities and availability for NGO dispatch tasks.
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-8 max-w-3xl w-full mx-auto space-y-6">
          {error && (
            <Alert
              type="error"
              title="Profile Notice"
              message={error}
              onClose={() => setError('')}
            />
          )}

          {success && (
            <Alert
              type="success"
              title="Saved"
              message={success}
              onClose={() => setSuccess('')}
            />
          )}

          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-[#087F73] text-white flex items-center justify-center font-bold text-2xl">
                {formData.name?.charAt(0)?.toUpperCase() || 'V'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#17243A]">{formData.name}</h2>
                <p className="text-xs text-[#667085]">{formData.email}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#087F73] bg-[#EAF6F3] px-2 py-0.5 rounded-full border border-[#087F73]/20">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Field Volunteer
                </span>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-4 border-[#087F73] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-[#667085]">Loading profile details...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="name"
                    name="name"
                    label="Full Name"
                    value={formData.name}
                    disabled
                    icon={User}
                  />
                  <Input
                    id="phone"
                    name="phone"
                    label="Contact Phone"
                    value={formData.phone}
                    disabled
                    icon={Phone}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                    Skills & Areas of Interest
                  </label>
                  <input
                    type="text"
                    name="skills"
                    placeholder="e.g. Emergency First Aid, Food Distribution, Vehicle Logistics, Child Tutoring"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#087F73]/20 focus:border-[#087F73]"
                  />
                  <p className="text-[11px] text-[#667085] mt-1">
                    NGO administrators review your skills when assigning specialized assistance tasks.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                      Availability Windows
                    </label>
                    <input
                      type="text"
                      name="availability"
                      placeholder="e.g. Weekends, Daily 5PM-8PM, On-Call Emergency"
                      value={formData.availability}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#087F73]/20 focus:border-[#087F73]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#17243A] mb-1.5">
                      Volunteer Active Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#087F73]/20 focus:border-[#087F73]"
                    >
                      <option value="Active">Active (Ready for task assignments)</option>
                      <option value="Inactive">Inactive (Temporarily unavailable)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={saving}
                    className="w-full sm:w-auto px-8"
                  >
                    Save Volunteer Profile
                  </Button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
