import React, { useState } from 'react';
import { Award, ShieldCheck, Trophy, Flame, Zap, Crown, Lock, CheckCircle2, X, Sparkles, Target, Calendar } from 'lucide-react';

const ICON_MAP = {
  award: Award,
  'shield-check': ShieldCheck,
  trophy: Trophy,
  flame: Flame,
  zap: Zap,
  crown: Crown
};

const COLOR_MAP = {
  award: { bg: 'from-blue-500 to-indigo-600', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-400' },
  'shield-check': { bg: 'from-emerald-500 to-teal-600', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-400' },
  trophy: { bg: 'from-amber-400 to-orange-500', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-400' },
  flame: { bg: 'from-rose-500 to-red-600', border: 'border-rose-300 dark:border-rose-700', text: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-400' },
  zap: { bg: 'from-purple-500 to-violet-600', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-400' },
  crown: { bg: 'from-yellow-400 via-amber-500 to-yellow-600', border: 'border-yellow-300 dark:border-yellow-700', text: 'text-yellow-600 dark:text-yellow-400', ring: 'ring-yellow-400' }
};

export default function BadgeDisplay({ badges = [], compact = false, title = "Community Badges & Honors" }) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const earnedCount = badges.filter(b => b.earned).length;

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
  };

  const closeModal = () => {
    setSelectedBadge(null);
  };

  if (compact) {
    return (
      <>
        <div className="flex flex-wrap gap-2 items-center">
          {badges.map((b) => {
            const Icon = ICON_MAP[b.icon] || Award;
            const styling = COLOR_MAP[b.icon] || COLOR_MAP.award;

            return (
              <button
                type="button"
                key={b.id || b.name}
                onClick={() => handleBadgeClick(b)}
                title={`Click to inspect ${b.name}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                  b.earned
                    ? `bg-white dark:bg-slate-800 ${styling.border} ${styling.text} shadow-xs`
                    : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 opacity-70 hover:opacity-100'
                }`}
              >
                {b.earned ? (
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Lock className="w-3 h-3 shrink-0" />
                )}
                <span>{b.name}</span>
              </button>
            );
          })}
        </div>

        {/* Modal when clicked in compact mode */}
        {selectedBadge && renderModal(selectedBadge, closeModal)}
      </>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any badge to view milestone requirements, unlock criteria, and current progress.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{earnedCount} of {badges.length} Badges Unlocked</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const Icon = ICON_MAP[badge.icon] || Award;
          const styling = COLOR_MAP[badge.icon] || COLOR_MAP.award;

          return (
            <button
              type="button"
              key={badge.id || badge.name}
              onClick={() => handleBadgeClick(badge)}
              className={`text-left relative rounded-xl p-4 border transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#087F73] active:scale-[0.98] ${
                badge.earned
                  ? `bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50 ${styling.border} shadow-sm hover:shadow-md hover:-translate-y-0.5`
                  : 'bg-slate-50 dark:bg-slate-800/30 border-dashed border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-400 hover:shadow-xs hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                    badge.earned
                      ? `bg-gradient-to-br ${styling.bg} text-white ring-2 ring-white dark:ring-slate-800`
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                >
                  {badge.earned ? <Icon className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className={`text-sm font-bold truncate ${badge.earned ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                      {badge.name}
                    </h4>
                    {badge.earned ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded shrink-0">
                        Earned
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 group-hover:text-[#087F73] transition-colors shrink-0">
                        Details →
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {badge.description}
                  </p>

                  {/* Progress or Earned Footer */}
                  {badge.earned ? (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Unlocked {badge.earnedAt ? `on ${new Date(badge.earnedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'Honor'}</span>
                    </p>
                  ) : badge.progress ? (
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Progress</span>
                        <span className="font-bold">{badge.progress.current} / {badge.progress.target} {badge.progress.unit}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#087F73] h-full rounded-full transition-all duration-300"
                          style={{ width: `${badge.progress.percent || 0}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic mt-2">
                      Click to inspect criteria
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Detail Modal */}
      {selectedBadge && renderModal(selectedBadge, closeModal)}
    </div>
  );
}

function renderModal(badge, onClose) {
  const Icon = ICON_MAP[badge.icon] || Award;
  const styling = COLOR_MAP[badge.icon] || COLOR_MAP.award;
  const progress = badge.progress;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md bg-gradient-to-br ${styling.bg}`}
            >
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {badge.name}
                </h3>
                {badge.earned ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    Locked
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Milestone Recognition Honor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
          <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
            Milestone Description
          </span>
          <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">
            {badge.description}
          </p>
        </div>

        {/* Progress Section */}
        {progress && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#087F73]" />
                Milestone Progress
              </span>
              <span className="font-black text-slate-900 dark:text-white">
                {progress.current} / {progress.target} {progress.unit} ({progress.percent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  badge.earned
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-r from-[#087F73] to-teal-600'
                }`}
                style={{ width: `${badge.earned ? 100 : progress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Earned Date or Unlock Tip */}
        {badge.earned ? (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>
              Congratulations! This honor is proudly displayed on your public volunteer profile and the community leaderboard.
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Fulfill upcoming assigned community relief tasks to automatically unlock this badge and earn service bonus points!
            </span>
          </div>
        )}

        {/* Footer Action */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition shadow-sm"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
