import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Gift,
  ClipboardList,
  FileText,
  CheckCircle2,
  XCircle,
  Menu,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Sliders
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'unread', 'alerts'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationService.getAll({ limit: 100 });
      if (res.data && res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Unable to load notification feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id);
    }

    if (notif.reference_type === 'assistance_request' || notif.type?.includes('REQUEST')) {
      navigate('/admin/assistance-requests');
    } else if (notif.reference_type === 'inventory' || notif.type?.includes('STOCK')) {
      navigate('/admin/inventory');
    } else if (notif.reference_type === 'donation' || notif.type?.includes('DONATION')) {
      if (user?.role === 'Admin') {
        navigate('/admin/donations');
      } else {
        navigate('/donor/history');
      }
    } else if (notif.reference_type === 'task' || notif.type?.includes('TASK')) {
      navigate('/volunteer');
    }
  };

  const getNotificationIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('stock') || t.includes('inventory')) {
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    }
    if (t.includes('donation')) {
      return <Gift className="w-5 h-5 text-emerald-500" />;
    }
    if (t.includes('task')) {
      return <ClipboardList className="w-5 h-5 text-blue-500" />;
    }
    if (t.includes('request')) {
      return <FileText className="w-5 h-5 text-purple-500" />;
    }
    return <Bell className="w-5 h-5 text-[#087F73]" />;
  };

  const filteredNotifications = notifications.filter(n => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      (n.title && n.title.toLowerCase().includes(q)) || 
      (n.message && n.message.toLowerCase().includes(q)) ||
      (n.type && n.type.toLowerCase().includes(q));

    if (!matchesQuery) return false;

    if (filterType === 'unread') return !n.is_read;
    if (filterType === 'alerts') return n.type?.includes('STOCK') || n.type?.includes('URGENT');
    if (filterType === 'donations') return String(n.type || '').toLowerCase().includes('donation');
    if (filterType === 'tasks') {
      const t = String(n.type || '').toLowerCase();
      return t.includes('volunteer') || t.includes('task') || t.includes('badge') || t.includes('point');
    }
    if (filterType === 'system') {
      const t = String(n.type || '').toLowerCase();
      return !t.includes('donation') && !t.includes('volunteer') && !t.includes('task') && !t.includes('badge') && !t.includes('point');
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex">
      {user?.role && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          role={user.role}
        />
      )}

      <div className={`flex-1 flex flex-col min-w-0 ${user?.role ? 'lg:pl-72' : ''}`}>
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            {user?.role && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-[#667085] hover:bg-gray-100 lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-extrabold text-[#17243A]">Notification Center</h1>
              <p className="text-xs text-[#667085] hidden sm:block">
                Review operational alerts, request assignments, stock warnings, and donation verifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/notifications/settings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-slate-700 transition"
            >
              <Sliders className="w-3.5 h-3.5 text-[#087F73]" />
              <span>Preferences & Digest</span>
            </Link>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4 text-[#087F73]" />
                <span>Mark All Read</span>
              </Button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-8 space-y-6 max-w-5xl w-full mx-auto">
          {error && (
            <Alert
              type="error"
              title="Notice"
              message={error}
              onClose={() => setError('')}
            />
          )}

          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                  filterType === 'all'
                    ? 'bg-white text-[#17243A] shadow-xs'
                    : 'text-[#667085] hover:text-[#17243A]'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('donations')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                  filterType === 'donations'
                    ? 'bg-white text-[#087F73] shadow-xs'
                    : 'text-[#667085] hover:text-[#17243A]'
                }`}
              >
                Donations
              </button>
              <button
                type="button"
                onClick={() => setFilterType('tasks')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                  filterType === 'tasks'
                    ? 'bg-white text-[#087F73] shadow-xs'
                    : 'text-[#667085] hover:text-[#17243A]'
                }`}
              >
                Tasks & Badges
              </button>
              <button
                type="button"
                onClick={() => setFilterType('system')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                  filterType === 'system'
                    ? 'bg-white text-[#087F73] shadow-xs'
                    : 'text-[#667085] hover:text-[#17243A]'
                }`}
              >
                System
              </button>
              <button
                type="button"
                onClick={() => setFilterType('alerts')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                  filterType === 'alerts'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-[#667085] hover:text-[#17243A]'
                }`}
              >
                Stock Alerts
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#087F73]/20 focus:border-[#087F73]"
              />
            </div>
          </div>

          {/* Notifications Feed */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden divide-y divide-gray-100">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-[#087F73] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-[#667085]">Loading notification feed...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#17243A]">No Notifications</h3>
                <p className="text-xs text-[#667085] mt-1">
                  You are all caught up with your operational alerts!
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 sm:p-5 flex items-start gap-4 cursor-pointer transition-colors ${
                    notif.is_read ? 'bg-white hover:bg-gray-50/70' : 'bg-blue-50/30 hover:bg-blue-50/60'
                  }`}
                >
                  <div className="p-3 rounded-2xl bg-white border border-gray-200 shadow-2xs shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${notif.is_read ? 'text-[#17243A]' : 'text-blue-950 font-extrabold'}`}>
                          {notif.title}
                        </h4>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <span className="text-[11px] text-[#667085] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-[#475467] leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="mt-2.5 flex items-center gap-3">
                      <span className="text-[11px] text-[#087F73] font-bold flex items-center gap-1 hover:underline">
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>

                      {!notif.is_read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          className="text-[11px] text-gray-500 hover:text-gray-900 font-semibold"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
