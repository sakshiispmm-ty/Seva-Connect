import React, { useState } from 'react';
import { Sparkles, HelpCircle, History, ArrowUpRight, ShieldCheck, ChevronDown } from 'lucide-react';

function getVolunteerTier(points = 0) {
  if (points >= 500) return { title: 'Legendary Guardian', color: 'from-amber-400 to-yellow-600', text: 'text-amber-500' };
  if (points >= 250) return { title: 'Master Champion', color: 'from-purple-500 to-indigo-600', text: 'text-purple-500' };
  if (points >= 100) return { title: 'Active Hero', color: 'from-emerald-400 to-teal-600', text: 'text-emerald-500' };
  return { title: 'Community Volunteer', color: 'from-blue-400 to-cyan-600', text: 'text-blue-500' };
}

export default function PointsSummary({ pointsData = {}, onOpenLeaderboard }) {
  const [showRules, setShowRules] = useState(false);
  const [showLedger, setShowLedger] = useState(false);

  const totalPoints = pointsData.totalPoints || 0;
  const transactions = pointsData.transactions || [];
  const tier = getVolunteerTier(totalPoints);

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-sm relative overflow-hidden">
      {/* Decorative top accent */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${tier.color}`} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Total points & Tier */}
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Volunteer Recognition System
            </span>
            <button
              onClick={() => setShowRules(!showRules)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs inline-flex items-center gap-1"
              title="View points formula"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How points work</span>
            </button>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {totalPoints.toLocaleString('en-IN')}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Service Points
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 ${tier.text}`}>
              {tier.title}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Points recognize your community assistance deliveries. Points are strictly merit recognition and do not affect task assignments.
          </p>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {transactions.length > 0 && (
            <button
              onClick={() => setShowLedger(!showLedger)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 transition"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>{showLedger ? 'Hide Ledger' : 'History'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLedger ? 'rotate-180' : ''}`} />
            </button>
          )}

          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#087F73] hover:bg-[#066359] text-white shadow-sm transition"
            >
              <span>View Leaderboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Rules Explainer Callout */}
      {showRules && (
        <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 animate-in fade-in duration-150">
          <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Transparent Points Formula
          </h4>
          <ul className="space-y-1 list-disc list-inside">
            <li><strong>Base Task Completion:</strong> +50 points for every delivered community assistance task.</li>
            <li><strong>High Priority Bonus:</strong> +25 extra points (+75 total) for emergency relief missions.</li>
            <li><strong>Medium Priority Bonus:</strong> +10 extra points (+60 total).</li>
            <li><strong>Low Priority:</strong> +50 standard points.</li>
            <li><strong>Badges:</strong> Automatically unlocked upon reaching delivery and point milestones.</li>
          </ul>
        </div>
      )}

      {/* Transaction Ledger Dropdown */}
      {showLedger && transactions.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-slate-500" />
            Points Ledger (Recent Activity)
          </h4>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 text-xs border border-slate-100 dark:border-slate-800/80"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {tx.reason}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(tx.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  +{tx.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
