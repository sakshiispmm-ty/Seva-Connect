import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  HeartHandshake,
  Gift,
  History,
  Megaphone,
  Users,
  Package,
  FileText,
  LogOut,
  X,
  UserCheck,
  Bell,
  BarChart3,
  MessageSquare,
  Trophy,
  Shield
} from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Sidebar({ isOpen, onClose, role }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const donorLinks = [
    { label: 'Overview', path: '/donor', icon: LayoutDashboard },
    { label: 'Active Campaigns', path: '/campaigns', icon: Megaphone },
    { label: 'Pledge Donation', path: '/donate', icon: HeartHandshake },
    { label: 'My Donations', path: '/donor/history', icon: Gift },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  const volunteerLinks = [
    { label: 'Assigned Tasks', path: '/volunteer', icon: LayoutDashboard },
    { label: 'Task History', path: '/volunteer/history', icon: History },
    { label: 'Volunteer Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Volunteer Profile', path: '/volunteer/profile', icon: User },
    { label: 'Active Campaigns', path: '/campaigns', icon: Megaphone },
    { label: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const adminLinks = [
    { label: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Analytics & Reports', path: '/admin/analytics', icon: BarChart3 },
    { label: 'User Directory', path: '/admin/users', icon: Shield },
    { label: 'Audit Log', path: '/admin/audit-log', icon: History },
    { label: 'Campaigns', path: '/admin/campaigns', icon: Megaphone },
    { label: 'Donation Desk', path: '/admin/donations', icon: Gift },
    { label: 'Donors', path: '/admin/donors', icon: HeartHandshake },
    { label: 'Assistance Requests', path: '/admin/assistance-requests', icon: FileText },
    { label: 'Beneficiaries', path: '/admin/beneficiaries', icon: Users },
    { label: 'Inventory', path: '/admin/inventory', icon: Package },
    { label: 'Volunteers', path: '/admin/volunteers', icon: UserCheck },
    { label: 'Volunteer Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Feedback & Reviews', path: '/admin/feedback', icon: MessageSquare },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  const links = role === 'Admin' ? adminLinks : (role === 'Volunteer' ? volunteerLinks : donorLinks);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header with Official Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
          <Link to="/" className="flex items-center">
            <img
              src="/assets/logo.png"
              alt="SevaConnect Logo"
              className="h-10 w-auto max-h-10 object-contain"
            />
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell align="left" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#667085] hover:bg-gray-100 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 rounded-xl bg-[#EAF6F3] border border-[#087F73]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#087F73] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#17243A] truncate">{user?.name}</p>
              <p className="text-xs text-[#667085] truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[#087F73]/10">
            <span className="text-[11px] text-[#087F73] font-semibold">Portal Role</span>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                user?.role === 'Admin' && role === 'Volunteer'
                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                  : role === 'Admin'
                  ? 'bg-[#F7BA3E]/20 text-[#17243A] border border-[#F7BA3E]'
                  : role === 'Volunteer'
                  ? 'bg-[#087F73]/15 text-[#087F73] border border-[#087F73]/40'
                  : 'bg-[#2EAD62]/20 text-[#05665D] border border-[#2EAD62]'
              }`}
            >
              {user?.role === 'Admin' && role === 'Volunteer' ? 'Admin (Volunteer View)' : role}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          <div className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#667085]">
            Main Menu
          </div>
          {links.map((item, idx) => {
            const Icon = item.icon;
            const isCurrent = location.pathname === item.path;

            if (item.isPlaceholder) {
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-50 cursor-not-allowed group transition-colors"
                  title="Coming in future versions"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-gray-500" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                    Future V2
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={idx}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  isCurrent
                    ? 'bg-[#087F73] text-white shadow-sm'
                    : 'text-[#17243A] hover:bg-[#EAF6F3] hover:text-[#087F73]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-[#667085]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer Area with Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
