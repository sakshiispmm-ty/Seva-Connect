import React, { useState, useEffect, useMemo } from 'react';
import { feedbackService } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Alert from '../../components/Alert';
import SearchFilterBar from '../../components/SearchFilterBar';
import FeedbackList from '../../components/FeedbackList';
import {
  Menu,
  MessageSquare,
  Star,
  HeartHandshake,
  Briefcase,
  Award,
  TrendingUp
} from 'lucide-react';

export default function FeedbackManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');

  const fetchFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (targetTypeFilter !== 'All') params.target_type = targetTypeFilter;
      if (ratingFilter !== 'All') params.rating = Number(ratingFilter);
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await feedbackService.getAll(params);
      setFeedbackItems(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
      setError('Could not load feedback records. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [targetTypeFilter, ratingFilter]);

  // Client search if needed or triggered
  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    fetchFeedback();
  };

  // Metrics
  const metrics = useMemo(() => {
    if (!feedbackItems || feedbackItems.length === 0) {
      return { total: 0, avg: '0.0', donations: 0, tasks: 0, campaigns: 0 };
    }
    const total = feedbackItems.length;
    const sum = feedbackItems.reduce((acc, f) => acc + (Number(f.rating) || 0), 0);
    const avg = (sum / total).toFixed(1);
    const donations = feedbackItems.filter((f) => (f.target_type || f.feedback_type) === 'Donation').length;
    const tasks = feedbackItems.filter((f) => (f.target_type || f.feedback_type) === 'VolunteerTask').length;
    const campaigns = feedbackItems.filter((f) => (f.target_type || f.feedback_type) === 'Campaign').length;
    return { total, avg, donations, tasks, campaigns };
  }, [feedbackItems]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setTargetTypeFilter('All');
    setRatingFilter('All');
  };

  return (
    <div className="min-h-screen bg-[#FAFCFB] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="Admin" />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 sticky top-0 z-10 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#17243A]">Internal Feedback & Reviews</h1>
              <p className="text-xs text-[#667085] mt-0.5">
                Administrative oversight of ratings & feedback from donors and volunteers
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
            />
          )}

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Total Feedback
                </p>
                <p className="text-2xl font-black text-[#17243A] mt-1">{metrics.total}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Average Rating
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-amber-500">{metrics.avg}</span>
                  <span className="text-xs text-gray-400">/ 5.0</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Donation Reviews
                </p>
                <p className="text-2xl font-black text-[#087F73] mt-1">{metrics.donations}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#087F73] flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Volunteer Tasks
                </p>
                <p className="text-2xl font-black text-purple-600 mt-1">{metrics.tasks}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <SearchFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by reviewer name, comment, or cause..."
            filters={[
              {
                id: 'target_type',
                label: 'Category',
                value: targetTypeFilter,
                onChange: setTargetTypeFilter,
                options: [
                  { value: 'All', label: 'All Categories' },
                  { value: 'Donation', label: 'Donations' },
                  { value: 'VolunteerTask', label: 'Volunteer Tasks' },
                  { value: 'Campaign', label: 'Campaigns' }
                ]
              },
              {
                id: 'rating',
                label: 'Rating',
                value: ratingFilter,
                onChange: setRatingFilter,
                options: [
                  { value: 'All', label: 'All Ratings' },
                  { value: '5', label: '5 Stars ★★★★★' },
                  { value: '4', label: '4 Stars ★★★★☆' },
                  { value: '3', label: '3 Stars ★★★☆☆' },
                  { value: '2', label: '2 Stars ★★☆☆☆' },
                  { value: '1', label: '1 Star  ★☆☆☆☆' }
                ]
              }
            ]}
            onReset={handleResetFilters}
            activeFiltersCount={
              (targetTypeFilter !== 'All' ? 1 : 0) +
              (ratingFilter !== 'All' ? 1 : 0) +
              (searchQuery ? 1 : 0)
            }
          />

          {/* Feedback List */}
          <FeedbackList items={feedbackItems} loading={loading} />
        </main>
      </div>
    </div>
  );
}
