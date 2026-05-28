'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ArrowRight, Brain, Heart, Activity, Wind, Zap } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Link from 'next/link';

const stressHistory = [
  { t: '6a', v: 28 }, { t: '8a', v: 42 }, { t: '10a', v: 55 },
  { t: '12p', v: 63 }, { t: '2p', v: 71 }, { t: '4p', v: 48 },
  { t: '6p', v: 35 }, { t: '8p', v: 28 }, { t: '10p', v: 22 },
];

const weeklyStress = [
  { d: 'M', avg: 42 }, { d: 'T', avg: 55 }, { d: 'W', avg: 38 },
  { d: 'T', avg: 61 }, { d: 'F', avg: 48 }, { d: 'S', avg: 32 }, { d: 'S', avg: 35 },
];

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs">
      <p className="text-white/40 mb-1">{label}</p>
      {payload.map((p: any, i: number) => <p key={i} className="text-white font-bold">{p.name}: {p.value}</p>)}
    </div>
  );
}

export default function StressPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-28 px-6 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/25 mb-5">Stress Monitor</p>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
              See stress<br />before you<br /><span className="text-white/35">feel it.</span>
            </h1>
            <p className="text-white/45 mt-6 text-xl leading-relaxed max-w-md">
              Your autonomic nervous system reveals how stressed you really are — even when you can't consciously feel it. i bio tracks physiological stress 24/7 and tells you what's driving it.
            </p>
            <Link href="/ibio/membership">
              <motion.button className="mt-10 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full flex items-center gap-2 text-sm"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                Start Monitoring <ArrowRight size={16} />
              </motion.button>
            </Link>
          </motion.div>

          {/* Stress card */}
          <motion.div className="space-y-4"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-7">
              <div className="flex justify-between mb-5">
                <div>
                  <p className="text-[10px] text-white/25 uppercase tracking-widest">Stress Level · Now</p>
                  <p className="text-4xl font-black mt-1">32 <span className="text-sm text-white/25">/ 100</span></p>
                  <p className="text-sm text-white/50 font-bold mt-1">Low</p>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 h-fit">
                  <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
                  <span className="text-[10px] font-bold text-white/40">Live</span>
                </div>
              </div>
              <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3">Today's Stress Curve</p>
              <ResponsiveContainer width="100%" height={90}>
                <AreaChart data={stressHistory}>
                  <defs>
                    <linearGradient id="stressG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} fill="url(#stressG)" dot={false} />
                  <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip content={<ChartTip />} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 bg-white/[0.04] rounded-xl px-4 py-3 text-xs">
                <span className="text-white/30">Coach insight: </span>
                <span className="text-white/65 font-bold">Peak stress at 2pm correlated with high caffeine intake and skipped lunch. Consider a 10-min walk at 1:30pm tomorrow.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ANS explanation */}
      <section className="py-20 px-6 bg-white text-black">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-4">The Science</p>
            <h2 className="text-5xl font-black tracking-tighter">Your autonomic<br /><span className="text-black/45">nervous system.</span></h2>
            <p className="text-black/50 mt-5 leading-relaxed">
              The autonomic nervous system (ANS) controls your fight-or-flight and rest-and-digest responses. When under stress — physical or psychological — your ANS shifts toward sympathetic dominance, which shows up in HRV, heart rate patterns, and skin conductance.
            </p>
            <p className="text-black/45 mt-4 leading-relaxed">
              i bio reads these signals continuously and scores your physiological stress state in real time — before you've consciously registered that you're stressed.
            </p>
          </motion.div>
          <div>
            <div className="bg-black/[0.03] border border-black/[0.1] rounded-3xl p-7">
              <p className="text-[10px] text-black/30 uppercase tracking-widest mb-5">Weekly Stress Average</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={weeklyStress} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="d" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="avg" name="Avg Stress" fill="rgba(255,255,255,0.2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* What triggers stress */}
      <section className="py-20 px-6 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-3">Stress Triggers</p>
            <h2 className="text-5xl font-black tracking-tighter">See what's causing it.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: 'Training load', desc: 'Physical strain elevates physiological stress. i bio distinguishes exercise-induced stress from psychological stress.' },
              { icon: Brain, title: 'Poor sleep', desc: 'Sleep debt is one of the strongest drivers of elevated physiological stress. You\'ll see it in your morning stress score.' },
              { icon: Heart, title: 'Nutritional stress', desc: 'Caffeine, alcohol, large meals — all show up in your stress data. Correlate habits to stress spikes with the journal.' },
              { icon: Activity, title: 'Psychological pressure', desc: 'Deadlines, conflict, and anxiety show up as physiological stress even without physical activity.' },
              { icon: Wind, title: 'Environmental stress', desc: 'Heat, altitude, illness, and travel all affect your ANS balance and contribute to your stress score.' },
              { icon: Brain, title: 'Recovery correlation', desc: 'High stress → lower recovery. i bio shows you exactly how your stress yesterday impacts your readiness today.' },
            ].map((f, i) => {
              const ref = useRef(null);
              const inView = useInView(ref, { once: true, margin: '-40px' });
              return (
                <motion.div key={f.title} ref={ref}
                  className="bg-black/[0.02] border border-black/[0.08] rounded-3xl p-7 hover:border-black/15 transition-all"
                  initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08 }}>
                  <f.icon size={20} className="text-black/45 mb-5" />
                  <h3 className="font-black mb-2">{f.title}</h3>
                  <p className="text-sm text-black/50 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 text-center bg-black text-white">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-5xl font-black tracking-tighter">Understand your stress.<br /><span className="text-white/35">Master your health.</span></h2>
          <Link href="/ibio/membership">
            <motion.button className="mt-10 px-10 py-5 bg-white text-black font-black uppercase tracking-widest rounded-full inline-flex items-center gap-2 text-sm"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              Start Free Trial <ArrowRight size={16} />
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
