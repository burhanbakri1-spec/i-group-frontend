'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ArrowRight, Zap, Activity, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Link from 'next/link';

const weeklyStrain = [
  { d: 'M', v: 8.2, cal: 1620 }, { d: 'T', v: 14.5, cal: 2340 },
  { d: 'W', v: 11.3, cal: 1980 }, { d: 'T', v: 16.2, cal: 2680 },
  { d: 'F', v: 9.8, cal: 1820 }, { d: 'S', v: 13.4, cal: 2210 }, { d: 'S', v: 12.4, cal: 2050 },
];

const hrZoneData = [
  { zone: 'Z1', pct: 22, label: 'Recovery' },
  { zone: 'Z2', pct: 35, label: 'Aerobic' },
  { zone: 'Z3', pct: 20, label: 'Threshold' },
  { zone: 'Z4', pct: 15, label: 'Anaerobic' },
  { zone: 'Z5', pct: 8,  label: 'Max' },
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

export default function StrainPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-28 px-6 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/25 mb-5">Strain</p>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
              Measure the impact<br />of every step<br /><span className="text-white/35">and rep.</span>
            </h1>
            <p className="text-white/45 mt-6 text-xl leading-relaxed max-w-md">
              i bio's cardiovascular strain score quantifies every physical effort on a 0–21 scale. Know when you're building fitness — and when you're risking injury by overdoing it.
            </p>
            <Link href="/ibio/membership">
              <motion.button className="mt-10 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full flex items-center gap-2 text-sm"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                Start Tracking <ArrowRight size={16} />
              </motion.button>
            </Link>
          </motion.div>
          {/* Strain card */}
          <motion.div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-7"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] text-white/25 uppercase tracking-widest">Today's Strain</p>
                <p className="text-5xl font-black mt-1">12.4</p>
                <p className="text-xs text-white/25 mt-1">out of 21</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/25 uppercase tracking-widest">Calories</p>
                <p className="text-4xl font-black mt-1">1,847</p>
              </div>
            </div>
            {/* Strain scale */}
            <div className="mb-5">
              <div className="h-3 rounded-full bg-gradient-to-r from-white/10 via-white/30 to-white/60 relative">
                <motion.div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white bg-black shadow"
                  style={{ left: `${(12.4 / 21) * 100}%` }}
                  initial={{ left: 0 }} animate={{ left: `${(12.4 / 21) * 100}%` }} transition={{ duration: 1.5, delay: 0.5 }} />
              </div>
              <div className="flex justify-between text-[9px] text-white/20 mt-1">
                <span>Recovery</span><span>Light</span><span>Moderate</span><span>Heavy</span><span>All Out</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={weeklyStrain} barSize={20}>
                <XAxis dataKey="d" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 21]} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="v" name="Strain" fill="rgba(255,255,255,0.2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>

      {/* Heart Rate Zones */}
      <section className="py-20 px-6 bg-white text-black">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-4">Heart Rate Zones</p>
            <h2 className="text-5xl font-black tracking-tighter">Know your zones.<br /><span className="text-black/45">Train smarter.</span></h2>
            <p className="text-black/50 mt-5 leading-relaxed">
              i bio calculates your personal HR zones based on your maximum heart rate and lactate threshold — not generic formulas. Every zone is calibrated to your physiology.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { z: 'Z1', l: 'Recovery', range: '< 115 bpm', desc: 'Active recovery. Promotes healing.' },
                { z: 'Z2', l: 'Aerobic', range: '115–138 bpm', desc: 'Fat burning. Foundation for endurance.' },
                { z: 'Z3', l: 'Threshold', range: '138–155 bpm', desc: 'Pushing your lactate threshold.' },
                { z: 'Z4', l: 'Anaerobic', range: '155–172 bpm', desc: 'High-intensity. Builds power.' },
                { z: 'Z5', l: 'Max', range: '> 172 bpm', desc: 'All-out effort. Short bursts only.' },
              ].map((z, i) => {
                const opacity = 0.2 + i * 0.15;
                return (
                  <div key={z.z} className="flex items-center gap-4 py-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: `rgba(255,255,255,${opacity * 0.3})` }}>{z.z}</div>
                    <div className="flex-1">
                      <span className="font-black text-sm">{z.l}</span>
                      <span className="text-xs text-black/40 ml-2">{z.range}</span>
                    </div>
                    <p className="text-xs text-black/40 hidden md:block">{z.desc}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div>
            <div className="bg-black/[0.03] border border-black/[0.1] rounded-3xl p-7">
              <p className="text-[10px] text-black/30 uppercase tracking-widest mb-5">Today's Zone Breakdown</p>
              {hrZoneData.map((z, i) => {
                const ref = useRef(null);
                const inView = useInView(ref, { once: true });
                const opacity = 0.15 + i * 0.12;
                return (
                  <div key={z.zone} ref={ref} className="flex items-center gap-4 mb-4">
                    <span className="text-xs font-black text-black/40 w-6">{z.zone}</span>
                    <div className="flex-1 h-6 bg-black/[0.04] rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ backgroundColor: `rgba(255,255,255,${opacity + 0.1})` }}
                        initial={{ width: 0 }} animate={inView ? { width: `${z.pct}%` } : {}}
                        transition={{ duration: 1.2, delay: i * 0.1 }} />
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black">{z.pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 text-center bg-black text-white">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-5xl font-black tracking-tighter">Train with purpose.<br /><span className="text-white/35">Not just effort.</span></h2>
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
