import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../services/api';
import Sidebar from '../components/Sidebar';
import DonationStatusBadge from '../components/DonationStatusBadge';
import ReceiptView from '../components/ReceiptView';
import Button from '../components/Button';
import {
  Menu,
  Gift,
  FileText,
  Search,
  Plus
} from 'lucide-react';

export default function DonationHistoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchToken, setSearchToken] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchMyDonations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await donationService.getMyHistory();
      if (res.data?.success) {
        setDonations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Unable to load your donation history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const handleOpenReceipt = async (token) => {
    try {
      const res = await donationService.getReceipt(token);
      if (res.data?.success) {
        setSelectedReceipt(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch receipt:', err);
      alert('Unable to load receipt details.');
    }
  };

  const filtered = donations.filter((d) => {
    if (searchToken && !d.token.toLowerCase().includes(searchToken.toLowerCase())) {
      return false;
    }
    if (filterStatus !== 'All' && d.status !== filterStatus) {
      return false;
    }
    if (filterType !== 'All' && d.donation_type !== filterType) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAFCFB] flex">
      {/* Donor Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="Donor" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Bar */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#17243A]">My Donations & Receipts</h1>
              <p className="text-xs text-[#667085]">
                Track all registered contributions and download official tax receipts
              </p>
            </div>
          </div>

          <Link to="/donate">
            <Button variant="primary" size="sm" icon={Plus}>
              New Donation
            </Button>
          </Link>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by token (e.g. SC-DON-000001)..."
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#087F73]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#087F73]"
              >
                <option value="All">All Statuses</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Verified">Verified</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#087F73]"
              >
                <option value="All">All Types</option>
                <option value="Money">Money</option>
                <option value="Items">Items</option>
              </select>
            </div>
          </div>

          {/* Donations Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-sm text-[#667085] animate-pulse">
                Loading your donation records...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-sm text-rose-600 font-medium">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#17243A]">No Donations Found</h3>
                <p className="text-xs text-[#667085] mt-1 mb-5">
                  You haven't registered any contributions matching this criteria.
                </p>
                <Link to="/donate">
                  <Button variant="primary" size="sm">
                    Make a Donation
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-[#667085] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Token</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Campaign / Initiative</th>
                      <th className="py-3 px-4">Contribution</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Official Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filtered.map((d) => {
                      const canViewReceipt = d.status === 'Verified' || d.status === 'Completed';

                      return (
                        <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#087F73]">
                            {d.token}
                          </td>
                          <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                            {new Date(d.created_at).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-[#17243A] line-clamp-1">
                              {d.campaign_title || 'General Community Relief Fund'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {d.donation_type === 'Money' ? (
                              <span className="font-bold font-mono text-[#17243A]">
                                ₹{Number(d.amount).toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <div>
                                <span className="font-semibold text-[#17243A]">
                                  {d.quantity} {d.unit || 'units'}
                                </span>
                                <span className="block text-[11px] text-gray-400">
                                  {d.item_category}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <DonationStatusBadge status={d.status} size="sm" />
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            {canViewReceipt ? (
                              <button
                                onClick={() => handleOpenReceipt(d.token)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg text-[#087F73] bg-[#EAF6F3] hover:bg-[#087F73] hover:text-white transition-all"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </button>
                            ) : d.status === 'Pending Verification' ? (
                              <span className="text-[11px] text-amber-600 font-medium italic">
                                Verification Pending
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">
                                Unavailable
                              </span>
                            )}
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

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <ReceiptView
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
