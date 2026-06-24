import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Send, SkipForward, ChevronRight, Mic, MicOff, CheckCircle, AlertCircle, Trophy } from 'lucide-react';
import Navbar from '../components/Navbar';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';

const ScoreBar = ({ label, value, max = 10, color }) => (
  <div>
    <div className="flex justify-between text-xs text-slate-400 mb-1">
      <span>{label}</span><span className="text-white font-bold">{value}/{max}</span>
    </div>
    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`h-full ${color} rounded-full`}
      />
    </div>
  </div>
);

export default function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state?.data;

  const [questions, setQuestions] = useState(stateData?.questions || []);
  const [role, setRole] = useState(stateData?.role || '');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [answered, setAnswered] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerActive, setTimerActive] = useState(true);
  const [listening, setListening] = useState(false);
  const [interviewDone, setInterviewDone] = useState(false);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load interview if not from state
  useEffect(() => {
    if (!stateData) {
      interviewAPI.get(id).then((res) => {
        setQuestions(res.data.questions);
        setRole(res.data.role);
        const existing = {};
        res.data.questions.forEach((q) => {
          if (q.answer) existing[q.id] = { answered: true, evaluation: q.evaluation };
        });
        setAnswered(existing);
      });
    }
  }, [id]);

  // Timer
  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          toast.error('Time up! Auto-submitting...');
          if (answer.trim()) handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerActive, currentIdx]);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setTimeLeft(120);
    setTimerActive(true);
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Save draft
  useEffect(() => {
    const key = `interview_${id}_q${currentQuestion?.id}`;
    const saved = localStorage.getItem(key);
    if (saved && !answered[currentQuestion?.id]) setAnswer(saved);
    else if (answered[currentQuestion?.id]) setAnswer('');
    setEvaluation(null);
  }, [currentIdx]);

  useEffect(() => {
    if (answer && !answered[currentQuestion?.id]) {
      localStorage.setItem(`interview_${id}_q${currentQuestion?.id}`, answer);
    }
  }, [answer]);

  const currentQuestion = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;
  const allAnswered = questions.every((q) => answered[q.id]);

  const handleSubmit = useCallback(async (auto = false) => {
    const currentAnswer = answer.trim();
    if (!currentAnswer && !auto) { toast.error('Please write your answer first'); return; }
    setSubmitting(true);
    setTimerActive(false);
    clearInterval(timerRef.current);
    try {
      const res = await interviewAPI.submitAnswer(id, {
        question_id: currentQuestion.id,
        answer_text: currentAnswer || 'No answer provided',
      });
      setEvaluation(res.data.evaluation);
      setAnswered((prev) => ({ ...prev, [currentQuestion.id]: true }));
      localStorage.removeItem(`interview_${id}_q${currentQuestion.id}`);
      toast.success('Answer submitted! ✅');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }, [answer, currentQuestion, id]);

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setAnswer('');
      setEvaluation(null);
      resetTimer();
    }
  };

  const handleSkip = () => {
    toast('Question skipped', { icon: '⏭️' });
    setAnswered((prev) => ({ ...prev, [currentQuestion.id]: 'skipped' }));
    handleNext();
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await interviewAPI.complete(id);
      toast.success('Interview completed! 🎉');
      navigate(`/report/${id}`);
    } catch (e) {
      toast.error('Failed to complete interview');
    } finally {
      setCompleting(false);
    }
  };

  // Speech to text
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join('');
      setAnswer(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
    toast.success('Listening... speak your answer');
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pt-4">
          <div>
            <h2 className="text-lg font-bold text-white">{role}</h2>
            <p className="text-slate-400 text-sm">Question {currentIdx + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg ${
              timeLeft <= 30 ? 'border-red-500/40 bg-red-500/10 text-red-400' : 'border-white/10 bg-white/5 text-white'
            }`}>
              <Timer className="w-5 h-5" />
              {fmtTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
          <motion.div
            animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-blue-600 to-violet-600 rounded-full"
          />
        </div>

        {/* Question dots */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {questions.map((q, i) => (
            <button key={q.id} onClick={() => { setCurrentIdx(i); setAnswer(''); setEvaluation(null); resetTimer(); }}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                i === currentIdx ? 'bg-blue-600 text-white scale-110' :
                answered[q.id] === 'skipped' ? 'bg-slate-700 text-slate-400' :
                answered[q.id] ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-400 hover:bg-white/20'
              }`}
            >{i + 1}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div key={currentIdx}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-bold flex items-center justify-center">Q{currentIdx + 1}</span>
                <span className="text-slate-400 text-sm">Interview Question</span>
              </div>
              <p className="text-white text-lg leading-relaxed font-medium">{currentQuestion?.question_text}</p>

              {evaluation && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">AI Evaluation</span>
                    <span className="ml-auto text-2xl font-black text-white">{evaluation.overall_score?.toFixed(0)}<span className="text-slate-500 text-sm">/100</span></span>
                  </div>
                  <div className="space-y-3">
                    <ScoreBar label="Technical Accuracy" value={evaluation.technical_accuracy} color="bg-blue-500" />
                    <ScoreBar label="Concept Clarity" value={evaluation.concept_clarity} color="bg-violet-500" />
                    <ScoreBar label="Depth of Knowledge" value={evaluation.depth} color="bg-cyan-500" />
                    <ScoreBar label="Communication" value={evaluation.communication} color="bg-emerald-500" />
                    <ScoreBar label="Problem Solving" value={evaluation.problem_solving} color="bg-amber-500" />
                  </div>
                  {evaluation.feedback && (
                    <p className="mt-4 text-sm text-slate-300 bg-white/5 rounded-xl p-3">{evaluation.feedback}</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Answer */}
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm">Your Answer</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">{answer.length} chars</span>
                  <button onClick={toggleVoice}
                    className={`p-2 rounded-lg transition-all ${listening ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'}`}
                  >
                    {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here... Be detailed and clear. Include examples where possible."
                disabled={answered[currentQuestion?.id] && answered[currentQuestion?.id] !== 'skipped'}
                className="w-full h-48 bg-transparent text-white placeholder-slate-600 resize-none focus:outline-none text-sm leading-relaxed disabled:opacity-60"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              {answered[currentQuestion?.id] && answered[currentQuestion?.id] !== 'skipped' ? (
                isLastQuestion ? (
                  allAnswered ? (
                    <motion.button onClick={handleComplete} disabled={completing}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50"
                    >
                      {completing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Trophy className="w-5 h-5" /> Complete Interview</>}
                    </motion.button>
                  ) : (
                    <button onClick={handleNext} className="flex items-center justify-center gap-2 bg-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors">
                      <ChevronRight className="w-5 h-5" /> Next Question
                    </button>
                  )
                ) : (
                  <button onClick={handleNext} className="flex items-center justify-center gap-2 bg-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors">
                    <ChevronRight className="w-5 h-5" /> Next Question
                  </button>
                )
              ) : (
                <>
                  <motion.button onClick={() => handleSubmit(false)} disabled={submitting || !answer.trim()}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-40 transition-all"
                  >
                    {submitting ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Evaluating with AI...</> : <><Send className="w-5 h-5" />Submit Answer</>}
                  </motion.button>
                  <button onClick={handleSkip} className="flex items-center justify-center gap-2 text-slate-400 hover:text-white py-2 transition-colors text-sm">
                    <SkipForward className="w-4 h-4" /> Skip Question
                  </button>
                </>
              )}
              {isLastQuestion && answered[currentQuestion?.id] && (
                <motion.button onClick={handleComplete} disabled={completing}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold disabled:opacity-50"
                >
                  {completing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Trophy className="w-5 h-5" /> Complete & Get Report</>}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
