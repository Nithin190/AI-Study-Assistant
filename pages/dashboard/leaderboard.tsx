import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { MOCK_LEADERBOARD } from '../../lib/mockData';
import { motion } from 'framer-motion';
import { Trophy, Star, Crown, Flame, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import clsx from 'clsx';

export default function LeaderboardDashboard() {
  const { user } = useAuth();
  
  // Mock a database fetch that only returns the real user
  let leaderboard = [...MOCK_LEADERBOARD].filter(u => u.isMe);
  if (user && leaderboard.length > 0) {
    const me = leaderboard[0];
    me.username = user.username;
    me.xp = user.xp;
    me.level = user.level;
    me.streak = user.streak;
  }
  
  // Sort and assign ranks
  leaderboard.sort((a, b) => b.xp - a.xp);
  leaderboard.forEach((u, i) => { u.rank = i + 1; });

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3, 10);
  
  // Reorder top 3 for podium: [2nd, 1st, 3rd]
  const podium = [
    top3[1] || null,
    top3[0] || null,
    top3[2] || null
  ];

  const getPodiumStyles = (index: number) => {
    // index in podium array: 0 is 2nd, 1 is 1st, 2 is 3rd
    if (index === 0) return { height: '140px', bg: 'from-slate-300 to-slate-500', medal: '🥈', border: 'border-slate-300/50', glow: 'shadow-[0_0_30px_rgba(148,163,184,0.3)]' };
    if (index === 1) return { height: '180px', bg: 'from-amber-300 to-amber-600', medal: '🏆', border: 'border-amber-400/60', glow: 'shadow-[0_0_50px_rgba(251,191,36,0.5)]' };
    return { height: '110px', bg: 'from-orange-400 to-orange-700', medal: '🥉', border: 'border-orange-500/50', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]' };
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 mb-4 shadow-glow-purple">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Global Leaderboard</h1>
          
          <div className="flex bg-white/5 p-1 rounded-xl w-max mx-auto border border-white/10">
            <button className="px-6 py-2 rounded-lg text-sm font-medium bg-white/10 text-white shadow-sm">This Week</button>
            <button className="px-6 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5">All Time</button>
          </div>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-2 sm:gap-6 mb-12 pt-16 min-h-[380px]">
          {podium.map((p, i) => {
            if (!p) return <div key={i} className="w-24 sm:w-32" />;
            const styles = getPodiumStyles(i);
            const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
            
            return (
              <motion.div 
                key={p.username}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex flex-col items-center w-24 sm:w-32"
              >
                {/* Avatar & Info */}
                <div className="flex flex-col items-center mb-4 relative">
                  <div className="absolute -top-10 text-3xl animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
                    {styles.medal}
                  </div>
                  
                  <div className={clsx(
                    "w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold text-white mb-3 relative bg-black",
                    styles.border, styles.glow
                  )}>
                    {p.username.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="text-sm font-bold text-white truncate w-full text-center">{p.username}</div>
                  <div className="text-xs text-amber-400 font-mono mt-1 flex items-center gap-1 justify-center"><Star className="w-3 h-3"/> {p.xp}</div>
                </div>

                {/* Pedestal */}
                <div 
                  className={clsx("w-full rounded-t-lg relative overflow-hidden flex items-start justify-center pt-4", styles.glow)}
                  style={{ height: styles.height, background: `linear-gradient(to bottom, var(--tw-gradient-stops))` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                  <span className="text-4xl font-display font-bold text-white/50">{rank}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* List */}
        <div className="glass-strong rounded-3xl overflow-hidden border-white/10 relative">
          <table className="w-full relative z-10">
            <thead className="bg-black/40 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-4 px-6 font-semibold text-left w-16">Rank</th>
                <th className="py-4 px-6 font-semibold text-left">Student</th>
                <th className="py-4 px-6 font-semibold text-center hidden sm:table-cell">Level</th>
                <th className="py-4 px-6 font-semibold text-right">XP</th>
                <th className="py-4 px-6 font-semibold text-right hidden sm:table-cell">Streak</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((p) => (
                <tr 
                  key={p.rank} 
                  className={clsx(
                    "border-b border-white/5 transition-colors group",
                    p.isMe ? "bg-purple-500/10 hover:bg-purple-500/20" : "hover:bg-white/5"
                  )}
                >
                  <td className="py-4 px-6">
                    <span className="text-slate-400 font-mono text-sm group-hover:text-white transition-colors">
                      {p.rank < 10 ? `0${p.rank}` : p.rank}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                        p.isMe ? "bg-gradient-to-br from-purple-500 to-cyan-500" : "bg-slate-700"
                      )}>
                        {p.username.charAt(0).toUpperCase()}
                      </div>
                      <span className={clsx("font-medium", p.isMe ? "text-purple-300" : "text-slate-200")}>
                        {p.username}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center hidden sm:table-cell">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-white/10 text-xs font-mono text-slate-300 border border-white/5">
                      {p.level}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="font-mono text-amber-400 flex items-center justify-end gap-1.5">
                      {p.xp} <Star className="w-3 h-3" />
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right hidden sm:table-cell">
                    <span className="font-mono text-orange-400 flex items-center justify-end gap-1.5">
                      {p.streak} <Flame className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}
