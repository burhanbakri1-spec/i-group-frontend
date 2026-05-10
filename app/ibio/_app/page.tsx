'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion';
import { FeatureCard } from './components/FeatureCard';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Activity, Moon, Heart, Zap, Brain, Wind, Thermometer,
  ArrowRight, Check, Shield, Star, Award, Users, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

// ─── WHOOP CDN Image URLs ─────────────────────────────────────────────────────
const IMGS = {
  // Hero
  hero: 'https://images.ctfassets.net/rbzqg6pelgqa/3CCQWI1KRdKsfMkGIgNfls/1db1bc98dbbca4f4c288cca02729e964/Not_a_whoop_member_image__1_.png',
  // Feature app screenshots
  recovery: 'https://images.ctfassets.net/rbzqg6pelgqa/2MWznHIwCBkq0psNWBlMBd/4350d9ee58495e76c4b3946d09706bdf/Recovery.png',
  healthspan: 'https://images.ctfassets.net/rbzqg6pelgqa/xVYkNrlbEp2FBBlB8nZtN/936bba11c791cf05a07f263dfdea162e/Healthspan-1.png',
  sleep: 'https://images.ctfassets.net/rbzqg6pelgqa/4DF8ek6h14dnRgI3fjAAOc/7c760379a38f2e32df2ebb5e0e8ee579/Sleep-1.png',
  strain: 'https://images.ctfassets.net/rbzqg6pelgqa/50iEhV1lmhfX4BOUjZnTK/0e7e3ac599a5607e1fb091b28cc2c127/Strain-1.png',
  heartHealth: 'https://images.ctfassets.net/rbzqg6pelgqa/1iwCpHpMpjVHfBkQcNGv4P/fbd48749a53d0979359b9b7a86ff9de6/Stay_connected_to_your_heart_health__1_.webp',
  bloodPressure: 'https://images.ctfassets.net/rbzqg6pelgqa/4mUD3U1EGiLmCDbRm6OVV1/7900963e597b7c00b30c775e2c754a12/BP_Insights-1.png',
  hormonal: 'https://images.ctfassets.net/rbzqg6pelgqa/5mIC7gAOXgutLcOLFb1gfY/39645074e6b113e32abc8e332d8de5b6/MCI-1.png',
  // Advanced Labs
  advancedLabs: 'https://images.ctfassets.net/rbzqg6pelgqa/5SW25OO4PwW3qxsAVltMmX/e76ca3acedb699cc63a344503d5cf1d3/person-health-app-hrv-cholesterol-hemoglobin.webp',
  // Membership tier devices
  deviceOne: 'https://images.ctfassets.net/rbzqg6pelgqa/36XNlGhqZe2tfTxqNq4owE/2f45b6dc0cca4426042405e1b98cfbe5/One_card__1_.webp',
  devicePeak: 'https://images.ctfassets.net/rbzqg6pelgqa/2L5W622UNiYxlnHE3hHGAL/d3443637b907fe3541f32a8d9fe58cbc/Peak_card__1_.png',
  deviceLife: 'https://images.ctfassets.net/rbzqg6pelgqa/4jiLfkO6RPmVBkcMtN3jRX/948f4061574b764a2897ae681988bbdc/Life_card__3_.png',
  // Accessories
  leatherLuxe: 'https://images.ctfassets.net/rbzqg6pelgqa/7GbUUq5XAVbR0XxHZb4X7S/6af554f2573a60cb23ed28976fc33b5c/Leatherluxe_ways_to_wear__3_.webp',
  // Athletes
  cristiano: 'https://images.ctfassets.net/rbzqg6pelgqa/5I95JPiLeukka1icX19lkP/e67704d468c036f5fe152fe463ec45a0/Cristiano_partners_Desktop.png',
  aryna: 'https://images.ctfassets.net/rbzqg6pelgqa/78qqCZQIn8aafvMX4cBD4S/68a262b5dc5f181901d1204aad369583/Aryna_partnership_desktop__1_.png',
  nelly: 'https://images.ctfassets.net/rbzqg6pelgqa/4rMBQp6YVyTo3IJ7HMfVaL/9643c3faa0083b3668e26b5e469edc2b/Nelly_partners_Desktop__1_.png',
  shaCarri: 'https://images.ctfassets.net/rbzqg6pelgqa/6IM4wyJQ2daXnYKfQ6vdtv/24ec7cb0a62eefe36516e3fdb072f57d/Shacarri_partners_Desktop__1_.png',
  patrick: 'https://images.ctfassets.net/rbzqg6pelgqa/6wS2w5mR9XGRUh4osNW5Eq/ea5c1a34f05f5f8c79c80839eb694452/Patrick_partners_Desktop.png',
  virgil: 'https://images.ctfassets.net/rbzqg6pelgqa/45GgdvKxhvzOCnL7FVfI1z/a93e2c6c6abb437ffb30fc201d397a21/20240929_WHOOP_VVD_LOUIS_BAMFORD_WHOOP_KITCHEN_VIRGIL_193__1___1_.webp',
  stef: 'https://images.ctfassets.net/rbzqg6pelgqa/7kwNqKKE3pVRgpM42GFDNG/60242625a576452c62eec021630a46aa/stef_partners.webp',
  diplo: 'https://images.ctfassets.net/rbzqg6pelgqa/9zCbDPPYcGjnIFiFWtI9I/69ea19d07a1ccc798827a5d8cd9f6865/diplo_partners.webp',
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const hrData = [
  { t: '6a', v: 54 }, { t: '8a', v: 72 }, { t: '10a', v: 88 },
  { t: '12p', v: 95 }, { t: '2p', v: 82 }, { t: '4p', v: 112 },
  { t: '6p', v: 105 }, { t: '8p', v: 78 }, { t: '10p', v: 60 },
];
const weeklyHRV = [
  { d: 'M', v: 52 }, { d: 'T', v: 55 }, { d: 'W', v: 49 },
  { d: 'T', v: 61 }, { d: 'F', v: 58 }, { d: 'S', v: 63 }, { d: 'S', v: 58 },
];
const strainData = [
  { d: 'M', v: 8.2 }, { d: 'T', v: 14.5 }, { d: 'W', v: 11.3 },
  { d: 'T', v: 16.2 }, { d: 'F', v: 9.8 }, { d: 'S', v: 13.4 }, { d: 'S', v: 12.4 },
];
const sleepStages = [
  { s: '10p', dp: 0, rm: 0, lt: 2 }, { s: '11p', dp: 2, rm: 0, lt: 0 },
  { s: '12a', dp: 3, rm: 0, lt: 0 }, { s: '1a', dp: 3, rm: 0, lt: 0 },
  { s: '2a', dp: 1, rm: 2, lt: 0 }, { s: '3a', dp: 0, rm: 2, lt: 1 },
  { s: '4a', dp: 0, rm: 1, lt: 2 }, { s: '5a', dp: 0, rm: 2, lt: 1 },
  { s: '6a', dp: 0, rm: 1, lt: 2 }, { s: '7a', dp: 0, rm: 0, lt: 1 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DarkTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white">
      <p className="text-white/40 mb-1">{label}</p>
      {payload.map((p: any, i: number) => <p key={i} className="font-bold">{p.name}: {p.value}</p>)}
    </div>
  );
}

function LightTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-black/10 rounded-xl px-3 py-2 text-xs text-black shadow-lg">
      <p className="text-black/40 mb-1">{label}</p>
      {payload.map((p: any, i: number) => <p key={i} className="font-bold">{p.name}: {p.value}</p>)}
    </div>
  );
}

function RecoveryRing({ score, size = 110, dark = true }: { score: number; size?: number; dark?: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [anim, setAnim] = useState(0);
  const R = (size - 14) / 2;
  const circ = 2 * Math.PI * R;
  const color = score >= 67 ? '#22c55e' : score >= 34 ? '#eab308' : '#ef4444';

  useEffect(() => {
    if (inView) { const t = setTimeout(() => setAnim(score), 400); return () => clearTimeout(t); }
  }, [inView, score]);

  return (
    <div ref={ref} style={{ width: size, height: size }} className="relative flex items-center justify-center flex-shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'} strokeWidth="7" />
        <motion.circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (anim / 100) * circ }}
          transition={{ duration: 1.8, ease: [0.33, 1, 0.68, 1] }} />
      </svg>
      <div className="absolute text-center">
        <motion.div className="text-2xl font-black" style={{ color }}
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}>
          {anim}%
        </motion.div>
        <div className={`text-[9px] uppercase tracking-wider ${dark ? 'text-white/30' : 'text-black/30'}`}>Recovery</div>
      </div>
    </div>
  );
}

function StatItem({ v, l, delay = 0, dark = true }: { v: string; l: string; delay?: number; dark?: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} className="text-center"
      initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay }}>
      <div className={`text-4xl md:text-5xl font-black ${dark ? 'text-white' : 'text-black'}`}>{v}</div>
      <div className={`text-xs uppercase tracking-widest mt-1 font-bold ${dark ? 'text-white/35' : 'text-black/35'}`}>{l}</div>
    </motion.div>
  );
}

function ScrollBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return <motion.div className="fixed top-16 left-0 right-0 h-[2px] bg-white z-40 origin-left" style={{ scaleX }} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IBioPage() {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 180]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div className="overflow-x-hidden">
      <ScrollBar />

      {/* ─────────────────────────────────────────────────────────────────
          HERO — BLACK
      ───────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center bg-black text-white overflow-hidden" ref={heroRef}>
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <img src={IMGS.hero}
            alt="" className="w-full h-full object-cover opacity-30 scale-110" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        </motion.div>

        <motion.div className="relative max-w-7xl mx-auto px-6 pt-16 pb-28 grid md:grid-cols-2 gap-16 items-center w-full"
          style={{ opacity: heroOpacity }}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <p className="text-[11px] font-black tracking-[0.3em] uppercase text-white/30 mb-6">The Biometric Engine</p>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-white">
              The wearable<br />
              <span className="text-white/40">designed for</span><br />
              lasting progress.
            </h1>
            <p className="text-white/50 mt-7 text-xl leading-relaxed max-w-lg">
              i bio combines 24/7 health insights with personalized coaching to help you improve how you sleep, train, and feel — starting day one.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link href="/ibio/membership">
                <motion.button className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full flex items-center gap-2 text-sm"
                  whileHover={{ scale: 1.03, boxShadow: '0 15px 50px rgba(255,255,255,0.2)' }} whileTap={{ scale: 0.97 }}>
                  Join Free <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link href="/ibio/device">
                <motion.button className="px-8 py-4 border border-white/20 text-white font-black uppercase tracking-widest rounded-full text-sm hover:border-white/40 transition-colors"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  View Device
                </motion.button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-white/[0.08]">
              {[{ icon: Shield, l: '1-Month Free Trial' }, { icon: Award, l: 'PHD-Backed Science' }, { icon: Users, l: '500K+ Members' }].map(b => (
                <div key={b.l} className="flex items-center gap-2">
                  <b.icon size={13} className="text-white/30" />
                  <span className="text-[11px] text-white/35 font-bold">{b.l}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Live card */}
          <motion.div className="flex flex-col items-center gap-8"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.3 }}>
            <motion.div className="w-full max-w-xs" animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
              <img src={IMGS.devicePeak} alt="i bio Band" className="w-full h-auto drop-shadow-2xl" />
            </motion.div>
            <div className="w-full max-w-sm bg-white/[0.05] border border-white/[0.1] rounded-3xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">Live · Today</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[10px] font-bold text-white/40">Synced</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/[0.06] rounded-2xl p-3 flex flex-col items-center">
                  <RecoveryRing score={78} size={76} dark />
                </div>
                <div className="bg-white/[0.06] rounded-2xl p-3 flex flex-col items-center justify-center">
                  <Moon size={18} className="text-white/40 mb-1.5" />
                  <p className="text-xl font-black text-white">82</p>
                  <p className="text-[9px] text-white/25 uppercase">Sleep</p>
                </div>
                <div className="bg-white/[0.06] rounded-2xl p-3 flex flex-col items-center justify-center">
                  <Zap size={18} className="text-white/40 mb-1.5" />
                  <p className="text-xl font-black text-white">12.4</p>
                  <p className="text-[9px] text-white/25 uppercase">Strain</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.06] rounded-xl px-3 py-2.5">
                  <p className="text-[9px] text-white/25 uppercase">HRV</p>
                  <p className="text-base font-black text-white">58 <span className="text-xs text-white/30">ms</span></p>
                </div>
                <div className="bg-white/[0.06] rounded-xl px-3 py-2.5">
                  <p className="text-[9px] text-white/25 uppercase">Stress</p>
                  <p className="text-base font-black text-white/80">Low</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-5 h-8 border border-white/15 rounded-full flex justify-center pt-1.5">
            <motion.div className="w-0.5 h-2 bg-white/20 rounded-full" animate={{ opacity: [1, 0], y: [0, 8] }} transition={{ duration: 1.5, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          STATS BAND — WHITE
      ───────────────────────────────────────────────────────────────── */}
      <section className="py-14 bg-white text-black border-y border-black/[0.07]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem v="500K+" l="Active Members" delay={0} dark={false} />
          <StatItem v="8B+" l="Hours Monitored" delay={0.1} dark={false} />
          <StatItem v="93%" l="See Results in 30 Days" delay={0.2} dark={false} />
          <StatItem v="47+" l="PhD Researchers" delay={0.3} dark={false} />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          HEALTH FEATURES — WHITE
      ───────────────────────────────────────────────────────────────── */}
      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-4">Complete Health Intelligence</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-black">
              Get a complete picture<br /><span className="text-black/30">of your health.</span>
            </h2>
            <p className="text-black/50 mt-5 text-lg max-w-2xl">
              With 24/7 monitoring across sleep, strain, stress, and heart health, i bio gives you a complete view — so you can make smarter decisions every day.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard icon={Heart} title="Quantify recovery" desc="Know exactly how ready your body is to perform — every morning." href="/ibio/recovery" delay={0} />
            <FeatureCard icon={Wind} title="Extend your prime" desc="Track your biological age and slow your Pace of Aging." href="/ibio/healthspan" delay={0.08} />
            <FeatureCard icon={Moon} title="Optimize sleep" desc="Understand sleep quality, not just quantity. Get a nightly coaching plan." href="/ibio/sleep" delay={0.16} />
            <FeatureCard icon={Zap} title="Measure every effort" desc="Quantify cardiovascular load across every activity, 24/7." href="/ibio/strain" delay={0.24} />
            <FeatureCard icon={Activity} title="Heart health" desc="Medical-grade ECG. Detect AFib and irregular rhythms on your wrist." href="/ibio/heart-health" delay={0.32} />
            <FeatureCard icon={Brain} title="Stress monitor" desc="Your autonomic nervous system reveals stress you can't feel. Track it." href="/ibio/stress" delay={0.4} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          RECOVERY FEATURE — BLACK
      ───────────────────────────────────────────────────────────────── */}
      <section className="bg-black text-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-12 h-12 rounded-2xl bg-white/[0.07] border border-white/10 flex items-center justify-center mb-7">
              <Heart size={22} className="text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">Quantify how your<br />body is feeling.</h2>
            <p className="text-white/50 mt-5 text-lg leading-relaxed">Your daily recovery score synthesizes HRV, resting heart rate, sleep performance, and respiratory rate into one actionable number — so you always know how hard to push.</p>
            <Link href="/ibio/recovery">
              <motion.div className="inline-flex items-center gap-2 mt-8 font-black text-sm text-white/40 hover:text-white transition-colors" whileHover={{ x: 4 }}>
                Learn more about Recovery <ArrowRight size={14} />
              </motion.div>
            </Link>
          </motion.div>
          <motion.div className="relative"
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <img src={IMGS.recovery} alt="Recovery dashboard" className="w-full h-auto rounded-3xl shadow-2xl" />
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          SLEEP FEATURE — WHITE
      ───────────────────────────────────────────────────────────────── */}
      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div className="relative order-2 md:order-1"
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <img src={IMGS.sleep} alt="Sleep tracking dashboard" className="w-full h-auto rounded-3xl shadow-xl" />
          </motion.div>
          <motion.div className="order-1 md:order-2" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-12 h-12 rounded-2xl bg-black/[0.05] border border-black/[0.1] flex items-center justify-center mb-7">
              <Moon size={22} className="text-black" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-black leading-tight">Optimize your sleep.</h2>
            <p className="text-black/50 mt-5 text-lg leading-relaxed">Not just how long you sleep — but how well. i bio tracks every stage and gives you a personal sleep coach that tells you exactly when to go to bed.</p>
            <Link href="/ibio/sleep">
              <motion.div className="inline-flex items-center gap-2 mt-8 font-black text-sm text-black/40 hover:text-black transition-colors" whileHover={{ x: 4 }}>
                Learn more about Sleep <ArrowRight size={14} />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          STRAIN FEATURE — BLACK
      ───────────────────────────────────────────────────────────────── */}
      <section className="bg-black text-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-12 h-12 rounded-2xl bg-white/[0.07] border border-white/10 flex items-center justify-center mb-7">
              <Zap size={22} className="text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">Measure the impact<br />of every step and rep.</h2>
            <p className="text-white/50 mt-5 text-lg leading-relaxed">i bio's cardiovascular strain score quantifies every physical effort on a 0–21 scale. Know when to push and when to hold back.</p>
            <Link href="/ibio/strain">
              <motion.div className="inline-flex items-center gap-2 mt-8 font-black text-sm text-white/40 hover:text-white transition-colors" whileHover={{ x: 4 }}>
                Learn more about Strain <ArrowRight size={14} />
              </motion.div>
            </Link>
          </motion.div>
          <motion.div className="relative"
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <img src={IMGS.strain} alt="Strain tracking" className="w-full h-auto rounded-3xl shadow-2xl" />
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          HEART HEALTH FEATURE — WHITE
      ───────────────────────────────────────────────────────────────── */}
      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div className="relative order-2 md:order-1"
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <img src={IMGS.heartHealth} alt="Heart health monitoring" className="w-full h-auto rounded-3xl shadow-xl" />
          </motion.div>
          <motion.div className="order-1 md:order-2" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-12 h-12 rounded-2xl bg-black/[0.05] border border-black/[0.1] flex items-center justify-center mb-7">
              <Activity size={22} className="text-black" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-black leading-tight">Stay connected to<br />your heart health.</h2>
            <p className="text-black/50 mt-5 text-lg leading-relaxed">Medical-grade ECG. Irregular heart rhythm detection. Real-time blood pressure insights. Clinical-grade cardiac monitoring — on your wrist, available 24/7.</p>
            <Link href="/ibio/heart-health">
              <motion.div className="inline-flex items-center gap-2 mt-8 font-black text-sm text-black/40 hover:text-black transition-colors" whileHover={{ x: 4 }}>
                Learn more about Heart Health <ArrowRight size={14} />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          HEALTHSPAN FEATURE — WHITE
      ───────────────────────────────────────────────────────────────── */}
      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-12 h-12 rounded-2xl bg-black/[0.05] border border-black/[0.1] flex items-center justify-center mb-7">
              <Wind size={22} className="text-black" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-black leading-tight">Extend your prime<br />for years to come.</h2>
            <p className="text-black/50 mt-5 text-lg leading-relaxed">Healthspan goes beyond fitness — it tracks your biological age, Pace of Aging, and longevity factors so you can actually slow down the clock. Know your i bio Age.</p>
            <Link href="/ibio/healthspan">
              <motion.div className="inline-flex items-center gap-2 mt-8 font-black text-sm text-black/40 hover:text-black transition-colors" whileHover={{ x: 4 }}>
                Learn more about Healthspan <ArrowRight size={14} />
              </motion.div>
            </Link>
          </motion.div>
          <motion.div className="relative"
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <img src={IMGS.healthspan} alt="Healthspan — biological age tracking" className="w-full h-auto rounded-3xl shadow-xl" />
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          DEVICE — BLACK
      ───────────────────────────────────────────────────────────────── */}
      <section className="bg-black text-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/30 mb-3">The Device</p>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white">Built to be<br />worn 24/7.</h2>
            <p className="text-white/45 mt-5 text-lg leading-relaxed">A screen-free design means no pings, distractions, or unnecessary bells and whistles. Just pure, continuous biometric capture.</p>
            <div className="mt-8 space-y-4">
              {[
                { label: 'Zero distractions', desc: 'No screen. No notifications.' },
                { label: '14+ day battery', desc: 'Never stop wearing it to charge.' },
                { label: '7 sensors always-on', desc: 'HR, HRV, SpO2, Temp, ECG & more.' },
                { label: 'Waterproof 50m', desc: 'Sleep, swim, shower, train.' },
              ].map(s => (
                <div key={s.label} className="flex items-start gap-3">
                  <Check size={14} className="text-white/40 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-black text-white">{s.label}</span>
                    <span className="text-sm text-white/35 ml-2">{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/ibio/device">
              <motion.div className="inline-flex items-center gap-2 mt-8 font-black text-sm text-white/40 hover:text-white transition-colors" whileHover={{ x: 4 }}>
                Full device specs <ArrowRight size={14} />
              </motion.div>
            </Link>
          </motion.div>
          <motion.div className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            {/* LeatherLuxe real product photo */}
            <div className="relative rounded-3xl overflow-hidden">
              <img src={IMGS.leatherLuxe} alt="i bio Band — LeatherLuxe" className="w-full h-72 object-cover" />
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-1.5">
                <p className="text-[10px] text-white/70 font-black tracking-wider">LEATHERLUXE EDITION</p>
              </div>
            </div>
            {/* Membership tier device images */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { img: IMGS.deviceOne, label: 'i bio Core' },
                { img: IMGS.devicePeak, label: 'i bio Pro' },
                { img: IMGS.deviceLife, label: 'i bio Elite' },
              ].map(d => (
                <div key={d.label} className="text-center">
                  <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
                    <img src={d.img} alt={d.label} className="w-full h-32 object-cover" />
                  </div>
                  <p className="text-[9px] text-white/35 uppercase tracking-wider mt-2 font-bold">{d.label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Sport Flex', 'SuperKnit', 'LeatherLuxe', 'Core Knit', 'Cloud Knit'].map(s => (
                <span key={s} className="text-[10px] px-3 py-1.5 rounded-full border border-white/[0.1] text-white/30 hover:border-white/30 hover:text-white transition-all cursor-pointer">{s}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          MEMBERSHIP — LIGHT GRAY
      ───────────────────────────────────────────────────────────────── */}
      <section className="bg-[#F5F5F5] text-black py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-3">Choose a Membership</p>
            <div className="grid md:grid-cols-2 gap-8 items-end">
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-black">Memberships<br /><span className="text-black/30">made for you.</span></h2>
              <p className="text-black/50 text-lg leading-relaxed">Each membership includes a device, a charger, and a unique set of features — choose the one that best fits you.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'i bio Core', price: '79', desc: 'Professional-grade fitness insights.', features: ['Recovery, Sleep & Strain', 'HRV + Resting HR', 'Sleep Stage Tracking', 'Daily Coaching'], tag: null, img: IMGS.deviceOne },
              { name: 'i bio Pro', price: '149', desc: 'Advanced health, fitness & longevity.', features: ['Everything in Core', 'ECG + Irregular Heart Rhythm', 'Blood Pressure Insights', 'VO2 Max & HR Zones', 'Stress Monitoring'], tag: 'MOST POPULAR', img: IMGS.devicePeak },
              { name: 'i bio Elite', price: '249', desc: 'The ultimate biometric membership.', features: ['Everything in Pro', 'Advanced Labs (65+ biomarkers)', 'Healthspan Score', 'i fit Priority Matching', 'Lifetime Warranty'], tag: 'ULTIMATE', img: IMGS.deviceLife },
            ].map((p, i) => {
              const isPop = p.name === 'i bio Pro';
              return (
                <motion.div key={p.name}
                  className={`relative rounded-3xl border flex flex-col overflow-hidden ${isPop ? 'bg-black border-black' : 'bg-white border-black/[0.1]'}`}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}>
                  {p.tag && (
                    <div className={`absolute top-4 right-4 text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full z-10 ${isPop ? 'bg-white/10 text-white/50 border border-white/15' : 'bg-black/[0.06] text-black/40 border border-black/10'}`}>
                      {p.tag}
                    </div>
                  )}
                  {/* Device image */}
                  <div className={`w-full h-48 flex items-center justify-center ${isPop ? 'bg-white/[0.04]' : 'bg-black/[0.03]'}`}>
                    <img src={p.img} alt={p.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-7 flex-1">
                    <h3 className={`text-xl font-black mb-1 ${isPop ? 'text-white' : 'text-black'}`}>{p.name}</h3>
                    <p className={`text-xs mb-5 ${isPop ? 'text-white/30' : 'text-black/30'}`}>{p.desc}</p>
                    <div className="flex items-end gap-1 mb-7">
                      <span className={`text-4xl font-black ${isPop ? 'text-white' : 'text-black'}`}>${p.price}</span>
                      <span className={`text-sm mb-1 ${isPop ? 'text-white/30' : 'text-black/30'}`}>/mo</span>
                    </div>
                    <div className="space-y-3">
                      {p.features.map(f => (
                        <div key={f} className="flex items-start gap-2.5">
                          <Check size={12} className={`mt-0.5 flex-shrink-0 ${isPop ? 'text-white/50' : 'text-black/40'}`} />
                          <span className={`text-sm ${isPop ? 'text-white/60' : 'text-black/55'}`}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-7 pt-0">
                    <Link href="/ibio/membership">
                      <motion.button
                        className={`w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-colors ${isPop ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/80'}`}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                        Join {p.name.split(' ')[2]}
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Free trial banner */}
          <motion.div className="mt-8 bg-black rounded-3xl px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div>
              <p className="text-xs font-black tracking-widest text-white/30 uppercase mb-1">No other wearable lets you try before you buy</p>
              <h3 className="text-2xl font-black text-white">Start free. Choose later.</h3>
              <p className="text-white/35 mt-1 text-sm">1-month free trial. No commitment. Cancel anytime.</p>
            </div>
            <Link href="/ibio/membership">
              <motion.button className="flex-shrink-0 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full flex items-center gap-2 text-sm"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                Try i bio Free <ArrowRight size={15} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          ATHLETES — BLACK (like WHOOP's dark athlete showcase)
      ───────────────────────────────────────────────────────────────── */}
      <section className="bg-black text-white py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/30 mb-3">Backed by PHDs, Worn by Champions</p>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
              Whether you&apos;re #1 in the world<br /><span className="text-white/30">or on day 1 of your journey.</span>
            </h2>
          </div>

          {/* Featured athletes grid — like WHOOP's layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Cristiano Ronaldo', title: 'Football Legend & Global Icon', img: IMGS.cristiano },
              { name: 'Aryna Sabalenka', title: 'World No. 1 Tennis Player', img: IMGS.aryna },
              { name: "Sha'Carri Richardson", title: 'Track and Field Star', img: IMGS.shaCarri },
              { name: 'Patrick Mahomes', title: 'All-Star Quarterback', img: IMGS.patrick },
              { name: 'Nelly Korda', title: 'Golf Icon & Champion', img: IMGS.nelly },
              { name: 'Virgil van Dijk', title: 'Global Football Star', img: IMGS.virgil },
              { name: 'Stef Williams', title: 'Entrepreneur & Content Creator', img: IMGS.stef },
              { name: 'Diplo', title: 'World-Renown DJ & Producer', img: IMGS.diplo },
            ].map((a, i) => (
              <motion.div key={a.name}
                className="relative overflow-hidden rounded-2xl group aspect-[3/4]"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }} whileHover={{ scale: 1.02 }}>
                <img src={a.img} alt={a.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-black text-white leading-tight">{a.name}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{a.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          ADVANCED LABS — BLACK
      ───────────────────────────────────────────────────────────────── */}
      <section className="bg-black text-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase mb-4">Advanced Labs · Elite</p>
            <h2 className="text-5xl font-black tracking-tighter text-white">Put your health<br /><span className="text-white/35">into focus.</span></h2>
            <p className="text-white/45 mt-5 leading-relaxed text-lg">Analyze 65+ biomarkers alongside your 24/7 i bio data. Get clinician-reviewed results with next steps — all in one place.</p>
            <div className="mt-8 space-y-3">
              {['Analyze 65+ biomarkers alongside your 24/7 i bio data', 'Clinician-reviewed results with actionable next steps', 'See connections between lab results and daily habits', 'Encrypted and completely private'].map(t => (
                <div key={t} className="flex items-start gap-2.5">
                  <Check size={13} className="text-white/40 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white/55">{t}</span>
                </div>
              ))}
            </div>
            <Link href="/ibio/advanced-labs">
              <motion.button className="mt-8 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full flex items-center gap-2 text-sm"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                Explore Advanced Labs <ArrowRight size={15} />
              </motion.button>
            </Link>
          </motion.div>
          <motion.div className="relative"
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <img src={IMGS.advancedLabs} alt="Advanced Labs — blood biomarkers" className="w-full h-auto rounded-3xl shadow-2xl" />
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          i FIT BRIDGE — WHITE
      ───────────────────────────────────────────────────────────────── */}
      <section className="bg-white text-black py-20 px-6 border-t border-black/[0.06]">
        <div className="max-w-7xl mx-auto">
          <motion.div className="bg-black rounded-3xl overflow-hidden relative"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="relative px-10 py-14 flex flex-col md:flex-row items-center justify-between gap-10">
              <div>
                <p className="text-[10px] font-black tracking-[0.25em] text-white/30 uppercase mb-3">i bio × i fit</p>
                <h2 className="text-4xl font-black tracking-tighter text-white">Your data. Your trainer.<br /><span className="text-white/40">One ecosystem.</span></h2>
                <p className="text-white/40 mt-3 max-w-md">Connect i bio to i fit and your coach sees your biometrics in real-time. Low recovery? Your session is adjusted before you wake up.</p>
              </div>
              <Link href="/ifit">
                <motion.button className="flex-shrink-0 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full flex items-center gap-2 text-sm"
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  Open i fit <ArrowRight size={15} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          FINAL CTA — BLACK
      ───────────────────────────────────────────────────────────────── */}
      <section className="bg-black text-white py-32 px-6 text-center">
        <motion.div className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[11px] font-black tracking-[0.3em] uppercase text-white/25 mb-6">Start Today</p>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-white">
            Your body<br />has answers.
          </h2>
          <p className="text-white/35 mt-6 text-xl">1-month free trial. No commitment. Cancel anytime.</p>
          <Link href="/ibio/membership">
            <motion.button className="mt-10 px-12 py-5 bg-white text-black font-black uppercase tracking-widest rounded-full text-sm inline-flex items-center gap-2"
              whileHover={{ scale: 1.04, boxShadow: '0 25px 70px rgba(255,255,255,0.15)' }} whileTap={{ scale: 0.97 }}>
              Join Free for 1 Month <ArrowRight size={17} />
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
