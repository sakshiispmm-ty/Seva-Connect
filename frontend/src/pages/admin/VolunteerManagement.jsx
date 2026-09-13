import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import SearchFilterBar from '../../components/SearchFilterBar';
import NotificationBell from '../../components/NotificationBell';
import { volunteerService } from '../../services/api';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  Menu, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Wrench,
  ShieldCheck
} from 'lucide-react';

export default function VolunteerManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All');

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const response = await volunteerService.getAll({
        search: searchQuery,
        status: statusFilter,
        skill: skillFilter
      });
      if (response.data && response.data.success) {
        setVolunteers(response.data.volunteers || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch volunteers roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [statusFilter, skillFilter]);

  const filteredVolunteers = volunteers.filter(v => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (v.name || '').toLowerCase().includes(q) ||
      (v.email || '').toLowerCase().includes(q) ||
      (v.phone || '').toLowerCase().includes(q) ||
      (v.skills || '').toLowerCase().includes(q) ||
      (v.availability || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchesSkill = skillFilter === 'All' || (v.skills || '').toLowerCase().includes(skillFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesSkill;
  });

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
              <h1 className="text-xl font-extrabold text-[#17243A]">Volunteer Force Roster</h1>
              <p className="text-xs text-[#667085] hidden sm:block">
                View registered volunteers, their skillsets, field availability, and active task loads.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell align="right" />
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {error && (
            <Alert
              type="error"
              title="Notice"
              message={error}
              onClose={() => setError('')}
            />
          )}

          {/* Search & Filters Bar (V2.1) */}
          <SearchFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search volunteers by name, email, phone, or skill..."
            filters={[
              {
                id: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'All', label: 'All Statuses' },
                  { value: 'Active', label: 'Active Roster' },
                  { value: 'Inactive', label: 'Inactive / On-Leave' }
                ]
              },
              {
                id: 'skill',
                label: 'Skill & Domain',
                value: skillFilter,
                onChange: setSkillFilter,
                options: [
                  { value: 'All', label: 'All Skills' },
                  { value: 'Logistics', label: 'Logistics & Driving' },
                  { value: 'Outreach', label: 'Community Outreach' },
                  { value: 'Medical', label: 'Medical & First Aid' },
                  { value: 'Education', label: 'Teaching & Mentoring' }
                ]
              }
            ]}
            onClearAll={() => {
              setSearchQuery('');
              setStatusFilter('All');
              setSkillFilter('All');
            }}
          />

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-[#087F73] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-[#667085]">Loading volunteer force...</p>
              </div>
            ) : filteredVolunteers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#17243A]">No Volunteers Found</h3>
                <p className="text-xs text-[#667085] mt-1">
                  Volunteers can register directly through the registration portal with role "Volunteer".
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] uppercase tracking-wider text-[#667085]">
                      <th className="py-3.5 px-4 font-bold">Volunteer</th>
                      <th className="py-3.5 px-4 font-bold">Contact</th>
                      <th className="py-3.5 px-4 font-bold">Skills & Interests</th>
                      <th className="py-3.5 px-4 font-bold">Availability</th>
                      <th className="py-3.5 px-4 font-bold text-center">Tasks (Pending / Done)</th>
                      <th className="py-3.5 px-4 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredVolunteers.map((vol) => (
                      <tr key={vol.user_id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4 font-bold text-[#17243A]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#087F73] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {vol.name?.charAt(0)?.toUpperCase() || 'V'}
                            </div>
                            <div>
                              <div>{vol.name}</div>
                              <span className="text-[11px] font-normal text-[#667085]">
                                Joined {vol.joined_at ? new Date(vol.joined_at).toLocaleDateString() : ''}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs text-[#667085]">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{vol.phone}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{vol.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs text-[#17243A] max-w-xs">
                          <span className="font-medium bg-gray-100 px-2.5 py-1 rounded-md text-[11px] text-gray-800">
                            {vol.skills || 'General Assistance & Outreach'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-[#667085]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{vol.availability || 'Weekends / On-Call'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#EAF6F3] text-[#087F73]">
                              {vol.assigned_tasks_count || 0} Total
                            </span>
                            <span className="text-[10px] text-[#667085] mt-1 font-semibold flex items-center gap-1">
                              <span className="text-amber-600 font-bold">{vol.pending_tasks_count || 0} pending</span>
                              <span>&bull;</span>
                              <span className="text-emerald-600 font-bold">{vol.completed_tasks_count || 0} done</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                              vol.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                vol.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'
                              }`}
                            />
                            {vol.status || 'Active'}
                          </span>
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
