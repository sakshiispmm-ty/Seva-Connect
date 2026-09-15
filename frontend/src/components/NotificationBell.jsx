import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ExternalLink,
  Clock,
  MessageSquare
} from 'lucide-react';
import { notificationService } from '../services/api';

export default function NotificationBell({ className = '', align = 'auto' }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(align === 'left' ? 'left' : 'right');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Smart placement detection: if near left edge, open rightwards; if near right edge, open leftwards
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      if (align === 'left') {
        setPosition('left');
      } else if (align === 'right') {
        setPosition('right');
      } else {
        const rect = dropdownRef.current.getBoundingClientRect();
        if (rect.left < 360) {
          setPosition('left');
        } else {
          setPosition('right');
        }
      }
    }
  }, [isOpen, align]);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.data && res.data.success) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail if user not logged in
    }
  };

  // Fetch notification list
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAll({ limit: 20 });
      if (res.data && res.data.success) {
        const list = res.data.notifications || [];
        setNotifications(list);
        if (typeof res.data.unreadCount === 'number') {
          setUnreadCount(res.data.unreadCount);
        } else {
          setUnreadCount(list.filter(n => !n.is_read).length);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Polling interval (every 20 seconds)
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 20000);
    return () => clearInterval(interval);
  }, []);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id);
    }
    setIsOpen(false);

    // Contextual routing based on reference_type / notification type
    if (notif.reference_type === 'AssistanceRequest' || notif.type === 'RequestSubmitted') {
      navigate('/admin/assistance-requests');
    } else if (notif.reference_type === 'Inventory' || notif.type === 'LowInventory') {
      navigate('/admin/inventory');
    } else if (notif.reference_type === 'Donation' || notif.type === 'NewDonation') {
      navigate('/admin/donations');
    } else if (notif.type === 'TaskAssigned' || notif.type === 'TaskStatusUpdated') {
      navigate('/volunteer/dashboard');
    } else if (notif.type === 'DonationVerified' || notif.type === 'DonationRejected') {
      navigate('/donor/history');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LowInventory':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'NewDonation':
        return <Gift className="w-4 h-4 text-emerald-500" />;
      case 'DonationVerified':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'DonationRejected':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'TaskAssigned':
      case 'TaskStatusUpdated':
        return <ClipboardList className="w-4 h-4 text-blue-500" />;
      case 'RequestSubmitted':
      case 'RequestDecision':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'FeedbackReceived':
      case 'NewFeedback':
        return <MessageSquare className="w-4 h-4 text-[#087F73]" />;
      default:
        return <Bell className="w-4 h-4 text-[#087F73]" />;
    }
  };

  // Date Grouping (Today, Yesterday, Earlier)
  const groupedNotifications = useMemo(() => {
    const groups = { Today: [], Yesterday: [], Earlier: [] };
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    (notifications || []).forEach(notif => {
      const notifDate = new Date(notif.created_at).toDateString();
      if (notifDate === todayStr) {
        groups.Today.push(notif);
      } else if (notifDate === yesterdayStr) {
        groups.Yesterday.push(notif);
      } else {
        groups.Earlier.push(notif);
      }
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [notifications]);

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        id="notification-bell-btn"
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-[#0B4F6C] hover:bg-slate-100/80 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B4F6C]/20"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-400 animate-ping opacity-75" />
          </>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className={`absolute ${position === 'left' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'} mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}>
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200/60">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#0B4F6C] hover:text-[#093e54] transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading alerts...</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <Bell className="w-5 h-5 opacity-60" />
                </div>
                <p className="text-sm font-medium text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-400 mt-0.5">No notifications at the moment.</p>
              </div>
            ) : (
              groupedNotifications.map(([groupLabel, items]) => (
                <div key={groupLabel} className="divide-y divide-slate-100">
                  <div className="px-3.5 py-1.5 bg-slate-100/70 border-y border-slate-200/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {groupLabel}
                  </div>
                  {items.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors group ${
                        notif.is_read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/30 hover:bg-emerald-50/60'
                      }`}
                    >
                      <div className="mt-0.5 p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                        {getNotificationIcon(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className={`text-xs font-semibold truncate ${notif.is_read ? 'text-slate-700' : 'text-slate-900 font-bold'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTimestamp(notif.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      {!notif.is_read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          className="p-1 rounded-md text-slate-400 hover:text-[#087F73] hover:bg-white transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              Live operational alerts (V2.1)
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="text-[11px] font-bold text-[#0B4F6C] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
