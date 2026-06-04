import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Zap, BookOpen, Brain, Sword, Camera, BarChart3,
  Trophy, Map, Target, ClipboardList, FlameKindling, Grid3X3,
  FileText, History, Users, Star, Settings, LogOut, Bell,
  ChevronLeft, ChevronRight, GraduationCap, Activity, Layers,
  FileCheck, BookMarked, Gauge, Globe, Lightbulb, BookOpenCheck,
  CalendarDays, Download, ChevronDown, Shield, Menu
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: string | number;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: MessageSquare, label: 'Chat', href: '/dashboard', group: 'main' },
  { icon: Zap, label: 'Quiz', href: '/dashboard/quiz', group: 'main' },
  { icon: Brain, label: 'Flashcards', href: '/dashboard/flashcards', group: 'main' },
  { icon: BookOpen, label: 'SRS Review', href: '/dashboard/srs', group: 'main' },
  { icon: Sword, label: 'Battle Rooms', href: '/dashboard/battle', group: 'main' },
  { icon: Camera, label: 'Snap & Study', href: '/dashboard/snap-study', group: 'main' },
  { icon: Target, label: 'Mastery', href: '/dashboard/mastery', group: 'learning' },
  { icon: Map, label: 'Knowledge Graph', href: '/dashboard/knowledge-graph', group: 'learning' },
  { icon: CalendarDays, label: 'Revision Scheduler', href: '/dashboard/study-plan', group: 'learning' },
  { icon: Trophy, label: 'Badges', href: '/dashboard/badges', group: 'insights' },
  { icon: FileCheck, label: 'Practice Paper', href: '/dashboard/practice-paper', group: 'tools' },
  { icon: BookMarked, label: 'Glossary', href: '/dashboard/glossary', group: 'tools' },
  { icon: Gauge, label: 'Exam Predictor', href: '/dashboard/exam-predictor', group: 'tools' },
  { icon: Globe, label: 'Multilingual Notes', href: '/dashboard/multilingual', group: 'tools' },
  { icon: Lightbulb, label: 'Concept Simplifier', href: '/dashboard/concept-simplifier', group: 'tools' },
  { icon: BookOpenCheck, label: 'Chapter Tracker', href: '/dashboard/chapter-tracker', group: 'tools' },
  { icon: FileText, label: 'My Documents', href: '/dashboard/documents', group: 'library' },
  { icon: History, label: 'Chat History', href: '/dashboard/chat-history', group: 'library' },
  { icon: Users, label: 'Classroom', href: '/dashboard/classroom', group: 'community' },
  { icon: Star, label: 'Leaderboard', href: '/dashboard/leaderboard', group: 'community' },
];

const GROUP_LABELS: Record<string, string> = {
  main: 'Study',
  learning: 'Learning',
  insights: 'Insights',
  tools: 'Tools',
  library: 'Library',
  community: 'Community',
};

const UNIQUE_GROUPS = ['main', 'learning', 'insights', 'tools', 'library', 'community'];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const xpProgress = user ? (user.xp % 100) : 0;
  const currentPath = router.pathname;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={clsx(
          'fixed left-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden',
          'lg:relative lg:flex',
          mobileOpen ? 'flex' : 'hidden lg:flex'
        )}
        style={{
          background: 'var(--bg-elevated)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--purple), var(--indigo))' }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="font-semibold text-sm leading-tight" style={{ color: 'var(--text)' }}>Study Assistant</div>
                <div className="text-xs font-medium" style={{ color: 'var(--purple)' }}>Pro</div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1.5 rounded-lg transition-colors hidden lg:flex hover:bg-slate-100"
            style={{ color: 'var(--text-muted)' }}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User card */}
        {user && (
          <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className={clsx('flex items-center gap-3 p-2 rounded-xl', collapsed && 'justify-center')}
              style={{ background: 'rgba(124,58,237,0.05)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-sm"
                style={{ background: 'linear-gradient(135deg, var(--purple), var(--cyan))', color: 'white' }}>
                {user.username[0].toUpperCase()}
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{user.username}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="badge badge-purple" style={{ fontSize: '10px', padding: '2px 8px' }}>⭐ {user.xp} XP</span>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Lv {user.level}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {!collapsed && (
              <div className="mt-2 px-2">
                <div className="flex justify-between text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  <span>Level {user.level + 1}</span>
                  <span>{xpProgress}/100 XP</span>
                </div>
                <div className="mastery-bar-track">
                  <div
                    className="mastery-bar-fill"
                    style={{
                      width: `${xpProgress}%`,
                      background: 'linear-gradient(90deg, var(--purple), var(--cyan))',
                    }}
                  />
                </div>
                <div className="flex items-center gap-1 mt-1.5 font-medium">
                  <span className="text-xs" style={{ color: '#f97316' }}>🔥</span>
                  <span className="text-xs" style={{ color: '#f97316' }}>{user.streak}-day streak</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2" style={{ scrollbarWidth: 'none' }}>
          {UNIQUE_GROUPS.map(group => {
            const items = NAV_ITEMS.filter(i => i.group === group);
            const seen = new Set<string>();
            const uniqueItems = items.filter(i => { if (seen.has(i.href)) return false; seen.add(i.href); return true; });
            return (
              <div key={group} className="mb-1">
                {!collapsed && (
                  <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
                    {GROUP_LABELS[group]}
                  </div>
                )}
                {uniqueItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href));
                  return (
                    <button
                      key={item.href}
                      onClick={() => { router.push(item.href); setMobileOpen(false); }}
                      className={clsx('sidebar-item w-full text-left relative', isActive && 'active', collapsed && 'justify-center px-0')}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {item.badge && !collapsed && (
                        <span className="ml-auto badge badge-rose" style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {item.badge}
                        </span>
                      )}
                      {item.badge && collapsed && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: 'var(--rose)' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-2 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={logout}
            className={clsx('sidebar-item w-full hover:text-rose-500 hover:bg-rose-50', collapsed && 'justify-center px-0')}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3"
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border)',
          }}>
          
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-slate-200 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Show open sidebar button on desktop if collapsed */}
            {collapsed && (
              <button
                className="hidden lg:flex p-2 rounded-lg hover:bg-slate-200 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => setCollapsed(false)}
                title="Expand Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm font-medium ml-2" style={{ color: 'var(--text-muted)' }}>
              <GraduationCap className="w-4 h-4" style={{ color: 'var(--purple)' }} />
              <span>Dashboard</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Streak indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
              <span className="text-sm">🔥</span>
              <span className="text-sm font-semibold" style={{ color: '#ea580c' }}>{user?.streak}d</span>
            </div>

            {/* XP badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
              <span className="text-sm">⭐</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--purple)' }}>{user?.xp} XP</span>
            </div>

            {/* Level */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <span className="text-sm font-semibold" style={{ color: '#059669' }}>Lv {user?.level}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 relative">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
