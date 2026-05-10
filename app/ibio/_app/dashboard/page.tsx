'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Activity, Moon, Heart, Zap, Brain, Wind, Thermometer,
  ArrowRight, Check, RefreshCw, TrendingUp, TrendingDown, Minus,
  Battery, Bluetooth, Wifi,
} from 'lucide-react';
import Link from 'next/link';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const hrData = [
  { t: '6a', v: 54 }, { t: '7a', v: 62 }, { t: '8a', v: 72 }, { t: '9a', v: 85 },
  { t: '10a', v: 88 }, { t: '11a', v: 92 }, { t: '12p', v: 95 }, { t: '1p', v: 88 },
  { t: '2p', v: 82 }, { t: '3p', v: 78 }, { t: '4p', v: 112 }, { t: '5p', v: 108 },
  { t: '6p', v: 105 }, { t: '7p', v: 82 }, { t: '8p', v: 78 }, { t: '9p', v: 67 },
  { t: '10p', v: 60 },
];

const weeklyRecovery = [
  { d: 'M', rec: 68, hrv: 52, strain: 8.2 },
  { d: 'T', rec: 72, hrv: 55, strain: 14.5 },
  { d: 'W', rec: 45, hrv: 49, strain: 11.3 },
  { d: 'T', rec: 81, hrv: 61, strain: 16.2 },
  { d: 'F', rec: 79, hrv: 58, strain: 9.8 },
  { d: 'S', rec: 85, hrv: 63, strain: 13.4 },
  { d: 'S', rec: 78, hrv: 58, strain: 12.4 },
];

const sleepData = [
  { s: '10p', dp: 0, rm: 0, lt: 2 }, { s: '11p', dp: 2, rm: 0, lt: 0 },
  { s: '12a', dp: 3, rm: 0, lt: 0 }, { s: '1a', dp: 3, rm: 0, lt: 0 },
  { s: '2a', dp: 1, rm: 2, lt: 0 }, { s: '3a', dp: 0, rm: 2, lt: 1 },
  { s: '4a', dp: 0, rm: 1, lt: 2 }, { s: '5a', dp: 0, rm: 2, lt: 1 },
  { s: '6a', dp: 0, rm: 1, lt: 2 }, { s: '7a', dp: 0, rm: 0, lt: 1 },
];

const stressData = [
  { t: '6a', v: 28 }, { t: '8a', v: 42 }, { t: '10a', v: 55 },
  { t: '12p', v: 63 }, { t: '2p', v: 71 }, { t: '4p', v: 48 },
  { t: '6p', v: 35 }, { t: '8p', v: 28 }, { t: '10p', v: 22 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function RecoveryRing({ score, size = 100 }: { score: number; size?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [anim, setAnim] = useState(0);
  const R = (size - 12) / 2;
  const circ = 2 * Math.PI * R;
  const color = score >= 67 ? '#4ade80' : score >= 34 ? '#facc15' : '#f87171';

  useEffect(() => {
    if (inView) { const t = setTimeout(() => setAnim(score), 300); return () => clearTimeout(t); }
  }, [inView, score]);

  return (
    <div ref={ref} style={{ width: size, height: size }} className="relative flex items-center justify-center flex-shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (anim / 100) * circ }}
          transition={{ duration: 1.8, ease: [0.33, 1, 0.68, 1] }} />
      </svg>
      <div className="absolute text-center">
        <motion.div className="text-xl font-black" style={{ color }} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}>
          {anim}
        </motion.div>
        <div className="text-[8px] text-white/25 uppercase tracking-wide">REC</div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, unit, trend, desc }: {
  icon: any; label: string; value: string; unit?: string; trend?: 'up' | 'down' | 'neutral'; desc?: string;
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} className="bg-white border border-black/[0.08] rounded-2xl p-4 hover:border-white/15 transition-all"
      initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
      <div className="flex justify-between mb-3">
        <Icon size={14} className="text-white/35" />
        {trend && <TrendIcon size={12} className={trend === 'up' ? 'text-white/50' : trend === 'down' ? 'text-white/25' : 'text-white/20'} />}
      </div>
      <p className="text-xl font-black">{value} {unit && <span className="text-xs text-black/35">{unit}</span>}</p>
      <p className="text-[9px] text-white/25 uppercase tracking-wider mt-0.5">{label}</p>
      {desc && <p className="text-[10px] text-white/35 mt-1">{desc}</p>}
    </motion.div>
  );
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs">
      <p className="text-white/40 mb-1">{label}</p>
      {payload.map((p: any, i: number) => <p key={i} className="font-bold text-white">{p.name}: {p.value}</p>)}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');

  return (
    <div className="bg-[#F5F5F5] text-black min-h-screen">
      {/* Dashboard Header */}
      <div className="border-b border-black/[0.08] px-6 py-5 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">My Dashboard</p>
            <h1 className="text-2xl font-black mt-0.5 text-black">Ahmed's Data</h1>
            <p className="text-xs text-black/30 mt-0.5">Sunday, March 17, 2026</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Device status */}
            <div className="hidden md:flex items-center gap-3 bg-white border border-black/[0.08] rounded-xl px-4 py-2.5">
              <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
              <div>
                <p className="text-[10px] font-black text-white/60">i bio Band · Gen 2</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Battery size={10} className="text-black/35" />
                  <span className="text-[9px] text-black/35">87%</span>
                  <Bluetooth size={10} className="text-white/25 ml-1" />
                  <span className="text-[9px] text-black/35">Connected</span>
                </div>
              </div>
            </div>
            {/* Time selector */}
            <div className="flex gap-1">
              {(['today', 'week', 'month'] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === t ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* TOP ROW — Big three */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-5">
          <div className="col-span-1 bg-white border border-black/[0.08] rounded-3xl p-5 flex flex-col items-center justify-center">
            <RecoveryRing score={78} size={90} />
            <p className="text-[9px] text-white/25 uppercase mt-2">Recovery</p>
            <p className="text-[9px] text-white/35 mt-0.5">Optimal</p>
          </div>
          <div className="col-span-1 bg-white border border-black/[0.08] rounded-3xl p-5 flex flex-col items-center justify-center">
            <Moon size={22} className="text-white/40 mb-2" />
            <p className="text-3xl font-black">82</p>
            <p className="text-[9px] text-white/25 uppercase mt-1">Sleep</p>
            <p className="text-[9px] text-white/35 mt-0.5">7h 24m</p>
          </div>
          <div className="col-span-1 bg-white border border-black/[0.08] rounded-3xl p-5 flex flex-col items-center justify-center">
            <Zap size={22} className="text-white/40 mb-2" />
            <p className="text-3xl font-black">12.4</p>
            <p className="text-[9px] text-white/25 uppercase mt-1">Strain</p>
            <p className="text-[9px] text-white/35 mt-0.5">Moderate</p>
          </div>
          <div className="col-span-1 bg-white border border-black/[0.08] rounded-3xl p-5 flex flex-col items-center justify-center">
            <Brain size={22} className="text-white/40 mb-2" />
            <p className="text-3xl font-black">32</p>
            <p className="text-[9px] text-white/25 uppercase mt-1">Stress</p>
            <p className="text-[9px] text-white/35 mt-0.5">Low</p>
          </div>
          <div className="col-span-1 bg-white border border-black/[0.08] rounded-3xl p-5 flex flex-col items-center justify-center">
            <Activity size={22} className="text-white/40 mb-2" />
            <p className="text-3xl font-black">58</p>
            <p className="text-[9px] text-white/25 uppercase mt-1">HRV</p>
            <p className="text-[9px] text-white/35 mt-0.5">ms</p>
          </div>
          <div className="col-span-1 bg-white border border-black/[0.08] rounded-3xl p-5 flex flex-col items-center justify-center">
            <Heart size={22} className="text-white/40 mb-2" />
            <p className="text-3xl font-black">52</p>
            <p className="text-[9px] text-white/25 uppercase mt-1">Resting HR</p>
            <p className="text-[9px] text-white/35 mt-0.5">bpm</p>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left col */}
          <div className="space-y-5">
            {/* HR Chart */}
            <div className="bg-white border border-black/[0.08] rounded-3xl p-6">
              <div className="flex justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-black/35">Heart Rate · 24h</p>
                <p className="text-[10px] text-black/35">52–112 bpm</p>
              </div>
              <ResponsiveContainer width="100%" height={110}>
                <AreaChart data={hrData}>
                  <defs>
                    <linearGradient id="hrDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="t" tick={{ fill: 'rgba(0,0,0,0.1)', fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[40, 130]} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="v" name="HR" stroke="rgba(0,0,0,0.7)" strokeWidth={1.5} fill="url(#hrDash)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Small metrics */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard icon={Wind} label="SpO₂" value="98" unit="%" trend="neutral" />
              <MetricCard icon={Thermometer} label="Skin Temp" value="+0.3" unit="°C" trend="up" />
              <MetricCard icon={Activity} label="Resp. Rate" value="14.2" unit="/min" trend="neutral" />
              <MetricCard icon={Heart} label="BP Trend" value="118" unit="/76" trend="neutral" desc="Systolic / Diastolic" />
            </div>
          </div>

          {/* Center col */}
          <div className="space-y-5">
            {/* Sleep stages */}
            <div className="bg-white border border-black/[0.08] rounded-3xl p-6">
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/35">Sleep</p>
                  <p className="text-2xl font-black mt-1">7h 24m</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/25 uppercase">Score</p>
                  <p className="text-2xl font-black mt-1">82</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={75}>
                <BarChart data={sleepData} barSize={14}>
                  <XAxis dataKey="s" tick={{ fill: 'rgba(0,0,0,0.1)', fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="dp" name="Deep" stackId="a" fill="rgba(255,255,255,0.55)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="rm" name="REM" stackId="a" fill="rgba(255,255,255,0.35)" />
                  <Bar dataKey="lt" name="Light" stackId="a" fill="rgba(0,0,0,0.1)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[{ l: 'Deep', v: '1h 42m' }, { l: 'REM', v: '1h 33m' }, { l: 'Light', v: '3h 47m' }].map(s => (
                  <div key={s.l} className="text-center">
                    <p className="text-sm font-black">{s.v}</p>
                    <p className="text-[9px] text-white/20">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-white/[0.04] rounded-xl px-3 py-2.5 text-xs">
                <span className="text-black/35">Coach: </span>
                <span className="text-white/55 font-bold">Target 10:45pm tonight for optimal tomorrow.</span>
              </div>
            </div>

            {/* Recovery + Strain trend */}
            <div className="bg-white border border-black/[0.08] rounded-3xl p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Weekly Recovery & Strain</p>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={weeklyRecovery}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                  <XAxis dataKey="d" tick={{ fill: 'rgba(0,0,0,0.15)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTip />} />
                  <Line type="monotone" dataKey="rec" name="Recovery" stroke="rgba(0,0,0,0.7)" strokeWidth={2} dot={{ fill: "#000", r: 2, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="strain" name="Strain" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-5">
            {/* Stress chart */}
            <div className="bg-white border border-black/[0.08] rounded-3xl p-6">
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/35">Stress · Today</p>
                  <p className="text-2xl font-black mt-1">32 <span className="text-xs text-black/35">/ 100</span></p>
                  <p className="text-xs text-white/40 font-bold">Low</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={90}>
                <AreaChart data={stressData}>
                  <defs>
                    <linearGradient id="stDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(0,0,0,0.08)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="rgba(0,0,0,0.5)" strokeWidth={1.5} fill="url(#stDash)" dot={false} />
                  <XAxis dataKey="t" tick={{ fill: 'rgba(0,0,0,0.1)', fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip content={<ChartTip />} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* HRV trend */}
            <div className="bg-white border border-black/[0.08] rounded-3xl p-6">
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/35">HRV Trend</p>
                  <p className="text-2xl font-black mt-1">58 <span className="text-xs text-black/35">ms</span></p>
                </div>
                <div className="flex items-center gap-1 text-black/50">
                  <TrendingUp size={14} />
                  <span className="text-xs font-bold">+6%</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={weeklyRecovery}>
                  <Line type="monotone" dataKey="hrv" name="HRV" stroke="rgba(0,0,0,0.7)" strokeWidth={2} dot={{ fill: "#000", r: 2.5, strokeWidth: 0 }} />
                  <Tooltip content={<ChartTip />} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* i fit bridge */}
            <Link href="/ifit">
              <motion.div className="bg-white border border-black/[0.08] rounded-3xl p-5 hover:border-white/20 transition-all cursor-pointer"
                whileHover={{ y: -2 }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/25 mb-1">i bio × i fit</p>
                    <p className="text-sm font-black">Coach adjusted today's session</p>
                    <p className="text-xs text-white/35 mt-1">Recovery 78% → Moderate intensity recommended. Coach reduced volume by 20%.</p>
                  </div>
                  <ArrowRight size={16} className="text-white/25 flex-shrink-0 mt-0.5" />
                </div>
              </motion.div>
            </Link>

            {/* Healthspan preview */}
            <Link href="/ibio/healthspan">
              <motion.div className="bg-white border border-black/[0.08] rounded-3xl p-5 hover:border-white/20 transition-all cursor-pointer"
                whileHover={{ y: -2 }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/25 mb-1">Healthspan</p>
                    <p className="text-sm font-black">i bio Age: 32</p>
                    <p className="text-xs text-white/35 mt-1">3 years younger than chronological. Trending down.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black">32</span>
                    <p className="text-[9px] text-black/35">vs 35 chrono</p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>

        {/* BOTTOM — Full history week */}
        <div className="mt-5 bg-white border border-black/[0.08] rounded-3xl p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-5">Weekly Strain History</p>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={weeklyRecovery} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="d" tick={{ fill: 'rgba(0,0,0,0.15)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 21]} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="strain" name="Strain" fill="rgba(0,0,0,0.15)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upgrade prompt for non-Elite */}
        <motion.div className="mt-5 border border-black rounded-3xl px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-6 bg-black"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Advanced Labs Available</p>
            <h3 className="text-xl font-black text-white">Unlock 65+ biomarkers.</h3>
            <p className="text-sm text-white/45 mt-1">Upgrade to Elite to pair your wearable data with a comprehensive blood panel.</p>
          </div>
          <Link href="/ibio/advanced-labs">
            <motion.button className="flex-shrink-0 px-6 py-3.5 bg-white text-black font-black uppercase tracking-widest rounded-full flex items-center gap-2 text-sm"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              Explore Advanced Labs <ArrowRight size={14} />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
