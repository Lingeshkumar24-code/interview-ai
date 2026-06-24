import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Zap, CheckCircle, X, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { resumeAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = (f) => {
    if (!f || !f.name.endsWith('.pdf')) { toast.error('Please upload a PDF file'); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error('File too large (max 10MB)'); return; }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please upload your resume first'); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('question_count', '10');
    try {
      const res = await resumeAPI.analyze(fd);
      setResult(res.data);
      toast.success('Resume analyzed! Questions generated 🎯');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
              <FileText className="w-4 h-4" /> AI Resume Analyzer
            </div>
            <h1 className="text-4xl font-black text-white mb-3">Resume-Based Interview</h1>
            <p className="text-slate-400">Upload your resume and get personalized interview questions based on your actual experience</p>
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all mb-6 ${
              dragging ? 'border-violet-500 bg-violet-500/10 scale-[1.02]' :
              file ? 'border-emerald-500/50 bg-emerald-500/5' :
              'border-white/20 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/5'
            }`}
          >
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            <AnimatePresence mode="wait">
              {file ? (
                <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-white font-semibold text-lg">{file.name}</p>
                  <p className="text-slate-400 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB • PDF</p>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                    className="mt-3 text-slate-400 hover:text-red-400 transition-colors text-sm flex items-center gap-1 mx-auto"
                  >
                    <X className="w-4 h-4" /> Remove file
                  </button>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-white font-semibold text-lg">Drop your resume here</p>
                  <p className="text-slate-400 mt-1">or <span className="text-violet-400">click to browse</span></p>
                  <p className="text-slate-500 text-sm mt-3">PDF only • Max 10MB</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Analyze button */}
          {!result && (
            <motion.button
              onClick={handleAnalyze}
              disabled={!file || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl disabled:opacity-40 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Resume with AI...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Analyze Resume & Generate Questions
                </>
              )}
            </motion.button>
          )}

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {result.resume_preview && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                    <h3 className="text-sm font-semibold text-slate-400 mb-2">Resume Preview</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{result.resume_preview}</p>
                  </div>
                )}

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    {result.questions.length} Questions Generated
                  </h3>
                  <div className="space-y-3">
                    {result.questions.map((q, i) => (
                      <motion.div key={q.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex gap-3 p-3 bg-white/5 rounded-xl"
                      >
                        <span className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-slate-300 text-sm">{q.question_text}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.button
                  onClick={() => navigate(`/interview/${result.interview_id}`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all"
                >
                  <Zap className="w-5 h-5" />
                  Start Resume-Based Interview
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
