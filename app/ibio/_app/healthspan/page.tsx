'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check, TrendingDown, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

const paceData = [
  { month: 'Jan', bio: 34.5, chrono: 35 },
  { month: 'Feb', bio: 34.2, chrono: 35 },
  { month: 'Mar', bio: 33.8, chrono: 35 },
  { month: 'Apr', bio: 33.5, chrono: 35 },
  { month: 'May', bio: 33.1, chrono: 35 },
  { month: 'Jun', bio: 32.8, chrono: 35 },
];

const longevityFactors = [
  { label: 'Sleep Consistency', score: 88, trend: '+4', desc: 'Going to bed within 30 min of your target 6/7 nights.' },
  { label: 'Strength Training', score: 72, trend: '+12', desc: 'Resistance training 2+ days/week with progressive overload.' },
  { label: 'Cardiovascular Fitness', score: 80, trend: '+6', desc: 'VO2 Max estimate and weekly Zone 2 training hours.' },
  { label: 'Resting Heart Rate', score: 91, trend: '+2', desc: 'Resting HR trending toward optimal range for your age.' },
  { label: 'HRV Baseline', score: 77, trend: '+8', desc: 'HRV tracking above your 90-day rolling baseline.' },
  { label: 'Daily Steps', score: 65, trend: '-3', desc: '8,200 avg. Optimal range is 8,000–12,000 for longevity.' },
  { label: 'Lean Body Mass', score: 74, trend: '+5', desc: 'Estimated from strain patterns, RHR, and activity data.' },
  { label: 'Sleep Duration', score: 83, trend: '+7', desc: '7h 22m avg. Consistent with longevity research targets.' },
];

const researchers = [
  { name: 'Eric Verdin, MD', role: 'CEO, Buck Institute · Longevity Science', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200' },
  { name: 'Brianna Stubbs, PhD', role: 'Senior Scientist · Metabolic Health', img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200' },
  { name: 'Simon Melov, PhD', role: 'Director · Genomics · Buck Institute', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200' },
];

function ScoreBar({ label, score, trend, desc, delay = 0 }: { label: string; score: number; trend: string; desc: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const isUp = trend.startsWith('+');
  return (
    <motion.div ref={ref} className="py-4 border-b border-white/[0.05] last:border-0 group hover:bg-white/[0.02] px-3 -mx-3 rounded-xl transition-colors"
      initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay }}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-black">{label}</span>
          <p className="text-[10px] text-white/25 mt-0.5">{desc}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-black ${isUp ? 'text-white/50' : 'text-white/25'}`}>{trend}</span>
          <span className="text-lg font-black">{score}</span>
        </div>
      </div>
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div className="h-full bg-white/40 rounded-full"
          initial={{ width: 0 }} animate={inView ? { width: `${score}%` } : {}} transition={{ duration: 1.2, delay: delay + 0.2, ease: [0.33, 1, 0.68, 1] }} />
      </div>
    </motion.div>
  );
}

function ChartTip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs">
      <p className="text-white/40 mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} className="text-white font-bold">{p.name}: {p.value}</p>)}
    </div>
  );
}

function AnimatedSectionCard({ n, title, desc, delay }: { n: string; title: string; desc: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref}
      className="bg-black/[0.02] border border-black/[0.08] rounded-3xl p-8"
      initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay }}>
      <div className="text-5xl font-black text-white/[0.08] mb-5">{n}</div>
      <h3 className="text-xl font-black mb-3">{title}</h3>
      <p className="text-sm text-black/50 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default function HealthspanPage() {
  const [bioAge, setBioAge] = useState(0);

  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true });

  useEffect(() => {
    if (titleInView) { const t = setTimeout(() => setBioAge(32), 500); return () => clearTimeout(t); }
  }, [titleInView]);

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative py-28 px-6 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.015] to-transparent" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.p className="text-[11px] font-black tracking-[0.3em] uppercase text-white/25 mb-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            Healthspan
          </motion.p>
          <motion.h1 className="text-6xl md:text-8xl font-black tracking-tighter"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
            Live better<br /><span className="text-white/35">for longer.</span>
          </motion.h1>
          <motion.p className="text-white/40 mt-6 text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Understand how your daily habits impact your long-term health with Healthspan — a powerful way to quantify your age and slow your Pace of Aging.
          </motion.p>
          <motion.div className="flex flex-wrap justify-center gap-4 mt-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Link href="/ibio/membership">
              <motion.button className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full flex items-center gap-2 text-sm"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                Unlock Healthspan <ArrowRight size={16} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* WHOOP Age vs Biological Age */}
      <section className="py-20 px-6 bg-white text-black">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-4">i bio Age</p>
            <h2 className="text-5xl font-black tracking-tighter">Discover your<br /><span className="text-black/45">i bio Age.</span></h2>
            <p className="text-black/50 mt-5 leading-relaxed">
              i bio analyzes metrics across sleep, activity, strain, HRV, and more to calculate your physiological age. See if your body is older, younger, or on pace with your chronological age.
            </p>
            <div className="mt-10 space-y-4">
              <p className="text-[10px] font-black uppercase text-black/30 tracking-widest">What's measured:</p>
              {['Sleep quality & consistency', 'HRV & resting heart rate trends', 'Cardiovascular fitness (VO2 Max)', 'Strength training frequency & intensity', 'Daily steps & activity levels', 'Body composition estimates', 'Respiratory rate & SpO₂'].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <Check size={13} className="text-black/50 flex-shrink-0" />
                  <span className="text-sm text-black/60">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Age comparison card */}
          <motion.div className="flex flex-col gap-5"
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            ref={titleRef}>
            <div className="bg-black/[0.03] border border-black/[0.1] rounded-3xl p-8">
              <p className="text-[10px] text-black/30 uppercase tracking-widest mb-6">Your Age Comparison</p>
              <div className="flex items-end justify-around gap-6">
                <div className="text-center">
                  <p className="text-[10px] text-black/30 uppercase tracking-wider mb-2">Chronological</p>
                  <div className="text-6xl font-black text-black/30">35</div>
                  <p className="text-xs text-black/25 mt-1">years</p>
                </div>
                <div className="text-black/20 text-3xl font-black">vs</div>
                <div className="text-center">
                  <p className="text-[10px] text-black/30 uppercase tracking-wider mb-2">i bio Age</p>
                  <motion.div className="text-6xl font-black text-black"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    {bioAge}
                  </motion.div>
                  <div className="flex items-center gap-1 justify-center mt-1">
                    <TrendingDown size={12} className="text-black/50" />
                    <p className="text-xs text-black/50">3 years younger</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 bg-black/[0.04] rounded-2xl px-5 py-4">
                <p className="text-[10px] text-black/30 uppercase tracking-wider mb-1">Coach Insight</p>
                <p className="text-sm text-black/65 font-bold">Your sleep consistency is your #1 driver. Maintain your current bedtime routine to keep trending younger.</p>
              </div>
            </div>

            {/* Pace of Aging chart */}
            <div className="bg-black/[0.03] border border-black/[0.1] rounded-3xl p-7">
              <p className="text-[10px] text-black/30 uppercase tracking-widest mb-4">Pace of Aging — 6 months</p>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={paceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[31, 37]} />
                  <Tooltip content={<ChartTip />} />
                  <Line type="monotone" dataKey="chrono" name="Chronological" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="bio" name="i bio Age" stroke="rgba(255,255,255,0.8)" strokeWidth={2} dot={{ fill: '#fff', r: 3, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-black/25 mt-2">Your i bio Age is diverging from chronological — you're slowing your aging.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Longevity Factors */}
      <section className="py-20 px-6 bg-white text-black">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-4">The Science of Longevity</p>
            <h2 className="text-5xl font-black tracking-tighter">Harness the science<br /><span className="text-black/45">of longevity.</span></h2>
            <p className="text-black/50 mt-5 leading-relaxed">
              Healthspan draws on peer-reviewed longevity research to score the behaviors that are most predictive of biological age — and tells you exactly which ones to improve.
            </p>
            <p className="text-black/45 mt-4 leading-relaxed text-sm">
              Built in partnership with the Buck Institute for Research on Aging — the world's leading independent longevity research center.
            </p>
            <div className="mt-8 border border-black/[0.1] rounded-2xl p-5">
              <p className="text-xs font-black text-black/30 uppercase tracking-widest mb-3">Science Partnership</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/[0.06] border border-black/10 flex items-center justify-center">
                  <Activity size={16} className="text-black/50" />
                </div>
                <div>
                  <p className="text-sm font-black">Buck Institute for Research on Aging</p>
                  <p className="text-xs text-black/40">Global leader in longevity science</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            {longevityFactors.map((f, i) => (
              <ScoreBar key={f.label} {...f} delay={i * 0.06} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Small changes add up */}
      <section className="py-20 px-6 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Understand your age', desc: 'See your i bio Age calculated from real physiological data — not just a number on your birth certificate.' },
              { n: '02', title: 'See your Pace of Aging', desc: 'Discover how fast, or slow, your body is biologically changing over time. This dynamic measure reflects your recent habits.' },
              { n: '03', title: 'Build lasting progress', desc: 'As your habits improve, your i bio Age changes. With sustained effort, you can trend years younger than your chronological age.' },
            ].map((s, i) => {
              const ref = useRef(null);
              const inView = useInView(ref, { once: true, margin: '-40px' });
              return (
                <motion.div key={s.n} ref={ref}
                  className="bg-black/[0.02] border border-black/[0.08] rounded-3xl p-8"
                  initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}>
                  <div className="text-5xl font-black text-white/[0.08] mb-5">{s.n}</div>
                  <h3 className="text-xl font-black mb-3">{s.title}</h3>
                  <p className="text-sm text-black/50 leading-relaxed">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Free trial CTA */}
      <section className="py-28 px-6 text-center bg-black text-white">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/25 mb-4">Try Healthspan Free</p>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter">
            Get started with<br /><span className="text-white/35">your first month free.</span>
          </h2>
          <p className="text-white/30 mt-4 text-sm">Healthspan unlocks once you log 21 Recoveries in 31 days.</p>
          <Link href="/ibio/membership">
            <motion.button className="mt-8 px-10 py-5 bg-white text-black font-black uppercase tracking-widest rounded-full inline-flex items-center gap-2 text-sm"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              Unlock Free Trial <ArrowRight size={16} />
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
