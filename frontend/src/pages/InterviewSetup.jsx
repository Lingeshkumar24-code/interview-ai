import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, User, Briefcase, BarChart3, Hash } from 'lucide-react';
import Navbar from '../components/Navbar';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';

const ROLES = [
  'Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'AI Engineer',
  'Python Developer', 'Java Developer', 'Full Stack Developer', 'Backend Developer',
  'Frontend Developer', 'Cloud Engineer', 'DevOps Engineer', 'Cyber Security Analyst',
];

const EXPERIENCE = [
  { value: 'Fresher', label: 'Fresher', desc: '0 – 6 months', emoji: '🌱' },
  { value: '1-2 Years', label: '1-2 Years', desc: 'Junior level', emoji: '💡' },
  { value: '3-5 Years', label: '3-5 Years', desc: 'Mid level', emoji: '🚀' },
  { value: '5+ Years', label: '5+ Years', desc: 'Senior level', emoji: '⭐' },
];

const DIFFICULTY = [
  { value: 'Easy', label: 'Easy', desc: 'Fundamentals & basics', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
  { value: 'Medium', label: 'Medium', desc: 'Real-world scenarios', color: 'border-amber-500 bg-amber-500/10 text-amber-400' },
  { value: 'Hard', label: 'Hard', desc: 'Expert-level questions', color: 'border-red-500 bg-red-500/10 text-red-400' },
];

const COUNTS = [5, 10, 15];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: '', experience: '', difficulty: '', question_count: 5,
  });
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!form.role) { toast.error('Please select a job role'); return; }
    if (!form.experience) { toast.error('Please select experience level'); return; }
    if (!form.difficulty) { toast.error('Please select difficulty'); return; }
    setLoading(true);
    try {
      const res = await interviewAPI.create(form);
      toast.success('Questions generated! 🎯');
      navigate(`/interview/${res.data.interview_id}`, { state: { data: res.data } });
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to generate questions. Check API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" /> AI Interview Setup
            </div>
            <h1 className="text-4xl font-black text-white mb-3">Configure Your Interview</h1>
            <p className="text-slate-400">Customize your AI interview experience for the best results</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
            {/* Role */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                <Briefcase className="w-4 h-4 text-blue-400" /> Job Role *
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              >
                <option value="">Select a job role...</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                <User className="w-4 h-4 text-violet-400" /> Experience Level *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {EXPERIENCE.map((exp) => (
                  <button key={exp.value} onClick={() => setForm({ ...form, experience: exp.value })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      form.experience === exp.value
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-1">{exp.emoji}</div>
                    <div className="font-semibold text-sm">{exp.label}</div>
                    <div className="text-xs opacity-70">{exp.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                <BarChart3 className="w-4 h-4 text-cyan-400" /> Difficulty *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {DIFFICULTY.map((d) => (
                  <button key={d.value} onClick={() => setForm({ ...form, difficulty: d.value })}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      form.difficulty === d.value ? d.color : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold">{d.label}</div>
                    <div className="text-xs mt-1 opacity-80">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                <Hash className="w-4 h-4 text-emerald-400" /> Number of Questions
              </label>
              <div className="flex gap-3">
                {COUNTS.map((c) => (
                  <button key={c} onClick={() => setForm({ ...form, question_count: c })}
                    className={`flex-1 py-3 rounded-xl border font-bold transition-all ${
                      form.question_count === c
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {c} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            {form.role && form.experience && form.difficulty && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4"
              >
                <div className="text-blue-400 font-semibold text-sm mb-2">Interview Summary</div>
                <div className="text-slate-300 text-sm">
                  <span className="font-medium text-white">{form.question_count} questions</span> for{' '}
                  <span className="font-medium text-white">{form.role}</span> —{' '}
                  <span className="font-medium text-white">{form.experience}</span> experience,{' '}
                  <span className="font-medium text-white">{form.difficulty}</span> difficulty
                </div>
              </motion.div>
            )}

            <motion.button
              onClick={handleGenerate}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Questions with AI...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Interview
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
