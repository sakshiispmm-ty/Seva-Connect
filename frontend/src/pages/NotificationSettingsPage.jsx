import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/api';
import { Bell, ShieldCheck, Mail, CheckCircle2, AlertCircle, ArrowLeft, Layers, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState({
    donations: true,
    tasks: true,
    system: true,
    email_digest: false
  });
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSettingsAndDigest();
  }, []);

  const loadSettingsAndDigest = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prefRes, digestRes] = await Promise.all([
        notificationService.getPreferences(),
        notificationService.getDigest()
      ]);
      if (prefRes.data.preferences) {
        setPreferences(prefRes.data.preferences);
      }
      if (digestRes.data.digest) {
        setDigest(digestRes.data.digest);
      }
    } catch (err) {
      console.error('Failed to load notification settings:', err);
      setError('Could not load notification preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    const updated = {
      ...preferences,
      [key]: !preferences[key]
    };
    setPreferences(updated);

    try {
      setSaving(true);
      setSaveSuccess(false);
      await notificationService.updatePreferences(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setError('Failed to update preference setting.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation back */}
        <div>
          <Link
            to="/notifications"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Notifications</span>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <Sliders className="w-3.5 h-3.5" />
                <span>Preference Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Notification Preferences & Activity Digest
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Control which category bulletins you receive in real-time, and view an aggregated activity summary.
              </p>
            </div>

            {saveSuccess && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Preferences Saved</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Settings Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Toggles */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Bell className="w-4 h-4 text-[#087F73]" />
                In-App Notification Categories
              </h2>

              {/* Donations Category */}
              <div className="flex items-start justify-between gap-4 py-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Donations & Contributions
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Receive alerts when your donations are verified, completed, or when campaign goals are reached.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('donations')}
                  disabled={loading || saving}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                    preferences.donations ? 'bg-[#087F73]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      preferences.donations ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Tasks Category */}
              <div className="flex items-start justify-between gap-4 py-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Volunteer Tasks & Milestone Badges
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Updates on assigned community deliveries, status changes, service points, and unlocked badges.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('tasks')}
                  disabled={loading || saving}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                    preferences.tasks ? 'bg-[#087F73]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      preferences.tasks ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* System Category */}
              <div className="flex items-start justify-between gap-4 py-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Platform & System Bulletins
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    System maintenance alerts, community guidelines updates, and official announcements.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('system')}
                  disabled={loading || saving}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                    preferences.system ? 'bg-[#087F73]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      preferences.system ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Email Digest Settings */}
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Mail className="w-4 h-4 text-indigo-500" />
                Email Digest Summary
              </h2>

              <div className="flex items-start justify-between gap-4 py-1">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Weekly Activity Digest
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Receive a consolidated summary of community progress, deliveries fulfilled, and active campaigns.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('email_digest')}
                  disabled={loading || saving}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                    preferences.email_digest ? 'bg-[#087F73]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      preferences.email_digest ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Right Col: Activity Digest Card */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#087F73]" />
                Recent Activity Digest
              </h3>

              {digest ? (
                <div className="space-y-4">
                  {/* Category Breakdown */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Donation Updates:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {digest.categoryCounts?.donations?.unread || 0} unread ({digest.categoryCounts?.donations?.total || 0} total)
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Task & Badge Alerts:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {digest.categoryCounts?.tasks?.unread || 0} unread ({digest.categoryCounts?.tasks?.total || 0} total)
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 dark:text-slate-400">System Bulletins:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {digest.categoryCounts?.system?.unread || 0} unread ({digest.categoryCounts?.system?.total || 0} total)
                      </span>
                    </div>
                  </div>

                  {/* Top Highlights */}
                  {digest.recentHighlights && digest.recentHighlights.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Latest Highlights
                      </h4>
                      <div className="space-y-2">
                        {digest.recentHighlights.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-xs border border-slate-100 dark:border-slate-800/80"
                          >
                            <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                              {item.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Loading digest data...
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1.5" />
              <p>
                Muting a category suppresses notifications from appearing in your notification bell and activity feed. Critical security announcements cannot be muted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
