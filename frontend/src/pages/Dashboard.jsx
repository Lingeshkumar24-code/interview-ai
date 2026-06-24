import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, Zap, BarChart3, TrendingUp, Award, Clock, Plus, ChevronRight, Target } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';

const readinessColor = {
  Excellent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Ready: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'Needs Improvement': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Beginner: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const diffColor = { Easy: 'text-emerald-400', Medium: 'text-amber-400', Hard: 'text-red-400', Adaptive: 'text-violet-400' };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await interviewAPI.getDashboard();
        setStats(res.data);
      } catch (e) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = stats
    ? [
        { label: 'Total Interviews', value: stats.total_interviews, icon: Brain, color: 'from-blue-600 to-cyan-500', suffix: '' },
        { label: 'Average Score', value: `${stats.average_score}`, icon: TrendingUp, color: 'from-violet-600 to-purple-500', suffix: '/100' },
        { label: 'Highest Score', value: `${stats.highest_score}`, icon: Award, color: 'from-emerald-600 to-teal-500', suffix: '/100' },
        { label: 'Readiness', value: stats.interview_readiness, icon: Target, color: 'from-amber-600 to-orange-500', suffix: '' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-white">
              Welcome back, <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-400 mt-1">Ready to practice your next interview?</p>
          </div>
          <Link to="/interview/setup">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-600/30 transition-shadow"
            >
              <Plus className="w-5 h-5" /> Start New Interview
            </motion.button>
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-2/3 mb-4" />
                <div className="h-8 bg-white/10 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {cards.map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-black text-white">{card.value}{card.suffix}</div>
                <div className="text-slate-400 text-sm mt-1">{card.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-white mb-6">Score Progression</h2>
            {stats?.score_history?.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.score_history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    labelStyle={{ color: '#94A3B8' }}
                    itemStyle={{ color: '#60A5FA' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={3} dot={{ fill: '#2563EB', strokeWidth: 2, r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
                <p>No interview data yet. Start your first interview!</p>
              </div>
            )}
          </motion.div>

          {/* Recent Interviews */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-white mb-4">Recent Interviews</h2>
            {stats?.recent_interviews?.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_interviews.map((iv) => (
                  <Link key={iv.id} to={`/report/${iv.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{iv.role}</div>
                      <div className={`text-xs ${diffColor[iv.difficulty] || 'text-slate-400'}`}>{iv.difficulty}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{Math.round(iv.overall_score)}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-center">
                <Clock className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No interviews yet</p>
              </div>
            )}
            <Link to="/interview/setup" className="flex items-center justify-center gap-2 mt-4 w-full py-3 rounded-xl border border-dashed border-white/20 text-slate-400 hover:text-white hover:border-blue-500 transition-all text-sm">
              <Plus className="w-4 h-4" /> New Interview
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
