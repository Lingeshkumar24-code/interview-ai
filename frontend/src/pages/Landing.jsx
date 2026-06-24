import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, Zap, BarChart3, FileText, Target, Star,
  ArrowRight, Play, CheckCircle, Users, TrendingUp, Award,
  ChevronRight, Github, Twitter, Linkedin, Shield, Clock, Cpu
} from 'lucide-react';
import Navbar from '../components/Navbar';

function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

const features = [
  { icon: Brain, title: 'AI Interview Simulation', desc: 'Experience realistic mock interviews powered by Llama 3.3 70B AI that adapts to your role and experience level.', color: 'from-blue-500 to-cyan-500' },
  { icon: Zap, title: 'Instant Feedback', desc: 'Get detailed evaluations across 5 dimensions within seconds of submitting your answer.', color: 'from-violet-500 to-purple-500' },
  { icon: Target, title: 'Skill Gap Analysis', desc: 'Identify exactly what skills you need to develop and get tailored learning recommendations.', color: 'from-cyan-500 to-teal-500' },
  { icon: FileText, title: 'Resume-Based Interviews', desc: 'Upload your resume and get personalized questions based on your actual experience and projects.', color: 'from-emerald-500 to-green-500' },
  { icon: BarChart3, title: 'Performance Analytics', desc: 'Track your progress over time with beautiful charts and detailed performance metrics.', color: 'from-orange-500 to-amber-500' },
  { icon: Award, title: 'Career Recommendations', desc: 'Receive AI-powered career path suggestions and salary insights based on your performance.', color: 'from-pink-500 to-rose-500' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Data Scientist at Amazon', avatar: 'PS', text: 'InterviewIQ helped me crack my Amazon interview! The AI feedback was incredibly detailed and the skill gap analysis showed me exactly what to study.' },
  { name: 'Rahul Mehta', role: 'Full Stack Dev at Google', avatar: 'RM', text: 'I practiced 20+ interviews on this platform. The Groq AI evaluations are amazingly accurate — better than any mock interview I had with humans!' },
  { name: 'Sneha Patel', role: 'ML Engineer at Microsoft', avatar: 'SP', text: 'The resume-based interview feature is brilliant. It asked me about my exact projects and technologies. Felt like a real technical interview!' },
];

const stats = [
  { value: 50000, label: 'Interviews Conducted', suffix: '+', icon: Users },
  { value: 200000, label: 'Questions Generated', suffix: '+', icon: Brain },
  { value: 89, label: 'Success Rate', suffix: '%', icon: TrendingUp },
  { value: 10000, label: 'Happy Users', suffix: '+', icon: Award },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          {/* Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              Powered by Groq AI + Llama 3.3 70B
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              Crack Your
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Dream Job
              </span>
              With AI
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Practice interviews, receive instant AI feedback, and improve your confidence.
              Get hired faster with personalized coaching from Llama 3.3 70B.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-blue-600/30 transition-shadow"
                >
                  <Zap className="w-5 h-5" />
                  Start Interview Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a
                  href="#features"
                  className="inline-flex items-center gap-3 bg-white/5 backdrop-blur border border-white/10 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-white/10 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </a>
              </motion.div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-slate-500 text-sm">
              {['No credit card required', 'Free to get started', 'AI-powered evaluation'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Floating cards preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
          >
            {[
              { label: 'Overall Score', value: '87/100', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { label: 'Technical Accuracy', value: '9/10', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
              { label: 'Interview Readiness', value: 'Ready ✓', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
                className={`${card.bg} border rounded-2xl p-4 backdrop-blur`}
              >
                <div className="text-slate-400 text-sm mb-1">{card.label}</div>
                <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-black text-white mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Get Hired
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Our AI-powered platform gives you all the tools to ace any technical interview.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all hover:shadow-2xl"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white/2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Loved by{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                10,000+ Developers
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-slate-400 text-sm">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Ready to Ace Your
              <span className="block bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Next Interview?
              </span>
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Join thousands of developers who landed their dream jobs with InterviewIQ AI.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:shadow-2xl hover:shadow-blue-600/30 transition-shadow"
              >
                <Zap className="w-6 h-6" />
                Start For Free Today
                <ArrowRight className="w-6 h-6" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                InterviewIQ AI
              </span>
            </div>
            <div className="flex gap-6 text-slate-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            </div>
            <div className="text-slate-500 text-sm">
              © 2024 InterviewIQ AI. MCA GenAI Project.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
