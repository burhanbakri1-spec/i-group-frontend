'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Heart, Activity, AlertTriangle, Droplets } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Link from 'next/link';

const hrData = [
  { t: '6a', v: 54 }, { t: '8a', v: 72 }, { t: '10a', v: 88 },
  { t: '12p', v: 95 }, { t: '2p', v: 82 }, { t: '4p', v: 112 },
  { t: '6p', v: 105 }, { t: '8p', v: 78 }, { t: '10p', v: 60 },
];

const ecgData = Array.from({ length: 60 }, (_, i) => ({
  t: i,
  v: i % 20 < 2 ? 0 : i % 20 === 5 ? -0.3 : i % 20 === 7 ? 1.8 : i % 20 === 8 ? -0.5 : i % 20 === 9 ? 0.3 : 0,
}));

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs">
      <p className="text-white/40 mb-1">{label}</p>
      {payload.map((p: any, i: number) => <p key={i} className="text-white font-bold">{p.name}: {p.value}</p>)}
    </div>
  );
}

export default function HeartHealthPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-28 px-6 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/25 mb-5">Heart Health</p>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
              Stay connected<br />to your<br /><span className="text-white/35">heart health.</span>
            </h1>
            <p className="text-white/45 mt-6 text-xl leading-relaxed max-w-md">
              Medical-grade ECG. Irregular heart rhythm detection. Real-time blood pressure insights. Clinical-grade cardiac monitoring — on your wrist, available 24/7.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link href="/ibio/membership">
                <motion.button className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full flex items-center gap-2 text-sm"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  Start Free Trial <ArrowRight size={16} />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Heart stats card */}
          <motion.div className="space-y-4"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-7">
              <p className="text-[10px] text-white/25 uppercase tracking-widest mb-4">Heart Rate — 24h</p>
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={hrData}>
                  <defs>
                    <linearGradient id="hrG2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} fill="url(#hrG2)" dot={false} />
                  <Tooltip content={<ChartTip />} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[{ l: 'Resting', v: '52bpm' }, { l: 'Max', v: '112bpm' }, { l: 'Average', v: '78bpm' }].map(m => (
                  <div key={m.l} className="bg-white/[0.04] rounded-xl p-3 text-center">
                    <p className="text-sm font-black">{m.v}</p>
                    <p className="text-[9px] text-white/25 mt-0.5">{m.l}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* ECG strip */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6">
              <div className="flex justify-between mb-3">
                <p className="text-[10px] text-white/25 uppercase tracking-widest">ECG · Latest Reading</p>
                <span className="text-[9px] font-black text-white/40 bg-white/[0.06] px-2 py-0.5 rounded-full">Normal Sinus Rhythm</span>
              </div>
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={ecgData}>
                  <Line type="monotone" dataKey="v" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4 Heart Health Features */}
      <section className="py-20 px-6 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-3">Heart Health Features</p>
            <h2 className="text-5xl font-black tracking-tighter">Clinical-grade cardiac<br /><span className="text-black/45">monitoring.</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Heart,
                title: 'ECG — Atrial Fibrillation Detection',
                badge: 'Medically regulated',
                desc: 'Take a 30-second ECG directly from your i bio Band. Detects atrial fibrillation (AFib) — the most common serious heart arrhythmia — with clinical sensitivity. Results are stored and shareable with your doctor.',
                note: 'Not intended for users with known arrhythmias other than AFib, or users under 22.',
              },
              {
                icon: AlertTriangle,
                title: 'Irregular Heart Rhythm Notifications',
                badge: 'Background monitoring',
                desc: 'i bio continuously monitors your heart rhythm in the background — 24/7 — and sends an alert if it detects a rhythm that may suggest atrial fibrillation, even when you haven\'t triggered a manual ECG.',
                note: 'Not intended for users with known atrial fibrillation or users under 22.',
              },
              {
                icon: Activity,
                title: 'Heart Rate Variability (HRV)',
                badge: 'Nightly measurement',
                desc: 'HRV is the most powerful predictor of recovery, stress, and overall readiness. i bio measures HRV during sleep when readings are most accurate — and tracks your 30, 60, and 90-day baselines over time.',
                note: null,
              },
              {
                icon: Droplets,
                title: 'Blood Pressure Insights (Beta)',
                badge: 'Continuous estimation',
                desc: 'Using pulse transit time and your biometric patterns, i bio provides blood pressure trend insights throughout the day — without a cuff. Not a medical device, but a powerful wellness signal for long-term tracking.',
                note: 'Not a medical device. Not for users with known hypertension or pregnancy.',
              },
            ].map((f, i) => {
              const ref = useRef(null);
              const inView = useInView(ref, { once: true, margin: '-40px' });
              return (
                <motion.div key={f.title} ref={ref}
                  className="bg-black/[0.02] border border-black/[0.08] rounded-3xl p-8 hover:border-black/15 transition-all"
                  initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}>
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-black/[0.06] border border-black/10 flex items-center justify-center flex-shrink-0">
                      <f.icon size={18} className="text-black/55" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black tracking-widest uppercase text-black/30 bg-black/[0.06] px-2 py-0.5 rounded-full">{f.badge}</span>
                      <h3 className="font-black text-base mt-2">{f.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-black/55 leading-relaxed">{f.desc}</p>
                  {f.note && <p className="text-[10px] text-black/25 mt-4 border-t border-black/[0.07] pt-3">{f.note}</p>}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 text-center bg-black text-white">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-5xl font-black tracking-tighter">Your heart. Watched<br /><span className="text-white/35">every second.</span></h2>
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
