import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import RequestStatusBadge from '../../components/RequestStatusBadge';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { volunteerService } from '../../services/api';
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
  Sparkles
} from 'lucide-react';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Confirmation Modal state
  const [selectedTaskToDeliver, setSelectedTaskToDeliver] = useState(null);
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await volunteerService.getTasks();
      if (response.data && response.data.success) {
        setTasks(response.data.tasks || []);
      } else {
        setError(response.data?.message || 'Failed to load assigned tasks.');
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
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'Active') return task.status !== 'Completed';
    if (activeFilter === 'Completed') return task.status === 'Completed';
    return true;
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
          <div className="flex items-center gap-2">
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

          {/* Activity Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#EAF6F3] text-[#087F73] flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Total Assigned</p>
                <p className="text-2xl font-extrabold text-[#17243A]">{totalTasks}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Pending Delivery</p>
                <p className="text-2xl font-extrabold text-amber-700">{pendingTasks}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-extrabold text-emerald-700">{completedTasks}</p>
              </div>
            </div>
          </div>

          {/* Task Feed */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
            {/* Header & Filter Tabs */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#17243A]">Assigned Relief Tasks & Deliveries</h2>
                <p className="text-xs text-[#667085] mt-0.5">
                  Confirm delivery once relief resources are safely handed over to the beneficiary.
                </p>
              </div>

              <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                {['All', 'Active', 'Completed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeFilter === tab
                        ? 'bg-white text-[#17243A] shadow-xs'
                        : 'text-[#667085] hover:text-[#17243A]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Task List / Table */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-[#087F73] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-[#667085]">Loading assigned tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#17243A]">No Tasks Found</h3>
                <p className="text-xs text-[#667085] mt-1">
                  {activeFilter === 'Completed'
                    ? 'You have not marked any deliveries as completed yet.'
                    : 'There are currently no active assistance deliveries assigned to you.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredTasks.map((task) => {
                  const isCompleted = task.status === 'Completed';

                  return (
                    <div
                      key={task.id}
                      className="p-5 sm:p-6 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-extrabold text-[#087F73]">
                            #REQ-00{task.id}
                          </span>
                          <RequestStatusBadge status={task.status} size="sm" />
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              task.urgency === 'High'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {task.urgency} Urgency
                          </span>
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
                                Allocated Resources:
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

                      {/* Action Button */}
                      <div className="shrink-0 flex items-center gap-3">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4" />
                            Delivered Successfully
                          </span>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedTaskToDeliver(task)}
                            className="w-full sm:w-auto"
                          >
                            Mark as Delivered
                          </Button>
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
    </div>
  );
}
