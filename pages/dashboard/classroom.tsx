import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, BookOpen, ChevronRight, Bell, CheckCircle, Clock, Crown, Award, UserPlus, QrCode } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import clsx from 'clsx';

export default function ClassroomDashboard() {
  const { user } = useAuth();
  const [roleMode, setRoleMode] = useState<'student' | 'teacher'>(user?.role === 'teacher' || user?.role === 'admin' ? 'teacher' : 'student');
  const [joinCode, setJoinCode] = useState('');
  const [activeClass, setActiveClass] = useState<any>(null);

  const MOCK_CLASSES = [
    { id: 1, name: 'CS301 - Machine Learning', teacher: 'Prof. Anderson', members: 42, code: 'ML2024' },
    { id: 2, name: 'CS201 - Algorithms', teacher: 'Dr. Smith', members: 128, code: 'ALG4X9' }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-500" />
              {activeClass ? activeClass.name : 'Classroom'}
            </h1>
            <p className="text-slate-400">
              {activeClass ? `Taught by ${activeClass.teacher} • ${activeClass.members} students` : 'Collaborate with peers, teachers, and AI in shared learning environments.'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {activeClass && (
              <button onClick={() => setActiveClass(null)} className="btn-secondary">
                <ChevronRight className="w-4 h-4 rotate-180" /> Back to List
              </button>
            )}

            {!activeClass && (user?.role === 'teacher' || user?.role === 'admin') && (
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => setRoleMode('student')}
                  className={clsx('px-6 py-2 rounded-lg text-sm font-medium transition-all', roleMode === 'student' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200')}
                >
                  Student View
                </button>
                <button 
                  onClick={() => setRoleMode('teacher')}
                  className={clsx('px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2', roleMode === 'teacher' ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200')}
                >
                  <Crown className="w-4 h-4" /> Teacher View
                </button>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* STUDENT VIEW */}
          {!activeClass && roleMode === 'student' && (
            <motion.div key="student" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 space-y-8">
                {/* My Classrooms */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-400"/> My Classrooms</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {MOCK_CLASSES.map(cls => (
                      <div key={cls.id} className="glass-card p-6 border-white/10 hover:border-indigo-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="badge badge-purple">{cls.code}</div>
                          <div className="flex items-center gap-1 text-xs text-slate-400"><Users className="w-3 h-3"/> {cls.members}</div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{cls.name}</h3>
                        <p className="text-sm text-slate-400 mb-6">{cls.teacher}</p>
                        <button onClick={() => setActiveClass(cls)} className="w-full btn-secondary group-hover:bg-indigo-500/20 group-hover:text-indigo-300 group-hover:border-indigo-500/50 transition-all">
                          Enter Classroom <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Join Classroom */}
                <div className="glass-strong p-8 rounded-3xl border-cyan-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><UserPlus className="w-32 h-32 text-cyan-500" /></div>
                  <h2 className="text-xl font-bold text-white mb-4">Join a New Class</h2>
                  <p className="text-sm text-slate-400 mb-6 max-w-md">Enter the 6-character invite code provided by your teacher to access assignments, quizzes, and shared documents.</p>
                  <div className="flex gap-4 max-w-sm relative z-10">
                    <input 
                      type="text" 
                      placeholder="e.g. X7K9M2" 
                      maxLength={6}
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      className="input-base font-mono uppercase tracking-widest text-center flex-1" 
                    />
                    <button className="btn-primary" disabled={joinCode.length !== 6}>Join</button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-amber-400"/> Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="mt-1"><div className="w-2 h-2 rounded-full bg-rose-500" /></div>
                      <div>
                        <p className="text-sm text-slate-200">New quiz assigned in <span className="font-medium">CS301</span></p>
                        <p className="text-xs text-slate-500 mt-1">Due in 2 days</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="mt-1"><div className="w-2 h-2 rounded-full bg-transparent border border-slate-500" /></div>
                      <div>
                        <p className="text-sm text-slate-400">Dr. Smith uploaded new study material in <span className="font-medium text-slate-300">CS201</span></p>
                        <p className="text-xs text-slate-500 mt-1">Yesterday</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 border-emerald-500/20">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-emerald-400"/> Class Rank</h3>
                  <div className="text-center p-4">
                    <div className="text-4xl font-display font-bold text-white mb-1">Top 5%</div>
                    <div className="text-sm text-slate-400">in CS301 - Machine Learning</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TEACHER VIEW */}
          {!activeClass && roleMode === 'teacher' && (
            <motion.div key="teacher" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 space-y-8">
                {/* Manage Classrooms */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Crown className="w-5 h-5 text-indigo-400"/> My Classrooms (Teacher)</h2>
                    <button className="btn-secondary text-sm h-9"><Plus className="w-4 h-4"/> Create Class</button>
                  </div>
                  
                  <div className="glass-card p-0 overflow-hidden border-indigo-500/30">
                    <div className="p-6 border-b border-white/10 bg-indigo-500/5 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-white">CS301 - Machine Learning</h3>
                          <span className="badge badge-purple font-mono">ML2024</span>
                        </div>
                        <p className="text-sm text-slate-400">Created Sep 1, 2023</p>
                      </div>
                      <button onClick={() => setActiveClass(MOCK_CLASSES[0])} className="btn-primary">Manage</button>
                    </div>
                    
                    <div className="grid grid-cols-3 divide-x divide-white/10 bg-black/20">
                      <div className="p-4 text-center">
                        <div className="text-2xl font-bold text-white">42</div>
                        <div className="text-xs text-slate-400 uppercase">Students</div>
                      </div>
                      <div className="p-4 text-center">
                        <div className="text-2xl font-bold text-white">12</div>
                        <div className="text-xs text-slate-400 uppercase">Quizzes</div>
                      </div>
                      <div className="p-4 text-center">
                        <div className="text-2xl font-bold text-emerald-400">76%</div>
                        <div className="text-xs text-slate-400 uppercase">Avg Mastery</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Roster (Preview) */}
                <div className="glass-card overflow-hidden">
                  <div className="p-5 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-semibold text-white">Student Roster</h3>
                    <button className="text-sm text-indigo-400 hover:text-indigo-300">View All</button>
                  </div>
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-black/20">
                      <tr>
                        <th className="px-6 py-3 font-medium">Student</th>
                        <th className="px-6 py-3 font-medium">Mastery</th>
                        <th className="px-6 py-3 font-medium">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Alex Chen', mastery: 85, active: 'Today' },
                        { name: 'Priya Sharma', mastery: 72, active: 'Yesterday' },
                        { name: 'Kai Nakamura', mastery: 45, active: '3 days ago' },
                      ].map((s, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-6 py-3 font-medium text-slate-200">{s.name}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full ${s.mastery > 70 ? 'bg-emerald-500' : s.mastery > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${s.mastery}%` }} />
                              </div>
                              <span className="text-xs font-mono">{s.mastery}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-slate-400">{s.active}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Teacher Actions Sidebar */}
              <div className="space-y-6">
                <div className="glass-strong p-6 rounded-2xl border-cyan-500/30">
                  <h3 className="font-semibold text-white mb-4">Quick Assign Quiz</h3>
                  <div className="space-y-4">
                    <select className="input-base w-full">
                      <option>CS301 - Machine Learning</option>
                      <option>CS201 - Algorithms</option>
                    </select>
                    <input type="text" placeholder="Quiz Topic (e.g. Neural Nets)" className="input-base w-full" />
                    <button className="btn-primary w-full shadow-[0_0_20px_rgba(6,182,212,0.3)]">Generate & Assign</button>
                  </div>
                </div>

                <div className="glass-card p-6 text-center border-dashed border-white/20">
                  <QrCode className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <h3 className="font-medium text-slate-300 mb-1">Invite Students</h3>
                  <p className="text-xs text-slate-500 mb-4">Share this code or QR with your class</p>
                  <div className="text-2xl font-mono font-bold tracking-widest text-indigo-400 bg-indigo-500/10 py-2 rounded-lg border border-indigo-500/30">ML2024</div>
                </div>
              </div>

            </motion.div>
          )}

          {/* ACTIVE CLASSROOM VIEW */}
          {activeClass && (
            <motion.div key="activeClass" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="glass-strong p-8 rounded-3xl border-indigo-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><BookOpen className="w-32 h-32 text-indigo-500" /></div>
                  <h2 className="text-xl font-bold text-white mb-2">Class Announcements</h2>
                  <div className="space-y-4 mt-6 relative z-10">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-indigo-300">Midterm Exam Preparation</h4>
                        <span className="text-xs text-slate-500">2 days ago</span>
                      </div>
                      <p className="text-sm text-slate-300">I have uploaded the practice paper for the upcoming midterm. Please review chapters 1-4 and attempt the paper before Friday's discussion session.</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-indigo-300">Welcome to {activeClass.name}!</h4>
                        <span className="text-xs text-slate-500">Aug 28</span>
                      </div>
                      <p className="text-sm text-slate-300">Welcome everyone! Make sure you use the invite code {activeClass.code} to get your peers enrolled. Syllabus is available in the shared docs.</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Shared Study Materials</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                     <div className="p-4 border border-white/10 rounded-xl hover:bg-white/5 cursor-pointer transition-colors flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-rose-400" />
                        <div>
                          <h4 className="font-medium text-white">Ch1_Introduction.pdf</h4>
                          <p className="text-xs text-slate-400">Added by {activeClass.teacher}</p>
                        </div>
                     </div>
                     <div className="p-4 border border-white/10 rounded-xl hover:bg-white/5 cursor-pointer transition-colors flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-rose-400" />
                        <div>
                          <h4 className="font-medium text-white">Ch2_Deep_Learning.pdf</h4>
                          <p className="text-xs text-slate-400">Added by {activeClass.teacher}</p>
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card p-6 border-indigo-500/20">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-emerald-400"/> Class Leaderboard</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Alex Chen', pts: 2450, isMe: false },
                      { name: 'Priya Sharma', pts: 2120, isMe: false },
                      { name: 'You', pts: 1840, isMe: true },
                      { name: 'Kai Nakamura', pts: 1650, isMe: false },
                    ].map((s, i) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${s.isMe ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-black/20'}`}>
                        <div className="flex items-center gap-3">
                          <span className={`font-bold w-4 text-center ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'}`}>{i + 1}</span>
                          <span className={s.isMe ? 'text-indigo-300 font-medium' : 'text-slate-200'}>{s.name}</span>
                        </div>
                        <span className="text-sm font-mono text-emerald-400">{s.pts} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
