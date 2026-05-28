'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ArrowRight, Moon, Check, Clock, TrendingUp, Brain } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Link from 'next/link';

const sleepStages = [
  { s: '10p', aw: 0, lt: 1.5, dp: 0, rm: 0 },
  { s: '11p', aw: 0, lt: 0.5, dp: 2, rm: 0 },
  { s: '12a', aw: 0, lt: 0, dp: 3, rm: 0 },
  { s: '1a',  aw: 0, lt: 0, dp: 3, rm: 0 },
  { s: '2a',  aw: 0, lt: 0, dp: 1, rm: 2 },
  { s: '3a',  aw: 0, lt: 1, dp: 0, rm: 2 },
  { s: '4a',  aw: 0, lt: 2, dp: 0, rm: 1.5 },
  { s: '5a',  aw: 0, lt: 1, dp: 0, rm: 2 },
  { s: '6a',  aw: 0, lt: 2, dp: 0, rm: 1 },
  { s: '7a',  aw: 1, lt: 0.5, dp: 0, rm: 0 },
];

const sleepHistory = [
  { d: 'M', score: 74, hrs: 6.8 }, { d: 'T', score: 88, hrs: 8.1 },
  { d: 'W', score: 65, hrs: 6.2 }, { d: 'T', score: 82, hrs: 7.4 },
  { d: 'F', score: 91, hrs: 8.4 }, { d: 'S', score: 79, hrs: 7.1 }, { d: 'S', score: 82, hrs: 7.4 },
];

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs">
      <p className="text-white/40 mb-1">{label}</p>
      {payload.map((p: any, i: number) => <p key={i} className="font-bold" style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
}

export default function SleepPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-28 px-6 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/25 mb-5">Sleep</p>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
              Optimize<br />your sleep.
            </h1>
            <p className="text-white/45 mt-6 text-xl leading-relaxed max-w-md">
              Not just how long you sleep — but how well. i bio tracks every stage and gives you a personal sleep coach that tells you exactly when to go to bed and why.
            </p>
            <Link href="/ibio/membership">
              <motion.button className="mt-10 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full flex items-center gap-2 text-sm"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                Start Tracking Sleep <ArrowRight size={16} />
              </motion.button>
            </Link>
          </motion.div>
          {/* Sleep card */}
          <motion.div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-7"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] text-white/25 uppercase tracking-widest">Last Night</p>
                <p className="text-4xl font-black mt-1">7h 24m</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/25 uppercase tracking-widest">Sleep Score</p>
                <p className="text-4xl font-black mt-1">82</p>
              </div>
            </div>
            {/* Stage stacked bar */}
            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3">Sleep Stages</p>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={sleepStages} barSize={16}>
                <XAxis dataKey="s" tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="dp" name="Deep" stackId="a" fill="rgba(255,255,255,0.5)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="rm" name="REM" stackId="a" fill="rgba(255,255,255,0.3)" />
                <Bar dataKey="lt" name="Light" stackId="a" fill="rgba(255,255,255,0.15)" />
                <Bar dataKey="aw" name="Awake" stackId="a" fill="rgba(255,255,255,0.05)" />
              </BarChart>
            </ResponsiveContainer>
            {/* Stage breakdown */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                { l: 'Awake', v: '22m', c: 'rgba(255,255,255,0.2)' },
                { l: 'Light', v: '3h 47m', c: 'rgba(255,255,255,0.35)' },
                { l: 'Deep', v: '1h 42m', c: 'rgba(255,255,255,0.6)' },
                { l: 'REM', v: '1h 33m', c: 'rgba(255,255,255,0.5)' },
              ].map(s => (
                <div key={s.l} className="text-center">
                  <p className="text-sm font-black" style={{ color: s.c }}>{s.v}</p>
                  <p className="text-[9px] text-white/20 mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 bg-white/[0.04] rounded-xl px-4 py-3 text-xs">
              <span className="text-white/30">Sleep Coach: </span>
              <span className="text-white/65 font-bold">Go to bed by 10:45pm tonight for optimal recovery tomorrow.</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-3">What i bio Tracks</p>
            <h2 className="text-5xl font-black tracking-tighter">Everything about<br /><span className="text-black/45">your sleep.</span></h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Moon, title: 'Sleep Stages', desc: 'Automatic detection of Awake, Light, Deep (slow-wave), and REM sleep using movement and heart rate patterns.' },
              { icon: TrendingUp, title: 'Sleep Score', desc: 'A single 0–100 number that weighs duration, quality, stage ratios, and consistency to give you one clear grade.' },
              { icon: Clock, title: 'Sleep Coaching', desc: 'Personalized bedtime recommendations based on your recovery needs and upcoming schedule. Know when to sleep before you need to.' },
              { icon: Brain, title: 'Sleep Debt', desc: 'Track the cumulative impact of undersleeping. Understand when you owe your body sleep and when you\'ve paid it back.' },
              { icon: Moon, title: 'Sleep Need', desc: 'i bio learns your personal sleep need — not everyone needs 8 hours. Your optimal amount, personalized.' },
              { icon: TrendingUp, title: 'Disturbances', desc: 'Number of times you woke up, duration of each disturbance, and what sensor data looked like during transitions.' },
            ].map((f, i) => {
              const ref = useRef(null);
              const inView = useInView(ref, { once: true, margin: '-40px' });
              return (
                <motion.div key={f.title} ref={ref}
                  className="bg-black/[0.02] border border-black/[0.08] rounded-3xl p-7 hover:border-black/15 transition-all"
                  initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08 }}>
                  <f.icon size={20} className="text-black/50 mb-5" />
                  <h3 className="font-black mb-2">{f.title}</h3>
                  <p className="text-sm text-black/50 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Weekly history */}
      <section className="py-20 px-6 bg-white text-black">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-4">Consistency</p>
            <h2 className="text-4xl font-black tracking-tighter">Sleep consistency<br /><span className="text-black/45">is the most powerful lever.</span></h2>
            <p className="text-black/50 mt-5 leading-relaxed">
              Research shows that consistent sleep timing is as important as duration. i bio tracks your sleep regularity and coaches you to maintain a stable schedule — even on weekends.
            </p>
          </motion.div>
          <div className="bg-black/[0.03] border border-black/[0.1] rounded-3xl p-7">
            <p className="text-[10px] text-black/30 uppercase tracking-widest mb-5">7-Day Sleep Score</p>
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={sleepHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="d" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[50, 100]} />
                <Tooltip content={<ChartTip />} />
                <Line type="monotone" dataKey="score" name="Sleep Score" stroke="rgba(255,255,255,0.7)" strokeWidth={2} dot={{ fill: '#fff', r: 3, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 text-center bg-black text-white">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-5xl font-black tracking-tighter">Sleep better.<br /><span className="text-white/35">Perform better.</span></h2>
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
