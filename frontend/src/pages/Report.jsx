import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Download, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle,
  ArrowRight, Brain, BarChart3, Target, TrendingUp, BookOpen, Home
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';

const readinessConfig = {
  Excellent: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', emoji: '🏆' },
  Ready: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', emoji: '✅' },
  'Needs Improvement': { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', emoji: '📈' },
  Beginner: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', emoji: '🌱' },
};

function ScoreRing({ score, size = 120 }) {
  const r = 45;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="url(#grad)" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - pct) }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function QACard({ qa, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
    >
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 text-sm font-bold flex items-center justify-center flex-shrink-0">
            Q{index + 1}
          </span>
          <span className="text-white text-sm font-medium truncate">{qa.question}</span>
        </div>
        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          {qa.evaluation && (
            <span className={`text-sm font-bold ${qa.evaluation.overall_score >= 70 ? 'text-emerald-400' : qa.evaluation.overall_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {qa.evaluation.overall_score?.toFixed(0)}/100
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">
              <div>
                <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Your Answer</div>
                <p className="text-slate-300 text-sm leading-relaxed bg-white/5 rounded-xl p-3">{qa.answer || 'No answer provided'}</p>
              </div>

              {qa.evaluation && (
                <>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { l: 'Technical', v: qa.evaluation.technical_accuracy, c: 'bg-blue-500' },
                      { l: 'Clarity', v: qa.evaluation.concept_clarity, c: 'bg-violet-500' },
                      { l: 'Depth', v: qa.evaluation.depth, c: 'bg-cyan-500' },
                      { l: 'Comm.', v: qa.evaluation.communication, c: 'bg-emerald-500' },
                      { l: 'Problem', v: qa.evaluation.problem_solving, c: 'bg-amber-500' },
                    ].map((s) => (
                      <div key={s.l} className="text-center bg-white/5 rounded-xl p-2">
                        <div className="text-xs text-slate-500 mb-1">{s.l}</div>
                        <div className="text-white font-bold text-sm">{s.v}/10</div>
                        <div className="h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full ${s.c} rounded-full`} style={{ width: `${s.v * 10}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {qa.evaluation.feedback && (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                      <div className="text-blue-400 text-xs font-semibold mb-1">AI Feedback</div>
                      <p className="text-slate-300 text-sm">{qa.evaluation.feedback}</p>
                    </div>
                  )}

                  {qa.evaluation.ideal_answer && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                      <div className="text-emerald-400 text-xs font-semibold mb-1">💡 Ideal Answer</div>
                      <p className="text-slate-300 text-sm">{qa.evaluation.ideal_answer}</p>
                    </div>
                  )}

                  {qa.evaluation.improvements?.length > 0 && (
                    <div>
                      <div className="text-xs text-slate-500 font-semibold mb-2">Improvements</div>
                      <ul className="space-y-1">
                        {qa.evaluation.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <ArrowRight className="w-3 h-3 text-amber-400 mt-1 flex-shrink-0" />
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewAPI.getReport(id).then((res) => {
      setReport(res.data);
    }).catch(() => toast.error('Failed to load report')).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Generating your report...</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const { scores, interview, candidate, ai_summary, questions_answers, skill_gap } = report;
  const rConfig = readinessConfig[scores.readiness] || readinessConfig['Beginner'];
  const pdfUrl = interviewAPI.getPdfUrl(id);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

        {/* Hero Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-900/30 to-violet-900/30 border border-white/10 rounded-3xl p-8 mb-8 text-center"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="relative">
              <ScoreRing score={scores.overall} size={160} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">{scores.overall?.toFixed(0)}</span>
                <span className="text-slate-400 text-sm">/100</span>
              </div>
            </div>
            <div className="text-left">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold mb-3 ${rConfig.bg} ${rConfig.color}`}>
                {rConfig.emoji} {scores.readiness}
              </div>
              <h1 className="text-3xl font-black text-white mb-2">Interview Report</h1>
              <p className="text-slate-400">{candidate.name} • {interview.role}</p>
              <p className="text-slate-500 text-sm">{interview.experience} • {interview.difficulty} • {new Date(interview.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Score cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Technical Score', value: scores.technical, max: 10, color: 'text-blue-400', icon: Brain },
            { label: 'Communication', value: scores.communication, max: 10, color: 'text-violet-400', icon: Target },
            { label: 'Problem Solving', value: scores.problem_solving, max: 10, color: 'text-emerald-400', icon: TrendingUp },
          ].map((card) => (
            <motion.div key={card.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center"
            >
              <card.icon className={`w-6 h-6 ${card.color} mx-auto mb-2`} />
              <div className={`text-2xl font-black ${card.color}`}>{card.value?.toFixed(1)}<span className="text-slate-500 text-sm">/{card.max}</span></div>
              <div className="text-slate-400 text-xs mt-1">{card.label}</div>
            </motion.div>
          ))}
        </div>

        {/* AI Summary */}
        {ai_summary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold text-white">AI Assessment Summary</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">{ai_summary}</p>
          </motion.div>
        )}

        {/* Skill Gap */}
        {skill_gap && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" /> Skill Gap Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-emerald-400 text-sm font-semibold mb-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Strong Areas
                </div>
                <div className="flex flex-wrap gap-2">
                  {(skill_gap.strong_areas || []).map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Weak Areas
                </div>
                <div className="flex flex-wrap gap-2">
                  {(skill_gap.weak_areas || []).map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-red-400 text-sm font-semibold mb-2 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Missing Skills
                </div>
                <div className="flex flex-wrap gap-2">
                  {(skill_gap.missing_skills || []).map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Q&A Accordion */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" /> Questions & Answers
          </h2>
          <div className="space-y-3">
            {questions_answers.map((qa, i) => <QACard key={i} qa={qa} index={i} />)}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a href={`${pdfUrl}?token=${localStorage.getItem('token')}`}
            onClick={(e) => {
              e.preventDefault();
              const token = localStorage.getItem('token');
              fetch(`http://localhost:8000/interviews/${id}/pdf`, { headers: { Authorization: `Bearer ${token}` } })
                .then((r) => r.blob())
                .then((blob) => {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = `interview_report_${id}.pdf`; a.click();
                });
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            <Download className="w-5 h-5" /> Download PDF Report
          </a>
          <Link to={`/career/${id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
          >
            <BookOpen className="w-5 h-5" /> Career Recommendations
          </Link>
          <Link to="/dashboard"
            className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-slate-400 px-6 py-3 rounded-xl font-semibold hover:text-white hover:bg-white/10 transition-colors"
          >
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
