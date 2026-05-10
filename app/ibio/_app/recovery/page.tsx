'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check, Heart, Brain, Wind, Thermometer } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

const weeklyRecovery = [
  { d: 'M', v: 68, hrv: 52 }, { d: 'T', v: 72, hrv: 55 },
  { d: 'W', v: 45, hrv: 49 }, { d: 'T', v: 81, hrv: 61 },
  { d: 'F', v: 79, hrv: 58 }, { d: 'S', v: 85, hrv: 63 }, { d: 'S', v: 78, hrv: 58 },
];

function RecoveryGauge({ score, size = 160 }: { score: number; size?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [anim, setAnim] = useState(0);
  const R = (size - 16) / 2;
  const circ = 2 * Math.PI * R;
  const color = score >= 67 ? '#4ade80' : score >= 34 ? '#facc15' : '#f87171';

  useEffect(() => {
    if (inView) { const t = setTimeout(() => setAnim(score), 400); return () => clearTimeout(t); }
  }, [inView, score]);

  return (
    <div ref={ref} style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <motion.circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (anim / 100) * circ }}
          transition={{ duration: 2, ease: [0.33, 1, 0.68, 1] }} />
      </svg>
      <div className="absolute text-center">
        <motion.div className="text-4xl font-black" style={{ color }} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.6 }}>
          {anim}%
        </motion.div>
        <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Recovery</div>
      </div>
    </div>
  );
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs">
      <p className="text-white/40 mb-1">{label}</p>
      {payload.map((p: any, i: number) => <p key={i} className="text-white font-bold">{p.name}: {p.value}</p>)}
    </div>
  );
}

export default function RecoveryPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-28 px-6 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/25 mb-5">Recovery</p>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
              Quantify how<br />your body is<br /><span className="text-white/35">feeling.</span>
            </h1>
            <p className="text-white/45 mt-6 text-xl leading-relaxed max-w-md">
              Your daily recovery score synthesizes HRV, resting heart rate, sleep performance, and respiratory rate into one actionable number. Know exactly how hard to push — every single day.
            </p>
            <Link href="/ibio/membership">
              <motion.button className="mt-10 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full flex items-center gap-2 text-sm"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                Start Tracking <ArrowRight size={16} />
              </motion.button>
            </Link>
          </motion.div>
          <motion.div className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.3 }}>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 w-full max-w-sm">
              <p className="text-[10px] text-white/25 uppercase tracking-widest mb-5">Today's Recovery</p>
              <div className="flex items-center gap-6">
                <RecoveryGauge score={78} size={130} />
                <div className="space-y-3">
                  {[
                    { icon: Heart, l: 'HRV', v: '58ms', c: '#4ade80' },
                    { icon: Heart, l: 'Resting HR', v: '52bpm', c: 'rgba(255,255,255,0.7)' },
                    { icon: Wind, l: 'SpO₂', v: '98%', c: 'rgba(255,255,255,0.7)' },
                    { icon: Thermometer, l: 'Resp. Rate', v: '14.2/m', c: 'rgba(255,255,255,0.7)' },
                  ].map(m => (
                    <div key={m.l} className="flex justify-between gap-6 text-xs">
                      <span className="text-white/25">{m.l}</span>
                      <span className="font-black" style={{ color: m.c }}>{m.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-white text-black">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-4">The Algorithm</p>
            <h2 className="text-5xl font-black tracking-tighter mb-8">How recovery<br /><span className="text-black/45">is calculated.</span></h2>
            <div className="space-y-6">
              {[
                { icon: Brain, title: 'Heart Rate Variability (HRV)', desc: 'The most powerful predictor of readiness. i bio measures HRV while you sleep for accuracy, not during activity when HRV is suppressed.' },
                { icon: Heart, title: 'Resting Heart Rate', desc: 'An elevated resting HR is often the first sign of incomplete recovery, illness, or accumulated stress. Tracked every night.' },
                { icon: Wind, title: 'Respiratory Rate', desc: 'Breathing rate during sleep changes before you feel sick. An early warning system built into every night\'s data.' },
                { icon: Thermometer, title: 'Sleep Performance', desc: 'The duration, quality, and efficiency of your sleep directly feeds into your recovery score each morning.' },
              ].map(s => {
                const ref = useRef(null);
                const inView = useInView(ref, { once: true });
                return (
                  <motion.div key={s.title} ref={ref} className="flex gap-4"
                    initial={{ opacity: 0, x: -16 }} animate={inView ? { opacity: 1, x: 0 } : {}}>
                    <div className="w-9 h-9 rounded-xl bg-black/[0.05] border border-black/[0.1] flex items-center justify-center flex-shrink-0">
                      <s.icon size={16} className="text-black/50" />
                    </div>
                    <div>
                      <p className="font-black text-sm">{s.title}</p>
                      <p className="text-sm text-black/50 mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          {/* Weekly chart */}
          <div>
            <div className="bg-black/[0.03] border border-black/[0.1] rounded-3xl p-7">
              <p className="text-[10px] text-black/30 uppercase tracking-widest mb-5">Weekly Recovery History</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={weeklyRecovery} barSize={24}>
                  <XAxis dataKey="d" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="v" name="Recovery" fill="rgba(255,255,255,0.2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-5">
                <p className="text-[10px] text-black/30 uppercase tracking-widest mb-3">HRV Trend</p>
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={weeklyRecovery}>
                    <Line type="monotone" dataKey="hrv" name="HRV" stroke="rgba(255,255,255,0.6)" strokeWidth={2} dot={{ fill: '#fff', r: 3, strokeWidth: 0 }} />
                    <Tooltip content={<ChartTip />} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized coaching */}
      <section className="py-20 px-6 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { score: '78%', label: 'Green — Go', desc: 'Your body is primed. Push hard today. This is your window for high-intensity training, PRs, and competition.' },
              { score: '42%', label: 'Yellow — Moderate', desc: 'Moderate effort only. Your body is recovering. Training at high intensity today may impede tomorrow\'s readiness.' },
              { score: '18%', label: 'Red — Rest', desc: 'Your body is telling you something. Prioritize rest, light movement, nutrition, and stress management today.' },
            ].map((s, i) => {
              const ref = useRef(null);
              const inView = useInView(ref, { once: true });
              const color = i === 0 ? '#4ade80' : i === 1 ? '#facc15' : '#f87171';
              return (
                <motion.div key={s.label} ref={ref}
                  className="bg-black/[0.02] border border-black/[0.08] rounded-3xl p-7"
                  initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}>
                  <div className="text-4xl font-black mb-2" style={{ color }}>{s.score}</div>
                  <p className="font-black mb-3">{s.label}</p>
                  <p className="text-sm text-black/50 leading-relaxed">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center bg-black text-white">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-5xl font-black tracking-tighter">Know before you go.</h2>
          <p className="text-white/35 mt-4">Your recovery score is waiting. Start free.</p>
          <Link href="/ibio/membership">
            <motion.button className="mt-8 px-10 py-5 bg-white text-black font-black uppercase tracking-widest rounded-full inline-flex items-center gap-2 text-sm"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              Start Free Trial <ArrowRight size={16} />
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
