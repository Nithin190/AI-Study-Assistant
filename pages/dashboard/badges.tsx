import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ALL_BADGES } from '../../lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Star, Award, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

export default function BadgesDashboard() {
  const [filter, setFilter] = useState<'All' | 'Earned' | 'Locked'>('All');

  const earnedCount = ALL_BADGES.filter(b => b.earned).length;
  const totalCount = ALL_BADGES.length;
  
  const filteredBadges = ALL_BADGES.filter(b => {
    if (filter === 'Earned') return b.earned;
    if (filter === 'Locked') return !b.earned;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8 space-y-8">
        
        {/* Header & Overall Progress */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-500" />
              Achievement Badges
            </h1>
            <p className="text-slate-400">Complete challenges to earn XP and level up your profile.</p>
          </div>
          
          <div className="glass-card p-4 flex items-center gap-6 min-w-[280px]">
            <div>
              <div className="text-sm font-medium text-slate-400 mb-1">Badges Earned</div>
              <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                {earnedCount} <span className="text-sm text-slate-500 font-medium">/ {totalCount}</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(earnedCount / totalCount) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full relative"
                >
                  <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl w-max border border-white/10">
          {(['All', 'Earned', 'Locked'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={clsx(
                'px-6 py-2 rounded-lg text-sm font-medium transition-all',
                filter === tab 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredBadges.map((badge, i) => (
              <motion.div
                key={badge.key}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className={clsx(
                  'glass-card p-6 text-center relative overflow-hidden group transition-all duration-300',
                  badge.earned ? 'border-amber-500/20 hover:border-amber-500/40 hover:shadow-glow-purple' : 'opacity-60 grayscale-[0.8] hover:grayscale-[0.5]'
                )}
              >
                {!badge.earned && (
                  <div className="absolute top-3 right-3">
                    <Lock className="w-4 h-4 text-slate-500" />
                  </div>
                )}
                
                {badge.earned && (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                )}

                <div className="relative inline-block mb-4">
                  <div className={clsx(
                    'text-5xl drop-shadow-2xl transition-transform duration-500',
                    badge.earned && 'group-hover:scale-110 group-hover:-rotate-6'
                  )}>
                    {badge.icon}
                  </div>
                  {badge.earned && (
                    <div className="absolute -inset-4 bg-amber-500/20 blur-xl rounded-full -z-10 animate-pulse-glow" />
                  )}
                </div>

                <h3 className={clsx(
                  'font-semibold mb-1',
                  badge.earned ? 'text-white' : 'text-slate-300'
                )}>{badge.name}</h3>
                
                <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">{badge.description}</p>
                
                {badge.earned && (
                  <div className="mt-4 text-[10px] font-mono text-amber-500/80 uppercase tracking-widest flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Earned
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {filteredBadges.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            No badges found in this category.
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
