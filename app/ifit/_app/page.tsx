'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Activity, Dumbbell, Users, Star, ArrowRight, ChevronRight,
  Check, Zap, Target, TrendingUp, Shield, Clock, Award,
  Heart, Brain, Utensils, Flame, Play, User, Menu, X,
  ArrowLeft, MessageSquare, BarChart2, Lock, ChevronDown, Moon,
  LucideIcon
} from 'lucide-react';
import Link from 'next/link';
import { useBrandSettings, BrandSettingsProvider } from '@igroup/shared';

// ─── Data ─────────────────────────────────────────────────────────────────────

const trainers = [
  { id: 'ahmed', name: 'Ahmed Al-Rashid', specialty: 'Strength & Conditioning', image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=600', clients: 140 },
  { id: 'sara', name: 'Sara Mansour', specialty: 'Functional Mobility', image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=600', clients: 95 },
  { id: 'omar', name: 'Omar Khader', specialty: 'Athletic Performance', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600', clients: 110 },
  { id: 'leila', name: 'Leila Qabbani', specialty: 'Pre/Post Natal Fitness', image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=600', clients: 85 },
];

const successStories = [
  { name: 'Khaled J.', result: '-22kg in 6 months', quote: 'The real-time recovery data changed how I train. No more burnout.', image: 'https://images.unsplash.com/photo-1552072805-2a9039d00e57?q=80&w=600' },
  { name: 'Noor S.', result: 'Elite Half-Marathon Time', quote: 'My coach adjusted my long runs based on my sleep quality. It works.', image: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=600' },
  { name: 'Zaid M.', result: 'Built 8kg Lean Muscle', quote: 'Clean nutrition and precise volume tracking. Best shape of my life.', image: 'https://images.unsplash.com/photo-1491756025181-5873ee2cae9d?q=80&w=600' },
];

const goals = [
  { id: 'fat-loss', title: 'Metabolic Reset', desc: 'Optimized for fat loss while maintaining muscle mass.', icon: Flame, color: '#F97316' },
  { id: 'muscle', title: 'Hypertrophy Pro', desc: 'Progressive overload tracking for maximum growth.', icon: Target, color: '#EF4444' },
  { id: 'performance', title: 'Athletic Peak', desc: 'Power, speed, and agility for competitive athletes.', icon: Zap, color: '#EAB308' },
];

const supplements: { name: string; items: string; color: string; timing: string; icon: LucideIcon }[] = [
  { name: 'Pre-Workout Pro', items: 'Caffeine, Beta-Alanine, Citrulline', color: '#F97316', timing: '30m Before', icon: Zap },
  { name: 'Recovery ISO', items: 'Whey Isolate, L-Glutamine', color: '#3B82F6', timing: 'After Session', icon: Heart },
  { name: 'Daily Essential', items: 'Omega-3, Multi-V, Vitamin D', color: '#10B981', timing: 'With Breakfast', icon: Shield },
  { name: 'Sleep Support', items: 'Magnesium, Ashwagandha', color: '#818CF8', timing: 'Before Bed', icon: Moon },
];

// ─── UI Components ────────────────────────────────────────────────────────────

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-black tracking-tighter text-white">{value}</span>
      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function TrainerCard({ trainer, index }: { trainer: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative rounded-3xl overflow-hidden bg-[#121418] border border-white/[0.05] hover:border-orange-500/30 transition-all"
    >
      <div className="aspect-[4/5] overflow-hidden">
        <img src={trainer.image} alt={trainer.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
      </div>
      <div className="p-5">
        <h3 className="font-black text-sm uppercase tracking-tight">{trainer.name}</h3>
        <p className="text-xs text-white/40 mt-1">{trainer.specialty}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded-lg uppercase tracking-wider">{trainer.clients} Active Clients</span>
          <ArrowRight size={14} className="text-white/20 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </motion.div>
  );
}

function SuccessCard({ story, index }: { story: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#121418] rounded-3xl p-6 border border-white/[0.05]"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full overflow-hidden border border-orange-500/20">
          <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="font-black text-sm">{story.name}</h4>
          <p className="text-xs text-orange-400 font-bold">{story.result}</p>
        </div>
      </div>
      <p className="text-sm text-white/60 leading-relaxed italic">"{story.quote}"</p>
    </motion.div>
  );
}

function GoalCard({ goal, index }: { goal: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="p-8 rounded-[32px] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all cursor-pointer group"
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${goal.color}15` }}>
        <goal.icon size={24} style={{ color: goal.color }} />
      </div>
      <h3 className="text-xl font-black tracking-tight mb-2">{goal.title}</h3>
      <p className="text-sm text-white/40 leading-relaxed mb-6">{goal.desc}</p>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">
        Learn program <ChevronRight size={12} />
      </div>
    </motion.div>
  );
}

function IFitFooter() {
  const { socialLinks } = useBrandSettings();
  return (
    <footer className="border-t border-white/[0.06] py-8 px-6 mt-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Dumbbell size={14} className="text-orange-400" />
            </div>
            <span className="text-sm font-black">i <span className="text-orange-400">fit</span></span>
            <span className="text-white/20 text-sm">— part of</span>
            <Link href="/" className="text-sm font-bold text-[#D4AF37] hover:text-[#FFD700] transition-colors">i Group</Link>
          </div>
          <div className="flex gap-4">
            {socialLinks.map(link => (
              <a key={link.key} href={link.url} target="_blank" rel="noreferrer" className="text-white/20 hover:text-white transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-widest">{link.label}</span>
              </a>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/20">© 2026 i Group. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IFitPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState('fat-loss');
  const [specialistTab, setSpecialistTab] = useState<'trainer' | 'nutritionist' | 'physio'>('trainer');

  return (
    <BrandSettingsProvider>
      <div className="min-h-screen bg-[#080A0C] text-white overflow-x-hidden">

        {/* ── Header ── */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#080A0C]/80 backdrop-blur-2xl border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                <ArrowLeft size={16} />
                <span className="text-xs tracking-widest font-bold uppercase">i Group</span>
              </Link>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Dumbbell size={14} className="text-orange-400" />
                </div>
                <span className="text-sm font-black tracking-tight">i <span className="text-orange-400">fit</span></span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: 'Programs', href: '#goals' },
                { label: 'Trainers', href: '#trainers' },
                { label: 'Results', href: '#results' },
                { label: 'Join as Specialist', href: '#specialist' },
              ].map((item) => (
                <a key={item.label} href={item.href}
                  className="text-xs font-bold tracking-widest uppercase text-white/40 hover:text-white transition-colors"
                >{item.label}</a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/ibio">
                <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1.5 hover:bg-cyan-500/15 transition-colors cursor-pointer">
                  <Activity size={13} className="text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-400">i bio: 78%</span>
                </div>
              </Link>
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden">
                <Menu size={22} />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#080A0C] z-50 p-6">
              <div className="flex justify-between items-center mb-10">
                <span className="font-black text-lg">i <span className="text-orange-400">fit</span></span>
                <button onClick={() => setMobileMenuOpen(false)}><X size={24} /></button>
              </div>
              {['Programs', 'Trainers', 'Results', 'Specialists'].map((t) => (
                <a key={t} href={`#${t.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)}
                  className="block text-2xl font-black py-4 border-b border-white/[0.06] hover:text-orange-400 transition-colors"
                >{t}</a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-16">

          {/* ── Hero ── */}
          <section className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920"
                alt=""
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080A0C] via-[#080A0C]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080A0C] via-transparent to-transparent" />
            </div>

            {/* Bio integration badge */}
            <motion.div
              className="absolute top-24 right-6 md:right-12 bg-[#080A0C]/90 border border-cyan-500/30 rounded-2xl p-4 max-w-xs backdrop-blur-xl"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase">Live i bio Sync</span>
              </div>
              <p className="text-sm font-black">Recovery: <span className="text-cyan-400">78%</span></p>
              <p className="text-xs text-white/50 mt-1">Today's load: <span className="text-orange-400 font-bold">Moderate–High intensity</span></p>
              <p className="text-[10px] text-white/30 mt-2">Trainer Ahmed adjusted your session based on HRV: 58ms</p>
            </motion.div>

            <div className="relative max-w-7xl mx-auto px-6 py-24">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <p className="text-xs font-black tracking-[0.3em] text-orange-400/80 uppercase mb-4">i Group · Smart Training Platform</p>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                  TRANSFORM.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">DOMINATE.</span>
                </h1>
                <p className="text-white/50 mt-6 text-lg max-w-xl leading-relaxed">
                  The world's first training platform that reads your body before building your workout. Coach + Biometrics + AI = results that last.
                </p>

                <div className="flex flex-wrap gap-4 mt-10">
                  <motion.a href="#goals"
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-black font-black uppercase tracking-widest rounded-full flex items-center gap-2 shadow-2xl"
                    whileHover={{ scale: 1.04, boxShadow: '0 20px 60px rgba(249,115,22,0.35)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    START YOUR PROGRAM <ArrowRight size={18} />
                  </motion.a>
                  <motion.a href="#trainers"
                    className="px-8 py-4 border border-white/20 text-white font-black uppercase tracking-widest rounded-full flex items-center gap-2 hover:border-white/40 transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    MEET YOUR COACH
                  </motion.a>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-10 border-t border-white/[0.07]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              >
                <StatBadge value="1,200+" label="Active clients" />
                <StatBadge value="48" label="Expert coaches" />
                <StatBadge value="93%" label="Goal achievement" />
                <StatBadge value="4.96★" label="Avg trainer rating" />
              </motion.div>
            </div>
          </section>

          {/* ── Bio Bridge Feature ── */}
          <section className="py-20 px-6 bg-gradient-to-b from-cyan-500/5 to-transparent">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                  <p className="text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase mb-3">Exclusive to i Group</p>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                    Your body data<br /><span className="text-cyan-400">trains your coach.</span>
                  </h2>
                  <p className="text-white/50 mt-5 leading-relaxed">
                    Every night while you sleep, your i bio wearable measures your HRV, resting heart rate, and sleep stages. Every morning, your i fit trainer sees this data — and adjusts your session before you wake up.
                  </p>
                  <div className="mt-8 space-y-4">
                    {[
                      { icon: Moon, text: 'Poor sleep detected → mobility & recovery session loaded', color: '#818CF8' },
                      { icon: TrendingUp, text: 'HRV peak detected → high-intensity PR attempt day', color: '#22D3EE' },
                      { icon: Shield, text: 'Overtraining risk detected → mandatory rest enforced', color: '#F97316' },
                    ].map(item => (
                      <div key={item.text} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${item.color}18` }}>
                          <item.icon size={15} style={{ color: item.color }} />
                        </div>
                        <p className="text-sm text-white/60">{item.text}</p>
                      </div>
                    ))}
                  </div>
                  <Link href="/ibio">
                    <motion.button
                      className="mt-8 flex items-center gap-2 text-cyan-400 font-bold text-sm hover:gap-3 transition-all"
                      whileHover={{ x: 4 }}
                    >
                      Explore i bio dashboard <ArrowRight size={15} />
                    </motion.button>
                  </Link>
                </motion.div>

                {/* Bio card visual */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                >
                  <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">Today · Coach View</span>
                      <span className="text-[10px] text-white/30">Ahmed Al-Rashid</span>
                    </div>
                    {[
                      { label: 'Recovery Score', value: '78%', bar: 78, color: '#22D3EE' },
                      { label: 'HRV', value: '58 ms', bar: 68, color: '#818CF8' },
                      { label: 'Sleep Quality', value: '82%', bar: 82, color: '#34D399' },
                      { label: 'Resting HR', value: '52 bpm', bar: 55, color: '#F87171' },
                    ].map(m => (
                      <div key={m.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-white/50">{m.label}</span>
                          <span className="font-bold text-white">{m.value}</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: m.color, boxShadow: `0 0 8px ${m.color}66` }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${m.bar}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-400" />
                        <p className="text-xs text-white/50">Coach recommendation: <span className="text-orange-400 font-bold">Moderate intensity — Upper body focus</span></p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── Goal Programs ── */}
          <section id="goals" className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p className="text-xs font-bold tracking-[0.25em] text-orange-400/70 uppercase mb-3">Choose Your Path</p>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
                  Programs built<br /><span className="text-orange-400">for your goal.</span>
                </h2>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-5">
                {goals.map((goal, i) => <GoalCard key={goal.id} goal={goal} index={i} />)}
              </div>
            </div>
          </section>

          {/* ── Trainers ── */}
          <section id="trainers" className="py-20 px-6 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
            <div className="max-w-7xl mx-auto">
              <motion.div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div>
                  <p className="text-xs font-bold tracking-[0.25em] text-orange-400/70 uppercase mb-3">Expert Coaches</p>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                    Your coach.<br /><span className="text-orange-400">Your results.</span>
                  </h2>
                </div>
                <p className="text-sm text-white/40 max-w-sm">All coaches are certified, background-checked, and have i bio data access enabled for real-time session adjustments.</p>
              </motion.div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {trainers.map((t, i) => <TrainerCard key={t.id} trainer={t} index={i} />)}
              </div>
            </div>
          </section>

          {/* ── Success Stories ── */}
          <section id="results" className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p className="text-xs font-bold tracking-[0.25em] text-orange-400/70 uppercase mb-3">Real Results</p>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
                  Numbers don't<br /><span className="text-orange-400">lie.</span>
                </h2>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-6">
                {successStories.map((story, i) => (
                  <SuccessCard key={story.name} story={story} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* ── Supplements ── */}
          <section className="py-16 px-6 bg-white/[0.01]">
            <div className="max-w-7xl mx-auto">
              <motion.div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div>
                  <p className="text-xs font-bold tracking-[0.25em] text-orange-400/70 uppercase mb-2">i supplements × i fit</p>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter">
                    Nutrition stacks<br /><span className="text-orange-400">matched to your program.</span>
                  </h2>
                </div>
                <p className="text-sm text-white/40 max-w-xs">Recommended by your nutritionist. Sourced from i supplements.</p>
              </motion.div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {supplements.map((s, i) => (
                  <motion.div key={s.name}
                    className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:border-white/15 transition-all"
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -3 }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${s.color}18` }}>
                      <s.icon size={18} style={{ color: s.color }} />
                    </div>
                    <h3 className="font-black text-sm">{s.name}</h3>
                    <p className="text-xs text-white/40 mt-1">{s.items}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider mt-3" style={{ color: s.color }}>{s.timing}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Specialist Portal ── */}
          <section id="specialist" className="py-20 px-6">
            <div className="max-w-5xl mx-auto">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p className="text-xs font-bold tracking-[0.25em] text-orange-400/70 uppercase mb-3">For Professionals</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                  Join as a <span className="text-orange-400">specialist.</span><br />Build under i fit.
                </h2>
                <p className="text-white/40 mt-4 max-w-xl mx-auto">
                  Work under the i fit brand. Set your own rates. Get clients automatically matched based on goals and location. You earn 75% commission on every session.
                </p>
              </motion.div>

              {/* Specialist Type Tabs */}
              <div className="flex justify-center gap-2 mb-8">
                {[
                  { id: 'trainer', label: 'Personal Trainer', icon: Dumbbell },
                  { id: 'nutritionist', label: 'Nutritionist', icon: Utensils },
                  { id: 'physio', label: 'Physiotherapist', icon: Activity },
                ].map(t => (
                  <button key={t.id} onClick={() => setSpecialistTab(t.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${specialistTab === t.id ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-white/[0.04] text-white/40 hover:text-white border border-white/[0.07]'}`}
                  >
                    <t.icon size={13} />{t.label}
                  </button>
                ))}
              </div>

              <motion.div
                className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-8"
                key={specialistTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid md:grid-cols-2 gap-10">
                  <div>
                    <h3 className="text-xl font-black mb-6">What you get</h3>
                    <div className="space-y-4">
                      {[
                        { icon: Users, text: 'Auto client matching based on your specialty & location', color: '#F97316' },
                        { icon: BarChart2, text: 'Full access to client i bio biometric dashboard', color: '#22D3EE' },
                        { icon: Award, text: '75% revenue share — you keep the majority', color: '#34D399' },
                        { icon: Brain, text: 'AI session builder based on client recovery data', color: '#818CF8' },
                        { icon: MessageSquare, text: 'Built-in messaging, video calls & check-ins', color: '#F97316' },
                        { icon: Shield, text: 'i Group brand protection & liability coverage', color: '#64748B' },
                      ].map(item => (
                        <div key={item.text} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}18` }}>
                            <item.icon size={14} style={{ color: item.color }} />
                          </div>
                          <p className="text-sm text-white/60 mt-1">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black mb-6">Apply now</h3>
                    <div className="space-y-4">
                      {['Full Name', 'Email Address', 'Phone Number', 'Certifications'].map(field => (
                        <div key={field}>
                          <label className="text-[10px] font-bold tracking-widest text-white/30 uppercase block mb-1.5">{field}</label>
                          <input
                            type="text"
                            placeholder={`Enter your ${field.toLowerCase()}`}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-orange-500/40 transition-colors"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="text-[10px] font-bold tracking-widest text-white/30 uppercase block mb-1.5">Years of Experience</label>
                        <select className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/60 focus:outline-none focus:border-orange-500/40 transition-colors">
                          <option>1–2 years</option>
                          <option>3–5 years</option>
                          <option>5–10 years</option>
                          <option>10+ years</option>
                        </select>
                      </div>
                      <motion.button
                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-black font-black uppercase tracking-widest rounded-2xl mt-2"
                        whileHover={{ scale: 1.02, boxShadow: '0 15px 40px rgba(249,115,22,0.3)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Submit Application
                      </motion.button>
                      <p className="text-[10px] text-white/25 text-center">Applications reviewed within 48 hours. 100% free to apply.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ── CTA Band ── */}
          <section className="py-16 px-6">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="relative rounded-3xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/10 to-transparent" />
                <div className="absolute inset-0 border border-orange-500/20 rounded-3xl" />
                <div className="relative px-8 py-12 md:py-16 grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Ready to <span className="text-orange-400">start?</span></h2>
                    <p className="text-white/50 mt-3 max-w-md">Connect your wearable. Pick your goal. Your coach will be ready with a program built around your biology.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button
                      className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-black font-black uppercase tracking-wider rounded-full"
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    >
                      Get Started Free
                    </motion.button>
                    <Link href="/ibio">
                      <motion.button
                        className="px-8 py-4 border border-cyan-500/30 text-cyan-400 font-black uppercase tracking-wider rounded-full flex items-center gap-2 hover:bg-cyan-500/10 transition-colors"
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      >
                        <Activity size={16} /> Connect i bio
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <IFitFooter />
        </div>
      </div>
    </BrandSettingsProvider>
  );
}
