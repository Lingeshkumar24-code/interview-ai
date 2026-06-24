import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, TrendingUp, BookOpen, ArrowRight, CheckCircle, XCircle, DollarSign, Map, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';

const readinessColor = {
  Ready: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Almost Ready': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'Needs Improvement': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Beginner: 'text-red-400 bg-red-500/10 border-red-500/30',
};

export default function CareerCoach() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewAPI.getCareer(id)
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load career recommendations'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Generating your career roadmap...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const rColor = readinessColor[data.job_readiness] || readinessColor['Needs Improvement'];

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
              <Target className="w-4 h-4" /> AI Career Coach
            </div>
            <h1 className="text-4xl font-black text-white mb-3">Your Career Roadmap</h1>
            <p className="text-slate-400">Personalized recommendations based on your interview performance</p>
          </div>

          {/* Hero card */}
          <div className="bg-gradient-to-br from-emerald-900/30 to-blue-900/30 border border-white/10 rounded-3xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0">
                <Target className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="text-slate-400 text-sm mb-1">Recommended Role</div>
                <h2 className="text-3xl font-black text-white mb-3">{data.recommended_role}</h2>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className={`px-4 py-2 rounded-full border text-sm font-bold ${rColor}`}>
                    {data.job_readiness}
                  </span>
                  {data.readiness_percentage && (
                    <span className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white text-sm font-bold">
                      {data.readiness_percentage}% Ready
                    </span>
                  )}
                  {data.salary_range && (
                    <span className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white text-sm font-bold flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> {data.salary_range}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {data.readiness_percentage && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>Job Readiness</span>
                  <span className="text-white font-bold">{data.readiness_percentage}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.readiness_percentage}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          {data.message && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-300 leading-relaxed italic">"{data.message}"</p>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Career Path */}
            {data.career_path?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Map className="w-5 h-5 text-violet-400" /> Career Path
                </h3>
                <div className="space-y-3">
                  {data.career_path.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-400'
                        }`}>{i + 1}</div>
                        {i < data.career_path.length - 1 && <div className="w-px h-6 bg-white/10 my-1" />}
                      </div>
                      <p className="text-slate-300 text-sm pt-1.5">{step}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Skills */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" /> Skills Assessment
              </h3>
              {data.strong_skills?.length > 0 && (
                <div className="mb-4">
                  <div className="text-emerald-400 text-xs font-semibold mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Strong Skills
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.strong_skills.map((s) => (
                      <span key={s} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {data.missing_skills?.length > 0 && (
                <div>
                  <div className="text-red-400 text-xs font-semibold mb-2 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Skills to Develop
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.missing_skills.map((s) => (
                      <span key={s} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Recommended Courses */}
          {data.recommended_courses?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" /> Recommended Courses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.recommended_courses.map((course, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 * i }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-amber-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-semibold text-white text-sm">{course.course}</div>
                      <span className="text-amber-400 text-xs bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">{course.platform}</span>
                    </div>
                    {course.reason && <p className="text-slate-400 text-xs">{course.reason}</p>}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Link to="/interview/setup"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              <Zap className="w-5 h-5" /> Practice Again
            </Link>
            <Link to="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              <ArrowRight className="w-5 h-5" /> Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
