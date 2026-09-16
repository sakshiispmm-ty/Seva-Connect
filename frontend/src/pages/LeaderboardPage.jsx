import React, { useState, useEffect } from 'react';
import { volunteerService } from '../services/api';
import BadgeDisplay from '../components/BadgeDisplay';
import { Trophy, Medal, Award, Flame, Search, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await volunteerService.getLeaderboard({ limit: 50 });
      setLeaderboard(res.data.leaderboard || []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError('Could not load volunteer leaderboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = leaderboard.filter((item) => {
    if (!searchTerm) return true;
    return (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Volunteer Hall of Fame & Recognition</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Community Service Leaderboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Celebrating our dedicated ground volunteers who turn empathy into impact across communities. Points and badges recognize service milestones without altering task assignments.
          </p>
        </div>

        {/* Top 3 Podium (if >= 3 volunteers) */}
        {!loading && topThree.length >= 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 max-w-4xl mx-auto items-end">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="order-2 md:order-1 bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-sm text-center relative hover:shadow-md transition">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-extrabold text-lg border-2 border-slate-300 dark:border-slate-600">
                  2
                </div>
                <div className="mt-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">
                    {topThree[1].name}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{topThree[1].email}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="block font-extrabold text-slate-900 dark:text-white text-base">
                      {topThree[1].totalPoints}
                    </span>
                    <span className="text-slate-400 text-[11px]">Points</span>
                  </div>
                  <div>
                    <span className="block font-extrabold text-slate-900 dark:text-white text-base">
                      {topThree[1].completedTasks}
                    </span>
                    <span className="text-slate-400 text-[11px]">Tasks</span>
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place Champion */}
            {topThree[0] && (
              <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 to-white dark:from-slate-800 dark:to-slate-800/90 rounded-2xl p-6 border-2 border-amber-400 dark:border-amber-500 shadow-md text-center relative -translate-y-2 hover:shadow-lg transition">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[11px] font-extrabold rounded-full shadow-sm flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  <span>Top Volunteer</span>
                </div>
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-900 font-extrabold text-2xl shadow-inner mt-1">
                  1
                </div>
                <div className="mt-3">
                  <h3 className="font-black text-slate-900 dark:text-white text-lg truncate">
                    {topThree[0].name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{topThree[0].email}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-amber-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="block font-black text-amber-600 dark:text-amber-400 text-lg">
                      {topThree[0].totalPoints}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">Points</span>
                  </div>
                  <div>
                    <span className="block font-black text-slate-900 dark:text-white text-lg">
                      {topThree[0].completedTasks}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">Deliveries</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="order-3 bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-sm text-center relative hover:shadow-md transition">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-800 dark:text-amber-300 font-extrabold text-lg border-2 border-amber-300 dark:border-amber-700">
                  3
                </div>
                <div className="mt-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">
                    {topThree[2].name}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{topThree[2].email}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="block font-extrabold text-slate-900 dark:text-white text-base">
                      {topThree[2].totalPoints}
                    </span>
                    <span className="text-slate-400 text-[11px]">Points</span>
                  </div>
                  <div>
                    <span className="block font-extrabold text-slate-900 dark:text-white text-base">
                      {topThree[2].completedTasks}
                    </span>
                    <span className="text-slate-400 text-[11px]">Tasks</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Bar & Table Header */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Medal className="w-5 h-5 text-[#087F73]" />
                All Ranked Volunteers
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Volunteers are ranked based on total service points and verified deliveries fulfilled.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search volunteer..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#087F73]"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-3" />
              <p>Loading community leaderboard...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-rose-500 text-sm">
              <p>{error}</p>
              <button
                onClick={fetchLeaderboard}
                className="mt-3 px-4 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 text-xs font-bold"
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <p>No volunteers found matching your query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-3">Volunteer</th>
                    <th className="py-3 px-3 text-center">Completed Deliveries</th>
                    <th className="py-3 px-3">Badges Earned</th>
                    <th className="py-3 px-3 text-right">Service Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filtered.map((item) => {
                    let rankBadge = null;
                    if (item.rank === 1) {
                      rankBadge = <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-extrabold text-xs">1</span>;
                    } else if (item.rank === 2) {
                      rankBadge = <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white font-extrabold text-xs">2</span>;
                    } else if (item.rank === 3) {
                      rankBadge = <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-200 text-amber-900 font-extrabold text-xs">3</span>;
                    } else {
                      rankBadge = <span className="text-slate-400 font-bold text-xs ml-1.5">#{item.rank}</span>;
                    }

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-3">
                          {rankBadge}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                              {item.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white block">
                                {item.name}
                              </span>
                              <span className="text-xs text-slate-400">
                                {item.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center font-semibold text-slate-800 dark:text-slate-200">
                          {item.completedTasks}
                        </td>
                        <td className="py-3.5 px-3">
                          {item.badges && item.badges.length > 0 ? (
                            <BadgeDisplay badges={item.badges.map(b => ({ ...b, earned: true }))} compact />
                          ) : (
                            <span className="text-xs text-slate-400 italic">No badges yet</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <span className="font-extrabold text-[#087F73] dark:text-emerald-400 text-base">
                            {item.totalPoints.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">pts</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Callout for Community Participation */}
        <div className="bg-gradient-to-r from-[#087F73] to-teal-700 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-bold flex items-center gap-2 justify-center sm:justify-start">
              <Heart className="w-5 h-5 fill-white text-white" />
              Want to make a difference in your community?
            </h3>
            <p className="text-sm text-teal-100 max-w-xl">
              Join SevaConnect as a volunteer, deliver vital aid packages to verified beneficiaries, and earn recognition across our community.
            </p>
          </div>
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-white text-[#087F73] font-bold text-sm hover:bg-teal-50 transition shadow-sm shrink-0 inline-flex items-center gap-2"
          >
            <span>Register as Volunteer</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
