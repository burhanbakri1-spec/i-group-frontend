'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, X, ArrowRight, Shield, Award, RefreshCw, Zap, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    id: 'core',
    name: 'i bio Core',
    tagline: 'Professional-grade fitness insights at our best price.',
    price: 79,
    yearlyPrice: 69,
    device: 'i bio Band Gen 1',
    battery: '5-day battery',
    tag: null,
    features: {
      'Core Biometrics': ['Recovery Score', 'Sleep Tracking & Score', 'Strain Tracking', 'Daily HRV', 'Resting Heart Rate', 'SpO2 Monitoring', 'Skin Temperature'],
      'Coaching & Insights': ['Daily Recovery Coaching', 'Sleep Coaching', 'Personalized Strain Targets', 'Weekly Performance Summary'],
      'Heart Health': ['Continuous Heart Rate', 'Heart Rate Zones'],
      'Advanced Features': [null, null, null, null],
      'Labs & Longevity': [null, null, null],
    },
  },
  {
    id: 'pro',
    name: 'i bio Pro',
    tagline: 'Advanced health, fitness, and longevity insights.',
    price: 149,
    yearlyPrice: 129,
    device: 'i bio Band Gen 2',
    battery: '14+ day battery',
    tag: 'MOST POPULAR',
    features: {
      'Core Biometrics': ['Recovery Score', 'Sleep Tracking & Score', 'Strain Tracking', 'Daily HRV', 'Resting Heart Rate', 'SpO2 Monitoring', 'Skin Temperature'],
      'Coaching & Insights': ['Daily Recovery Coaching', 'Sleep Coaching', 'Personalized Strain Targets', 'Weekly Performance Summary'],
      'Heart Health': ['Continuous Heart Rate', 'Heart Rate Zones', 'ECG (Atrial Fibrillation)', 'Irregular Heart Rhythm Notifications', 'Blood Pressure Insights (Beta)'],
      'Advanced Features': ['VO2 Max Estimate', 'Stress Monitor', "Women's Hormonal Insights", 'Respiratory Rate'],
      'Labs & Longevity': [null, null, null],
    },
  },
  {
    id: 'elite',
    name: 'i bio Elite',
    tagline: 'The ultimate biometric membership.',
    price: 249,
    yearlyPrice: 219,
    device: 'i bio Band Gen 2 Pro',
    battery: '14+ day battery',
    tag: 'ULTIMATE',
    features: {
      'Core Biometrics': ['Recovery Score', 'Sleep Tracking & Score', 'Strain Tracking', 'Daily HRV', 'Resting Heart Rate', 'SpO2 Monitoring', 'Skin Temperature'],
      'Coaching & Insights': ['Daily Recovery Coaching', 'Sleep Coaching', 'Personalized Strain Targets', 'Weekly Performance Summary'],
      'Heart Health': ['Continuous Heart Rate', 'Heart Rate Zones', 'ECG (Atrial Fibrillation)', 'Irregular Heart Rhythm Notifications', 'Blood Pressure Insights (Beta)'],
      'Advanced Features': ['VO2 Max Estimate', 'Stress Monitor', "Women's Hormonal Insights", 'Respiratory Rate'],
      'Labs & Longevity': ['Advanced Labs (65+ biomarkers)', 'Healthspan Score', 'Pace of Aging Tracking'],
    },
  },
];

const comparisonRows = [
  { category: 'Device', rows: [
    { label: 'Included Device', core: 'i bio Band Gen 1', pro: 'i bio Band Gen 2', elite: 'i bio Band Gen 2 Pro' },
    { label: 'Battery Life', core: '5 days', pro: '14+ days', elite: '14+ days' },
    { label: 'Waterproofing', core: '50m', pro: '50m', elite: '50m' },
    { label: 'Sensor Count', core: '4 sensors', pro: '7 sensors', elite: '7 sensors' },
  ]},
  { category: 'Recovery & Sleep', rows: [
    { label: 'Recovery Score', core: true, pro: true, elite: true },
    { label: 'HRV', core: true, pro: true, elite: true },
    { label: 'Resting Heart Rate', core: true, pro: true, elite: true },
    { label: 'Sleep Score', core: true, pro: true, elite: true },
    { label: 'Sleep Stage Breakdown', core: true, pro: true, elite: true },
    { label: 'Sleep Coaching', core: true, pro: true, elite: true },
    { label: 'SpO₂', core: true, pro: true, elite: true },
    { label: 'Skin Temperature', core: true, pro: true, elite: true },
  ]},
  { category: 'Strain & Fitness', rows: [
    { label: 'Strain Tracking', core: true, pro: true, elite: true },
    { label: 'Calorie Tracking', core: true, pro: true, elite: true },
    { label: 'HR Zones', core: true, pro: true, elite: true },
    { label: 'VO2 Max', core: false, pro: true, elite: true },
    { label: 'Respiratory Rate', core: false, pro: true, elite: true },
  ]},
  { category: 'Heart Health', rows: [
    { label: 'Continuous Heart Rate', core: true, pro: true, elite: true },
    { label: 'ECG', core: false, pro: true, elite: true },
    { label: 'Irregular Heart Rhythm Notifications', core: false, pro: true, elite: true },
    { label: 'Blood Pressure Insights', core: false, pro: true, elite: true },
  ]},
  { category: 'Wellbeing', rows: [
    { label: 'Stress Monitor', core: false, pro: true, elite: true },
    { label: "Women's Hormonal Insights", core: false, pro: true, elite: true },
  ]},
  { category: 'Labs & Longevity', rows: [
    { label: 'Advanced Labs (65+ biomarkers)', core: false, pro: false, elite: true },
    { label: 'Healthspan Score', core: false, pro: false, elite: true },
    { label: 'Pace of Aging', core: false, pro: false, elite: true },
    { label: 'i fit Priority Matching', core: false, pro: false, elite: true },
    { label: 'Family Sharing (4 members)', core: false, pro: false, elite: true },
  ]},
  { category: 'Support', rows: [
    { label: 'iOS & Android App', core: true, pro: true, elite: true },
    { label: 'Community Access', core: true, pro: true, elite: true },
    { label: 'Lifetime Warranty', core: false, pro: false, elite: true },
    { label: 'Priority Support', core: false, pro: false, elite: true },
  ]},
];

const benefits = [
  { icon: Shield, title: 'Lifetime warranty', desc: 'If you experience any issues with your i bio band, our team will resolve them or replace your device. Terms apply.' },
  { icon: RefreshCw, title: '1-month free trial', desc: 'Try i bio Elite free for 30 days with a certified pre-owned device. No credit card required to start.' },
  { icon: Award, title: 'PHD-backed science', desc: 'Every metric is validated by peer-reviewed research and our team of 47+ scientists and clinicians.' },
  { icon: Zap, title: 'Cancel anytime', desc: 'No contracts. No long-term commitments. Cancel in the app at any time with one tap.' },
];

const faqs = [
  { q: "What's included with my membership?", a: "Every i bio membership includes the device, a charger, a 1-month free trial, and access to the full app. The specific features available depend on your tier." },
  { q: "Can I upgrade my plan later?", a: "Yes. You can upgrade from Core to Pro or Elite at any time directly in the app. You'll be charged the pro-rated difference." },
  { q: "What happens after the free trial?", a: "After your 1-month free trial, you'll be automatically enrolled in the plan you selected. You can cancel before the trial ends with no charge." },
  { q: "Is the device included?", a: "Yes. Every membership includes an i bio Band. The generation depends on your tier — Gen 1 for Core, Gen 2 for Pro and Elite." },
  { q: "Can I share my membership?", a: "i bio Elite includes Family Sharing for up to 4 members. Each member gets their own profile and data within the same plan." },
  { q: "What is Advanced Labs?", a: "Advanced Labs combines 65+ blood biomarkers with your 24/7 i bio data for the most complete view of your health, with clinician-reviewed results." },
];

function Cell({ value }: { value: boolean | string | null }) {
  if (value === null || value === false) return <X size={14} className="mx-auto text-white/15" />;
  if (value === true) return <Check size={14} className="mx-auto text-white/70" />;
  return <span className="text-xs text-white/55 font-medium">{value}</span>;
}

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} className="border-b border-white/[0.06]"
      initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: index * 0.05 }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group">
        <span className="font-black text-sm group-hover:text-white/70 transition-colors">{q}</span>
        <ChevronDown size={16} className={`text-white/30 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.p className="text-sm text-white/45 leading-relaxed pb-5"
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          {a}
        </motion.p>
      )}
    </motion.div>
  );
}

export default function MembershipPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [activePlan, setActivePlan] = useState('pro');

  return (
    <div className="min-h-screen">
      {/* Hero — BLACK */}
      <section className="relative py-32 px-6 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.p className="text-[11px] font-black tracking-[0.3em] uppercase text-white/25 mb-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            Membership Plans
          </motion.p>
          <motion.h1 className="text-6xl md:text-8xl font-black tracking-tighter"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            Memberships made<br /><span className="text-white/35">for you.</span>
          </motion.h1>
          <motion.p className="text-white/40 mt-6 text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Each membership includes a device, a charger, and a unique set of features — choose the one that best fits your health and fitness goals.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div className="flex items-center justify-center gap-4 mt-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <span className={`text-sm font-bold ${billing === 'monthly' ? 'text-white' : 'text-white/30'}`}>Monthly</span>
            <button onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}
              className="w-12 h-6 rounded-full border border-white/20 bg-white/[0.05] relative flex items-center px-1">
              <motion.div className="w-4 h-4 bg-white rounded-full" animate={{ x: billing === 'yearly' ? 24 : 0 }} transition={{ type: 'spring', stiffness: 300 }} />
            </button>
            <span className={`text-sm font-bold ${billing === 'yearly' ? 'text-white' : 'text-white/30'}`}>
              Yearly <span className="text-xs text-white/30 ml-1">save ~15%</span>
            </span>
          </motion.div>
        </div>
      </section>

      {/* Plan Cards — WHITE */}
      <section className="px-6 pb-16 bg-[#F5F5F5] pt-16 text-black">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-5">
          {plans.map((plan, i) => {
            const isPop = plan.id === 'pro';
            const price = billing === 'yearly' ? plan.yearlyPrice : plan.price;
            const ref = useRef(null);
            const inView = useInView(ref, { once: true, margin: '-60px' });
            return (
              <motion.div key={plan.id} ref={ref}
                className={`relative rounded-3xl border flex flex-col ${isPop ? 'border-black/25 bg-black/[0.05]' : 'border-black/[0.09] bg-black/[0.02]'}`}
                initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}>
                {isPop && <div className="absolute top-0 left-0 right-0 h-px bg-white/40 rounded-t-3xl" />}
                {plan.tag && (
                  <div className="absolute top-4 right-4 text-[9px] font-black tracking-widest px-3 py-1 rounded-full bg-white/10 text-black/55 border border-black/10">
                    {plan.tag}
                  </div>
                )}
                <div className="p-8 flex-1">
                  <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-1">{plan.device}</p>
                  <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
                  <p className="text-xs text-black/40 mb-6">{plan.tagline}</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-5xl font-black">${price}</span>
                    <span className="text-black/30 text-sm mb-1.5">/month</span>
                  </div>
                  {billing === 'yearly' && (
                    <p className="text-xs text-black/30 mb-6">billed ${price * 12}/year</p>
                  )}
                  <div className="space-y-2 mt-8">
                    {Object.entries(plan.features).flatMap(([cat, items]) =>
                      items.filter(Boolean).map(f => (
                        <div key={f} className="flex items-start gap-2.5">
                          <Check size={12} className="text-black/50 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-black/60">{f}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="p-8 pt-0">
                  <motion.button
                    className={`w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase ${isPop ? 'bg-white text-black' : 'border border-black/15 text-black hover:border-white/35'} transition-colors`}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    Start with {plan.id.charAt(0).toUpperCase() + plan.id.slice(1)}
                  </motion.button>
                  <p className="text-[10px] text-black/25 text-center mt-3">Includes 1-month free trial</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Free Trial Banner — BLACK */}
      <section className="px-6 py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div className="border border-white/[0.08] rounded-3xl px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-8"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div>
              <p className="text-[10px] font-black tracking-[0.25em] uppercase text-white/25 mb-2">No other wearable lets you try before you buy</p>
              <h3 className="text-3xl md:text-4xl font-black tracking-tight">Start free. Choose later.</h3>
              <p className="text-white/35 mt-2">Get a 1-month free trial of Elite membership with a certified pre-owned i bio Band.</p>
            </div>
            <motion.button className="flex-shrink-0 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full flex items-center gap-2 text-sm"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              Try i bio Free <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Compare the lineup — WHITE */}
      <section className="px-6 pb-20 bg-white text-black pt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-3">Full Comparison</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Compare the lineup.</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/[0.1]">
                  <th className="text-left py-4 pr-6 w-[40%]" />
                  {plans.map(p => (
                    <th key={p.id} className={`py-4 px-4 text-center ${p.id === 'pro' ? 'text-black' : 'text-black/50'}`}>
                      <div className="text-xs font-black uppercase tracking-wider">{p.name}</div>
                      <div className="text-2xl font-black mt-1">${billing === 'yearly' ? p.yearlyPrice : p.price}</div>
                      <div className="text-[10px] text-black/30">/month</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(section => (
                  <React.Fragment key={section.category}>
                    <tr className="border-b border-black/[0.07]">
                      <td colSpan={4} className="py-4 pt-8">
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-black/30">{section.category}</span>
                      </td>
                    </tr>
                    {section.rows.map(row => (
                      <tr key={row.label} className="border-b border-black/[0.07] hover:bg-black/[0.02] transition-colors">
                        <td className="py-3.5 pr-6 text-sm text-black/55">{row.label}</td>
                        <td className="py-3.5 px-4 text-center"><Cell value={row.core} /></td>
                        <td className="py-3.5 px-4 text-center bg-black/[0.02]"><Cell value={row.pro} /></td>
                        <td className="py-3.5 px-4 text-center"><Cell value={row.elite} /></td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                <tr>
                  <td className="py-6" />
                  {plans.map(p => (
                    <td key={p.id} className="py-6 px-4 text-center">
                      <motion.button
                        className={`w-full py-3 rounded-2xl font-black text-xs tracking-widest uppercase ${p.id === 'pro' ? 'bg-white text-black' : 'border border-black/15 text-black'}`}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                        Join {p.id.charAt(0).toUpperCase() + p.id.slice(1)}
                      </motion.button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Benefits — BLACK */}
      <section className="px-6 pb-20 border-t border-white/[0.05] pt-16 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/25 mb-3">Every Membership</p>
            <h2 className="text-4xl font-black tracking-tighter">Benefits of your membership.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b, i) => {
              const ref = useRef(null);
              const inView = useInView(ref, { once: true });
              return (
                <motion.div key={b.title} ref={ref}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-7"
                  initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}>
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center mb-5">
                    <b.icon size={18} className="text-white/60" />
                  </div>
                  <h3 className="font-black mb-2">{b.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{b.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ — WHITE */}
      <section className="px-6 pb-20 border-t border-black/[0.06] pt-16 bg-white text-black">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-3">Common Questions</p>
            <h2 className="text-4xl font-black tracking-tighter">FAQ</h2>
          </div>
          {faqs.map((f, i) => <FAQItem key={f.q} q={f.q} a={f.a} index={i} />)}
        </div>
      </section>
    </div>
  );
}
