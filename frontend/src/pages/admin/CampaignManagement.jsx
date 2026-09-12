import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { campaignService } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Alert from '../../components/Alert';
import { getCampaignImage } from '../../utils/imageUtils';
import {
  Menu,
  Megaphone,
  Plus,
  Target,
  IndianRupee,
  ExternalLink,
  Edit2,
  X
} from 'lucide-react';

export default function CampaignManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentCampaignId, setCurrentCampaignId] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Disaster Relief');
  const [targetAmount, setTargetAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('Active');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const categories = [
    'Disaster Relief',
    'Education',
    'Healthcare',
    'Nutrition',
    'Community Care',
    'Women Empowerment',
    'Elderly Care',
    'Animal Welfare',
  ];

  const fetchCampaigns = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await campaignService.getAll();
      if (res.data?.success) {
        setCampaigns(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
      setError('Unable to load campaigns.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentCampaignId(null);
    setTitle('');
    setDescription('');
    setCategory('Disaster Relief');
    setTargetAmount('');
    setStartDate('2026-08-01');
    setEndDate('');
    setStatus('Active');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setModalMode('edit');
    setCurrentCampaignId(c.id);
    setTitle(c.title || '');
    setDescription(c.description || '');
    setCategory(c.category || 'Disaster Relief');
    setTargetAmount(String(c.target_amount !== undefined ? c.target_amount : (c.goal_amount || '')));
    const rawStart = c.start_date || c.created_at || '2026-08-01';
    const rawEnd = c.end_date || c.deadline || '';
    setStartDate(rawStart ? rawStart.split('T')[0] : '2026-08-01');
    setEndDate(rawEnd ? rawEnd.split('T')[0] : '');
    setStatus(c.status || 'Active');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError('Title and description are required.');
      return;
    }

    setFormSubmitting(true);
    setFormError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        target_amount: targetAmount ? Number(targetAmount) : 0,
        goal_amount: targetAmount ? Number(targetAmount) : 0,
        start_date: startDate || null,
        end_date: endDate || null,
        deadline: endDate || null,
        status,
      };

      if (modalMode === 'create') {
        await campaignService.create(payload);
      } else {
        await campaignService.update(currentCampaignId, payload);
      }

      setIsModalOpen(false);
      await fetchCampaigns();
    } catch (err) {
      console.error('Form submission failed:', err);
      setFormError(err.response?.data?.message || 'Failed to save campaign.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const totalFundsCollected = campaigns.reduce(
    (acc, c) => acc + (Number(c.amount_collected) || 0),
    0
  );
  const activeCount = campaigns.filter((c) => c.status === 'Active').length;

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
              <h1 className="text-xl font-bold text-[#17243A]">Campaign Management</h1>
              <p className="text-xs text-[#667085]">
                Create, monitor, and manage NGO fundraising & resource initiatives
              </p>
            </div>
          </div>

          <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
            New Campaign
          </Button>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Active Campaigns
                </p>
                <p className="text-2xl font-black text-[#087F73] mt-1">{activeCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EAF6F3] text-[#087F73] flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Total Campaigns
                </p>
                <p className="text-2xl font-black text-[#17243A] mt-1">{campaigns.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Verified Funds Raised
                </p>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  ₹{totalFundsCollected.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#17243A]">Initiatives Roster</h3>
              <span className="text-xs text-[#667085] font-medium">
                Showing {campaigns.length} total campaigns
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-[#667085] animate-pulse">
                Loading campaigns...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-sm text-rose-600 font-medium">
                {error}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="p-12 text-center">
                <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#17243A]">No Campaigns Created</h3>
                <p className="text-xs text-[#667085] mt-1 mb-4">
                  Get started by launching your first relief campaign.
                </p>
                <Button variant="primary" size="sm" onClick={openCreateModal}>
                  Create Campaign
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-[#667085] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Campaign</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Timeline</th>
                      <th className="py-3 px-4">Goal / Progress</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {campaigns.map((c) => {
                      const target = Number(c.target_amount) || 0;
                      const collected = Number(c.amount_collected) || 0;
                      const pct = target > 0 ? Math.min(Math.round((collected / target) * 100), 100) : 0;
                      const startDateStr = c.start_date || c.created_at || '2026-08-01';
                      const endDateStr = c.end_date || c.deadline;

                      return (
                        <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={getCampaignImage(c)}
                                alt={c.title}
                                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-100 shadow-2xs"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-[#17243A] truncate">{c.title}</p>
                                <p className="text-[11px] text-[#667085] truncate">{c.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-700 border border-gray-200">
                              {c.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-[11px] space-y-0.5">
                              <p className="text-gray-700 font-medium">
                                <span className="text-[#667085] font-normal">Start:</span>{' '}
                                <span className="font-semibold text-[#087F73]">
                                  {new Date(startDateStr).toLocaleDateString('en-IN')}
                                </span>
                              </p>
                              <p className="text-gray-700 font-medium">
                                <span className="text-[#667085] font-normal">End:</span>{' '}
                                <span>
                                  {endDateStr ? new Date(endDateStr).toLocaleDateString('en-IN') : 'Ongoing'}
                                </span>
                              </p>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="w-36">
                              <div className="flex justify-between text-[11px] font-medium mb-1">
                                <span>₹{collected.toLocaleString('en-IN')}</span>
                                <span className="font-bold text-[#087F73]">{pct}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#087F73] rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-400">
                                Target: ₹{target.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                c.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : c.status === 'Completed'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(c)}
                                className="p-1.5 text-gray-500 hover:text-[#087F73] hover:bg-[#EAF6F3] rounded-lg transition-colors"
                                title="Edit Campaign"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <Link
                                to={`/campaigns/${c.id}`}
                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Public View"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
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

      {/* Modal for Create/Edit Campaign */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#17243A]">
                {modalMode === 'create' ? 'Create New Campaign' : 'Edit Campaign Details'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="my-4">
                <Alert type="error" message={formError} />
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4 text-xs sm:text-sm">
              <Input
                label="Campaign Title *"
                type="text"
                placeholder="E.g., Winter Relief Drive 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description & Impact Goals *
                </label>
                <textarea
                  rows="3"
                  placeholder="Provide comprehensive details about beneficiaries and relief objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#087F73]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#087F73]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Target Amount (₹)"
                  type="number"
                  placeholder="100000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#087F73]"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={formSubmitting}
                >
                  {modalMode === 'create' ? 'Create Campaign' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
