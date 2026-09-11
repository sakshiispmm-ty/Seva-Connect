import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { campaignService } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { Search, Megaphone, Heart, Target } from 'lucide-react';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('Active');

  const categories = ['All', 'Disaster Relief', 'Education', 'Healthcare', 'Nutrition', 'Community Care'];

  const fetchCampaigns = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const res = await campaignService.getAll(params);
      if (res.data?.success) {
        setCampaigns(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
      setError('Unable to load campaigns. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [selectedCategory, selectedStatus]);

  const filteredCampaigns = campaigns.filter((c) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.title?.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query) ||
      c.category?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#FAFCFB] flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#EAF6F3]/70 to-[#FAFCFB] border-b border-gray-200/70 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF6F3] border border-[#087F73]/20 text-[#087F73] text-xs font-bold uppercase tracking-wider mb-4">
            <Megaphone className="w-3.5 h-3.5" />
            Verified Relief Initiatives
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17243A] tracking-tight">
            Active Community Campaigns
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[#667085] max-w-2xl mx-auto">
            Discover transparent NGO initiatives, review verified needs, and pledge donations towards community relief and education.
          </p>

          {/* Search & Filter Controls */}
          <div className="mt-8 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns by title, keywords or purpose..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#087F73] focus:border-transparent transition-all shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#087F73] shadow-xs"
              >
                <option value="Active">Active Only</option>
                <option value="Completed">Completed</option>
                <option value="All">All Statuses</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#087F73] text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-[#667085] hover:border-[#087F73] hover:text-[#087F73]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Campaigns Listing */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 text-rose-700 max-w-lg mx-auto">
            <p className="font-semibold">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchCampaigns}>
              Try Again
            </Button>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 max-w-md mx-auto">
            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#17243A]">No Campaigns Found</h3>
            <p className="text-sm text-[#667085] mt-1">
              There are currently no campaigns matching your selected filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedStatus('All');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((c) => {
              const target = Number(c.target_amount) || 0;
              const collected = Number(c.amount_collected) || 0;
              const percentage = target > 0 ? Math.min(Math.round((collected / target) * 100), 100) : 0;

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
                >
                  {/* Category Banner */}
                  <div className="h-36 bg-gradient-to-tr from-[#05665D] to-[#087F73] p-5 flex flex-col justify-between text-white relative">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs border border-white/30">
                        {c.category}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          c.status === 'Active'
                            ? 'bg-[#2EAD62] text-white'
                            : 'bg-amber-400 text-gray-900'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-white/80 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" /> Goal: ₹{target.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#17243A] group-hover:text-[#087F73] transition-colors line-clamp-2">
                        {c.title}
                      </h3>
                      <p className="text-xs text-[#667085] mt-2 line-clamp-3">
                        {c.description}
                      </p>
                    </div>

                    {/* Progress Metric */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-semibold text-gray-700">
                          ₹{collected.toLocaleString('en-IN')} collected
                        </span>
                        <span className="font-bold text-[#087F73]">{percentage}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#087F73] to-[#2EAD62] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-gray-400 mt-2">
                        <span>Target: ₹{target.toLocaleString('en-IN')}</span>
                        <span>
                          {c.end_date
                            ? `Ends: ${new Date(c.end_date).toLocaleDateString('en-IN')}`
                            : 'Ongoing'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex items-center gap-2">
                      <Link to={`/campaigns/${c.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full justify-center">
                          Details
                        </Button>
                      </Link>
                      <Link to={`/donate?campaignId=${c.id}`} className="flex-1">
                        <Button variant="primary" size="sm" className="w-full justify-center" icon={Heart}>
                          Donate
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
