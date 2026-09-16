import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import SearchFilterBar from '../../components/SearchFilterBar';
import NotificationBell from '../../components/NotificationBell';
import Alert from '../../components/Alert';
import { donorService } from '../../services/api';
import { 
  Users, 
  HeartHandshake, 
  Gift, 
  IndianRupee, 
  Mail, 
  Phone, 
  Calendar, 
  Menu,
  ExternalLink,
  ArrowUpDown
} from 'lucide-react';

export default function DonorManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'amount', 'donations'

  const fetchDonors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await donorService.getAll({ search });
      if (res.data && res.data.success) {
        setDonors(res.data.donors || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch donor registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDonors();
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  // Client-side sort
  const sortedDonors = [...donors].sort((a, b) => {
    const aAmt = parseFloat(a.total_amount_donated ?? a.total_donated ?? 0);
    const bAmt = parseFloat(b.total_amount_donated ?? b.total_donated ?? 0);
    if (sortBy === 'amount') return bAmt - aAmt;
    const aCount = parseInt(a.total_donations_count ?? a.donations_count ?? 0, 10);
    const bCount = parseInt(b.total_donations_count ?? b.donations_count ?? 0, 10);
    if (sortBy === 'donations') return bCount - aCount;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const totalRaisedFromDonors = donors.reduce((sum, d) => sum + (parseFloat(d.total_amount_donated ?? d.total_donated) || 0), 0);
  const totalCompletedPledges = donors.reduce((sum, d) => sum + (parseInt(d.total_donations_count ?? d.donations_count, 10) || 0), 0);

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="Admin" />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-[#667085] hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#17243A]">Donor Registry</h1>
              <p className="text-xs text-[#667085]">
                Track donor engagement, total contributions, and verified history
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell align="right" />
            <Link
              to="/admin/donations"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0B4F6C] text-white hover:bg-[#093e54] transition-colors shadow-xs"
            >
              <Gift className="w-4 h-4" />
              <span>Donation Desk</span>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {error && (
            <Alert type="error" title="Error" message={error} onClose={() => setError('')} className="mb-6" />
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Donors</p>
                  <p className="text-2xl font-bold text-[#17243A] mt-1">{donors.length}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Contributions</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalRaisedFromDonors.toLocaleString('en-IN')}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Donations</p>
                  <p className="text-2xl font-bold text-[#0B4F6C] mt-1">{totalCompletedPledges} Records</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#0B4F6C]/10 text-[#0B4F6C] flex items-center justify-center">
                  <HeartHandshake className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search donors by name or email..."
            filters={[
              {
                id: 'sort',
                label: 'Sort By',
                value: sortBy,
                onChange: setSortBy,
                options: [
                  { value: 'recent', label: 'Recently Registered' },
                  { value: 'amount', label: 'Highest Contributions (₹)' },
                  { value: 'donations', label: 'Most Donations' }
                ]
              }
            ]}
            onClearAll={() => {
              setSearch('');
              setSortBy('recent');
            }}
          />

          {/* Donors Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-sm text-slate-400">Loading donor directory...</div>
            ) : sortedDonors.length === 0 ? (
              <div className="py-16 px-4 text-center">
                <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-semibold text-slate-700">No Donors Found</h3>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your search query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Donor Profile</th>
                      <th className="py-3.5 px-6">Contact Details</th>
                      <th className="py-3.5 px-6 text-center">Donations Made</th>
                      <th className="py-3.5 px-6 text-right">Total Donated</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedDonors.map((donor) => (
                      <tr key={donor.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#0B4F6C]/10 text-[#0B4F6C] font-bold flex items-center justify-center text-sm shrink-0">
                              {donor.name?.charAt(0)?.toUpperCase() || 'D'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{donor.name}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                Registered {new Date(donor.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <p className="text-xs text-slate-700 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {donor.email}
                          </p>
                          {donor.phone ? (
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {donor.phone}
                            </p>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No phone provided</span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                            {donor.total_donations_count ?? donor.donations_count ?? 0} donations
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <span className="font-bold text-emerald-700 text-sm">
                            ₹{(parseFloat(donor.total_amount_donated ?? donor.total_donated) || 0).toLocaleString('en-IN')}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <Link
                            to={`/admin/donations?search=${encodeURIComponent(donor.name)}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#0B4F6C] hover:text-[#093e54] hover:underline"
                            title="View donation records"
                          >
                            <span>View History</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
