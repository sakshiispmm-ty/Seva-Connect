import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import RequestStatusBadge from '../../components/RequestStatusBadge';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import NotificationBell from '../../components/NotificationBell';
import SearchFilterBar from '../../components/SearchFilterBar';
import FeedbackForm from '../../components/FeedbackForm';
import { volunteerService, feedbackService } from '../../services/api';
import {
  Menu,
  Sparkles,
  History,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Package,
  Star,
  ArrowLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function VolunteerHistoryPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyTasks, setHistoryTasks] = useState([]);
  const [myFeedbackList, setMyFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [activeTaskForFeedback, setActiveTaskForFeedback] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [historyRes, feedbackRes] = await Promise.all([
        volunteerService.getHistory(),
        feedbackService.getMyFeedback({ target_type: 'VolunteerTask' }).catch(() => ({ data: { data: [] } }))
      ]);

      setHistoryTasks(historyRes.data?.tasks || historyRes.data?.data || []);
      setMyFeedbackList(feedbackRes.data?.data || []);
    } catch (err) {
      console.error('Error loading volunteer history:', err);
      setError('Failed to load activity history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map feedback by task id
  const feedbackByTaskId = useMemo(() => {
    const map = {};
    myFeedbackList.forEach((fb) => {
      map[fb.target_id] = fb;
    });
    return map;
  }, [myFeedbackList]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return historyTasks.filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (task.title || '').toLowerCase().includes(q);
        const descMatch = (task.description || '').toLowerCase().includes(q);
        const benMatch = (task.beneficiary_name || '').toLowerCase().includes(q);
        const itemMatch = (task.item_needed || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !benMatch && !itemMatch) return false;
      }

      // Status
      if (statusFilter !== 'All' && task.status !== statusFilter) {
        return false;
      }

      // Priority
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [historyTasks, searchQuery, statusFilter, priorityFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = historyTasks.length;
    const completed = historyTasks.filter((t) => t.status === 'Completed').length;
    const inProgress = historyTasks.filter((t) => t.status === 'In Progress' || t.status === 'Assigned').length;
    const reviewed = Object.keys(feedbackByTaskId).length;
    return { total, completed, inProgress, reviewed };
  }, [historyTasks, feedbackByTaskId]);

  const handleOpenFeedback = (task) => {
    setActiveTaskForFeedback(task);
    setFeedbackModalOpen(true);
  };

  const handleFeedbackSuccess = (savedFeedback) => {
    setSuccessMessage('Thank you! Your task feedback has been saved.');
    // Refresh feedback list
    feedbackService.getMyFeedback({ target_type: 'VolunteerTask' })
      .then((res) => setMyFeedbackList(res.data?.data || []))
      .catch(() => {});
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="Volunteer" />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Navigation */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-[#667085] hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  to="/volunteer/dashboard"
                  className="text-xs font-semibold text-[#087F73] hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Volunteer Dashboard
                </Link>
              </div>
              <h1 className="text-xl font-extrabold text-[#17243A]">Volunteer Task History</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell align="right" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF6F3] text-[#087F73] border border-[#087F73]/20">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Volunteer
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {error && (
            <Alert
              type="error"
              title="Notice"
              message={error}
              onClose={() => setError('')}
            />
          )}

          {successMessage && (
            <Alert
              type="success"
              title="Success"
              message={successMessage}
              onClose={() => setSuccessMessage('')}
            />
          )}

          {/* Activity Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#667085] font-semibold">Total Handled</p>
                <p className="text-xl font-extrabold text-[#17243A]">{metrics.total}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#087F73] flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#667085] font-semibold">Completed</p>
                <p className="text-xl font-extrabold text-emerald-600">{metrics.completed}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#667085] font-semibold">Active Tasks</p>
                <p className="text-xl font-extrabold text-amber-600">{metrics.inProgress}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#667085] font-semibold">Feedback Given</p>
                <p className="text-xl font-extrabold text-purple-600">{metrics.reviewed}</p>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <SearchFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search task history by title, beneficiary, or needed items..."
            filters={[
              {
                id: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'All', label: 'All Statuses' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Assigned', label: 'Assigned' }
                ]
              },
              {
                id: 'priority',
                label: 'Priority',
                value: priorityFilter,
                onChange: setPriorityFilter,
                options: [
                  { value: 'All', label: 'All Priorities' },
                  { value: 'Urgent', label: 'Urgent' },
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' }
                ]
              }
            ]}
            onReset={handleResetFilters}
            activeFiltersCount={
              (statusFilter !== 'All' ? 1 : 0) +
              (priorityFilter !== 'All' ? 1 : 0) +
              (searchQuery ? 1 : 0)
            }
          />

          {/* History Task Cards */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  <div className="h-10 bg-gray-50 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <div className="w-14 h-14 mx-auto mb-4 bg-[#EAF6F3] text-[#087F73] rounded-2xl flex items-center justify-center">
                <History className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#17243A] mb-1">No activity records found</h3>
              <p className="text-sm text-[#667085] max-w-sm mx-auto">
                Tasks you complete or are assigned to will appear in this history log with full details.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const existingFeedback = feedbackByTaskId[task.id];
                const isCompleted = task.status === 'Completed';

                const formattedCreated = task.created_at
                  ? new Date(task.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  : null;

                const formattedCompleted = task.completed_at || task.delivered_at
                  ? new Date(task.completed_at || task.delivered_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  : null;

                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow transition-shadow space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1">
                          <span className="text-xs font-mono font-semibold text-gray-400">
                            TASK #{task.id}
                          </span>
                          <RequestStatusBadge status={task.status} />
                          {task.priority && (
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                task.priority === 'Urgent' || task.priority === 'High'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {task.priority}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-[#17243A]">
                          {task.title || `Assistance Request #${task.request_id || task.id}`}
                        </h3>
                        {task.description && (
                          <p className="text-xs text-[#667085] mt-1 max-w-2xl leading-relaxed">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Feedback Action for Completed tasks */}
                      {isCompleted && (
                        <div>
                          {existingFeedback ? (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-xs font-bold text-amber-800">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>Rated {existingFeedback.rating}/5</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenFeedback(task)}
                                className="text-xs"
                              >
                                Edit Feedback
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleOpenFeedback(task)}
                              className="bg-[#087F73] hover:bg-[#05665D] text-white text-xs flex items-center gap-1.5"
                            >
                              <Star className="w-3.5 h-3.5" />
                              Leave Feedback
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-xs text-[#667085]">
                      {task.beneficiary_name && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>Beneficiary: <strong className="text-gray-800">{task.beneficiary_name}</strong></span>
                        </div>
                      )}
                      {task.item_needed && (
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>Supply: <strong className="text-gray-800">{task.item_needed}</strong></span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>
                          {formattedCompleted
                            ? `Delivered on ${formattedCompleted}`
                            : formattedCreated
                            ? `Initiated on ${formattedCreated}`
                            : 'Logged in system'}
                        </span>
                      </div>
                    </div>

                    {/* Existing feedback comment excerpt if present */}
                    {existingFeedback?.comment && (
                      <div className="bg-[#EAF6F3]/50 border border-[#087F73]/20 rounded-xl p-3 text-xs text-gray-700 italic">
                        <span className="font-semibold not-italic text-[#087F73] mr-1.5">Your Feedback:</span>
                        "{existingFeedback.comment}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Feedback Form Modal */}
      {feedbackModalOpen && activeTaskForFeedback && (
        <FeedbackForm
          isOpen={feedbackModalOpen}
          targetType="VolunteerTask"
          targetId={activeTaskForFeedback.id}
          targetTitle={activeTaskForFeedback.title || `Task #${activeTaskForFeedback.id}`}
          initialFeedback={feedbackByTaskId[activeTaskForFeedback.id]}
          onClose={() => {
            setFeedbackModalOpen(false);
            setActiveTaskForFeedback(null);
          }}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </div>
  );
}
