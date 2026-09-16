import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import RequestStatusBadge from '../../components/RequestStatusBadge';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import NotificationBell from '../../components/NotificationBell';
import FeedbackForm from '../../components/FeedbackForm';
import { volunteerService, feedbackService, recommendationService } from '../../services/api';
import { 
  LayoutDashboard, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Package, 
  Menu, 
  CheckCheck, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  History,
  Star,
  Award,
  ArrowRight
} from 'lucide-react';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  const [volunteerSkills, setVolunteerSkills] = useState('');
  const [contributionSummary, setContributionSummary] = useState(null);
  const [myFeedbackList, setMyFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Assigned', 'In Progress', 'Completed'
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline', 'priority', 'recent'
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Confirmation Modal state
  const [selectedTaskToDeliver, setSelectedTaskToDeliver] = useState(null);
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);

  // Feedback Modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedTaskForFeedback, setSelectedTaskForFeedback] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, summaryRes, feedbackRes, suggestionsRes] = await Promise.all([
        volunteerService.getTasks(),
        volunteerService.getContributionSummary().catch(() => ({ data: { data: null } })),
        feedbackService.getMyFeedback({ target_type: 'VolunteerTask' }).catch(() => ({ data: { data: [] } })),
        recommendationService.getSuggestedTasks().catch(() => ({ data: { tasks: [] } }))
      ]);

      if (tasksRes.data && tasksRes.data.success) {
        setTasks(tasksRes.data.tasks || []);
      } else {
        setError(tasksRes.data?.message || 'Failed to load assigned tasks.');
      }

      setContributionSummary(summaryRes.data?.data || null);
      setMyFeedbackList(feedbackRes.data?.data || []);

      if (suggestionsRes.data && suggestionsRes.data.success) {
        setSuggestedTasks(suggestionsRes.data.tasks || []);
        setVolunteerSkills(suggestionsRes.data.volunteer_skills || '');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error loading volunteer tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const feedbackByTaskId = useMemo(() => {
    const map = {};
    (myFeedbackList || []).forEach((fb) => {
      map[fb.target_id] = fb;
    });
    return map;
  }, [myFeedbackList]);

  const handleStartTask = async (task) => {
    setUpdatingTaskId(task.id);
    setError('');
    setSuccessMessage('');
    try {
      const res = await volunteerService.updateTaskStatus(task.id, { status: 'In Progress' });
      if (res.data && res.data.success) {
        setSuccessMessage(`Task #REQ-00${task.id} is now in progress.`);
        fetchTasks();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleConfirmDeliver = async () => {
    if (!selectedTaskToDeliver) return;
    setConfirmingDelivery(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await volunteerService.deliverTask(selectedTaskToDeliver.id);
      if (response.data && response.data.success) {
        setSuccessMessage(`Delivery for Request #REQ-00${selectedTaskToDeliver.id} successfully recorded!`);
        setSelectedTaskToDeliver(null);
        fetchTasks();
      } else {
        setError(response.data?.message || 'Could not complete task delivery.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error confirming delivery.');
    } finally {
      setConfirmingDelivery(false);
    }
  };

  // Compute stats
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const assignedTasks = tasks.filter(t => t.status === 'Volunteer Assigned' || t.status === 'Assigned').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'Assigned') return task.status === 'Volunteer Assigned' || task.status === 'Assigned';
    if (activeFilter === 'In Progress') return task.status === 'In Progress';
    if (activeFilter === 'Completed') return task.status === 'Completed';
    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    }
    if (sortBy === 'priority') {
      const pMap = { High: 3, Medium: 2, Low: 1 };
      return (pMap[b.priority || 'Medium'] || 2) - (pMap[a.priority || 'Medium'] || 2);
    }
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

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
              <h1 className="text-xl font-extrabold text-[#17243A]">Volunteer Operations Portal</h1>
              <p className="text-xs text-[#667085] hidden sm:block">
                Welcome back, {user?.name || 'Volunteer'}. Here are your assigned field deliveries.
              </p>
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

          {/* Contribution Summary Block (V2.3) */}
          <div className="bg-gradient-to-r from-[#087F73] to-[#05665D] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/15 text-white backdrop-blur-xs">
                <Award className="w-3.5 h-3.5" />
                Volunteer Contribution Impact
              </div>
              <h2 className="text-lg font-black">Your Dedicated Service Overview</h2>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Every completed delivery and verified relief mission strengthens community resilience across our network.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 md:gap-8">
              <div className="text-center md:text-left">
                <p className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">Tasks Completed</p>
                <p className="text-2xl font-black">{contributionSummary?.total_completed_tasks ?? completedTasks}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">Service Hours</p>
                <p className="text-2xl font-black">{contributionSummary?.estimated_hours_served ?? (completedTasks * 3)} hrs</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">Beneficiaries</p>
                <p className="text-2xl font-black">{contributionSummary?.distinct_beneficiaries_served ?? completedTasks}</p>
              </div>
              <Link
                to="/volunteer/history"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#087F73] hover:bg-emerald-50 text-xs font-bold transition-all shadow-sm shrink-0"
              >
                <History className="w-4 h-4" />
                View Full History
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Activity Metrics Summary (V2.1) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EAF6F3] text-[#087F73] flex items-center justify-center font-bold shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">Assigned</p>
                <p className="text-xl font-extrabold text-[#17243A]">{totalTasks}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">Awaiting Start</p>
                <p className="text-xl font-extrabold text-amber-700">{assignedTasks}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">In Progress</p>
                <p className="text-xl font-extrabold text-blue-700">{inProgressTasks}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <CheckCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">Delivered</p>
                <p className="text-xl font-extrabold text-emerald-700">{completedTasks}</p>
              </div>
            </div>
          </div>

          {/* Version 3.1: Suggested Volunteer Tasks */}
          {suggestedTasks && suggestedTasks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#087F73] bg-[#EAF6F3] px-2.5 py-0.5 rounded-full border border-[#087F73]/20 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#F7BA3E]" /> Smart Suggestions
                    </span>
                    {volunteerSkills && (
                      <span className="text-[11px] text-[#667085] bg-gray-100 px-2 py-0.5 rounded-full hidden sm:inline-block">
                        Profile Skills: <strong className="text-[#17243A]">{volunteerSkills}</strong>
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[#17243A] mt-1">Suggested Tasks for You</h3>
                  <p className="text-xs text-[#667085]">Open community assistance requests matching your registered volunteer skills and availability</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-5 bg-white rounded-2xl border border-teal-100/80 shadow-xs hover:border-[#087F73]/40 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-white bg-[#087F73] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#F7BA3E]" />
                          {task.match_reason || 'Matched Task'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            (task.urgency || task.priority) === 'High'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {(task.urgency || task.priority || 'Medium')} Priority
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-[#17243A]">Request #REQ-00{task.id}</span>
                          <span className="text-xs font-semibold text-[#087F73] bg-[#EAF6F3] px-2 py-0.2 rounded-md">
                            {task.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#667085] mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px] text-[#667085]">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{task.delivery_address || 'Local Community Dropoff'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>Needs: <strong className="text-[#17243A]">{task.quantity_needed || '1 Unit'}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        Status: {task.status}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        Admin assignable
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Task Feed */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
            {/* Header, Filter Tabs & Sort */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#17243A]">Assigned Relief Tasks & Deliveries</h2>
                <p className="text-xs text-[#667085] mt-0.5">
                  Track field status, update progress, and record doorstep delivery confirmations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Filter Tabs */}
                <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                  {['All', 'Assigned', 'In Progress', 'Completed'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeFilter === tab
                          ? 'bg-white text-[#17243A] shadow-xs'
                          : 'text-[#667085] hover:text-[#17243A]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Sort selector */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#087F73]/20"
                >
                  <option value="deadline">Sort: Soonest Deadline</option>
                  <option value="priority">Sort: Highest Priority</option>
                  <option value="recent">Sort: Recently Assigned</option>
                </select>
              </div>
            </div>

            {/* Task List / Table */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-[#087F73] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-[#667085]">Loading assigned tasks...</p>
              </div>
            ) : sortedTasks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#17243A]">No Tasks Found</h3>
                <p className="text-xs text-[#667085] mt-1">
                  {activeFilter === 'Completed'
                    ? 'You have not marked any deliveries as completed yet.'
                    : 'There are currently no tasks matching this filter.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {sortedTasks.map((task) => {
                  const isCompleted = task.status === 'Completed';
                  const isInProgress = task.status === 'In Progress';

                  return (
                    <div
                      key={task.id}
                      className="p-5 sm:p-6 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-extrabold text-[#087F73]">
                            #REQ-00{task.id}
                          </span>
                          <RequestStatusBadge status={task.status} size="sm" />

                          {/* Priority Badge */}
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              task.priority === 'High'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : task.priority === 'Low'
                                ? 'bg-slate-100 text-slate-600 border-slate-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {task.priority || 'Medium'} Priority
                          </span>

                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              task.urgency === 'High'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {task.urgency} Urgency
                          </span>

                          {task.deadline && (
                            <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Deadline: {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}

                          <span className="text-[11px] font-semibold text-[#667085]">
                            {task.category}
                          </span>
                        </div>

                        {/* Beneficiary Details */}
                        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-bold text-[#17243A]">
                              Beneficiary: {task.beneficiary_name}
                            </p>
                            {task.beneficiary_phone && (
                              <a
                                href={`tel:${task.beneficiary_phone}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#087F73] hover:underline"
                              >
                                <Phone className="w-3 h-3" />
                                {task.beneficiary_phone}
                              </a>
                            )}
                          </div>
                          <div className="flex items-start gap-1.5 text-xs text-[#667085]">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <span>{task.beneficiary_address || 'Address on file with NGO'}</span>
                          </div>
                        </div>

                        {/* Description & Allocated Resources */}
                        <div>
                          <p className="text-xs font-semibold text-[#17243A]">
                            Need: <span className="font-normal text-[#667085]">{task.description}</span>
                          </p>
                          {task.allocations && task.allocations.length > 0 && (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold text-[#087F73] uppercase tracking-wider">
                                Allocated Supplies:
                              </span>
                              {task.allocations.map((alloc) => (
                                <span
                                  key={alloc.id}
                                  className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md bg-[#EAF6F3] text-[#087F73] border border-[#087F73]/20 font-medium"
                                >
                                  <Package className="w-3 h-3" />
                                  {alloc.quantity} {alloc.item_unit || 'units'} &mdash; {alloc.item_name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons (V2.1 status progression) */}
                      <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {isCompleted ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                              <CheckCircle2 className="w-4 h-4" />
                              Delivered Successfully
                            </span>
                            {feedbackByTaskId[task.id] ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTaskForFeedback(task);
                                  setFeedbackModalOpen(true);
                                }}
                                className="text-xs flex items-center gap-1"
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                Edit Feedback ({feedbackByTaskId[task.id].rating}★)
                              </Button>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedTaskForFeedback(task);
                                  setFeedbackModalOpen(true);
                                }}
                                className="text-xs flex items-center gap-1 bg-[#087F73] hover:bg-[#05665D]"
                              >
                                <Star className="w-3.5 h-3.5" />
                                Leave Feedback
                              </Button>
                            )}
                          </div>
                        ) : (
                          <>
                            {!isInProgress && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartTask(task)}
                                loading={updatingTaskId === task.id}
                              >
                                Start Task
                              </Button>
                            )}
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setSelectedTaskToDeliver(task)}
                            >
                              {isInProgress ? 'Complete Delivery' : 'Mark Delivered'}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Modal for Delivery */}
      {selectedTaskToDeliver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17243A]">Confirm Doorstep Delivery</h3>
                <p className="text-xs text-[#667085]">Assistance Request #REQ-00{selectedTaskToDeliver.id}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2 text-[#17243A]">
              <p>
                <strong>Beneficiary:</strong> {selectedTaskToDeliver.beneficiary_name}
              </p>
              <p>
                <strong>Location:</strong> {selectedTaskToDeliver.beneficiary_address}
              </p>
              <p>
                <strong>Items Delivered:</strong> {selectedTaskToDeliver.description} ({selectedTaskToDeliver.quantity_needed})
              </p>
            </div>

            <p className="text-xs text-[#667085]">
              By confirming, this assistance request will immediately transition to <strong>Completed</strong>, and the inventory items will be permanently marked as distributed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTaskToDeliver(null)}
                disabled={confirmingDelivery}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmDeliver}
                loading={confirmingDelivery}
              >
                Confirm Delivery
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Form Modal */}
      {feedbackModalOpen && selectedTaskForFeedback && (
        <FeedbackForm
          isOpen={feedbackModalOpen}
          targetType="VolunteerTask"
          targetId={selectedTaskForFeedback.id}
          targetTitle={selectedTaskForFeedback.title || `Task #${selectedTaskForFeedback.id}`}
          initialFeedback={feedbackByTaskId[selectedTaskForFeedback.id]}
          onClose={() => {
            setFeedbackModalOpen(false);
            setSelectedTaskForFeedback(null);
          }}
          onSuccess={() => {
            setSuccessMessage('Thank you! Your task feedback has been saved.');
            feedbackService.getMyFeedback({ target_type: 'VolunteerTask' })
              .then((res) => setMyFeedbackList(res.data?.data || []))
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
}
