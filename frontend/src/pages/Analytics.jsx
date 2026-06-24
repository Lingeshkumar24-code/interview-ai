import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Target, Brain } from 'lucide-react';
import Navbar from '../components/Navbar';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#2563EB', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

export default function Analytics() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewAPI.list()
      .then((res) => setInterviews(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const scoreHistory = interviews.map((iv, i) => ({
    name: `#${i + 1}`,
    score: Math.round(iv.overall_score),
    role: iv.role,
  })).reverse();

  const roleData = Object.entries(
    interviews.reduce((acc, iv) => {
      const r = iv.role.split(' ')[0];
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const avgByDifficulty = ['Easy', 'Medium', 'Hard', 'Adaptive'].map((diff) => {
    const filtered = interviews.filter((iv) => iv.difficulty === diff);
    return {
      difficulty: diff,
      avg: filtered.length ? Math.round(filtered.reduce((s, iv) => s + iv.overall_score, 0) / filtered.length) : 0,
      count: filtered.length,
    };
  }).filter((d) => d.count > 0);

  const radarData = [
    { subject: 'Technical', A: 75 },
    { subject: 'Clarity', A: 68 },
    { subject: 'Depth', A: 72 },
    { subject: 'Communication', A: 80 },
    { subject: 'Problem Solving', A: 65 },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-white">Performance Analytics</h1>
          <p className="text-slate-400 mt-1">Track your interview journey over time</p>
        </motion.div>

        {interviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">No interview data yet.</p>
            <p className="text-sm">Complete an interview to see analytics!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score progression */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:col-span-2"
            >
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" /> Score Progression
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    labelStyle={{ color: '#94A3B8' }}
                    formatter={(v, n, p) => [v, p.payload.role]}
                  />
                  <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={3}
                    dot={{ fill: '#2563EB', strokeWidth: 2, r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Difficulty bar chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-violet-400" /> Score by Difficulty
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={avgByDifficulty}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="difficulty" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                  <Bar dataKey="avg" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Role distribution pie */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" /> Role Distribution
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Skill radar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:col-span-2"
            >
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-400" /> Skill Radar (Estimated)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <Radar dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Stats summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { label: 'Total Interviews', value: interviews.length },
                { label: 'Average Score', value: `${Math.round(interviews.reduce((s, iv) => s + iv.overall_score, 0) / interviews.length)}/100` },
                { label: 'Best Score', value: `${Math.round(Math.max(...interviews.map((iv) => iv.overall_score)))}/100` },
                { label: 'Worst Score', value: `${Math.round(Math.min(...interviews.map((iv) => iv.overall_score)))}/100` },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                  <div className="text-2xl font-black text-white mb-1">{s.value}</div>
                  <div className="text-slate-400 text-sm">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
