'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check, Battery, Bluetooth, Shield, Thermometer, Activity, Heart, Zap, Wind } from 'lucide-react';
import Link from 'next/link';
const DEVICE_IMGS = {
  peak: 'https://images.ctfassets.net/rbzqg6pelgqa/2L5W622UNiYxlnHE3hHGAL/d3443637b907fe3541f32a8d9fe58cbc/Peak_card__1_.png',
  one: 'https://images.ctfassets.net/rbzqg6pelgqa/36XNlGhqZe2tfTxqNq4owE/2f45b6dc0cca4426042405e1b98cfbe5/One_card__1_.webp',
  life: 'https://images.ctfassets.net/rbzqg6pelgqa/4jiLfkO6RPmVBkcMtN3jRX/948f4061574b764a2897ae681988bbdc/Life_card__3_.png',
  leatherLuxe: 'https://images.ctfassets.net/rbzqg6pelgqa/7GbUUq5XAVbR0XxHZb4X7S/6af554f2573a60cb23ed28976fc33b5c/Leatherluxe_ways_to_wear__3_.webp',
  whatsInBox: 'https://images.ctfassets.net/rbzqg6pelgqa/6urASW2zH71MKmBlM349Mw/4b6a9796aa663b40919d5726b56180bb/Peak_what-s_in_the_box.png',
};

const sensors = [
  { icon: Activity, label: 'Optical Heart Rate', detail: '4-LED photoplethysmography (PPG)', desc: 'Continuous heart rate at millisecond precision. Powers HRV, recovery, and strain tracking.' },
  { icon: Heart, label: 'ECG Electrodes', detail: 'Single-lead electrocardiogram', desc: 'Clinical-grade atrial fibrillation detection and irregular rhythm notifications.' },
  { icon: Thermometer, label: 'Skin Temperature', detail: 'Precision thermistor ±0.1°C', desc: 'Tracks overnight skin temperature variation. Correlates with illness, cycle phase, and stress.' },
  { icon: Wind, label: 'Accelerometer', detail: '3-axis, 100Hz sampling', desc: 'Detects movement, activity type, step count, and overnight restlessness.' },
  { icon: Zap, label: 'Pulse Oximeter', detail: 'SpO₂ red/infrared LEDs', desc: 'Blood oxygen saturation monitoring during sleep and activity.' },
  { icon: Battery, label: 'Altimeter', detail: 'Barometric pressure sensor', desc: 'Elevation tracking for outdoor activities, hiking, and altitude effects on recovery.' },
];

const specs = [
  { label: 'Battery Life', value: '14+ days (Gen 2)', sub: '5 days (Gen 1)' },
  { label: 'Waterproofing', value: 'IP68 — 50m' },
  { label: 'Charging', value: 'Wireless, on-body charging' },
  { label: 'Sensors', value: '7 active sensors' },
  { label: 'Connectivity', value: 'Bluetooth 5.0 + NFC' },
  { label: 'Memory', value: '30 days local storage' },
  { label: 'Weight', value: '13g (device only)' },
  { label: 'Display', value: 'None — screen-free' },
  { label: 'Strap Material', value: 'Medical-grade silicone' },
  { label: 'Compatibility', value: 'iOS 15+ / Android 10+' },
];

const bandStyles = [
  { name: 'Sport Flex', material: 'Durable TPU', color: '#111', detail: 'Lightweight and sweat-resistant for intense training.' },
  { name: 'SuperKnit', material: 'Woven textile', color: '#1a1a1a', detail: 'Breathable and flexible. Stays cool in warm climates.' },
  { name: 'Core Knit', material: 'Reinforced knit', color: '#0d0d0d', detail: 'Maximum durability for everyday wear.' },
  { name: 'Cloud Knit', material: 'Ultra-soft knit', color: '#1a1a1a', detail: 'The softest option. Ideal for sleep tracking.' },
  { name: 'LeatherLuxe', material: 'Italian leather', color: '#1a1a1a', detail: 'Crafted from premium materials for formal occasions.' },
  { name: 'i body Strap', material: 'Body-mount', color: '#111', detail: 'Wear on bicep, wrist, or torso. Medical-grade adhesive option.' },
];

const whatsInBox = [
  'i bio Band (your chosen style)',
  'Wireless charging puck',
  'USB-C charging cable (1m)',
  'Quick start guide',
  'Spare band links (size adjustment)',
];

export default function DevicePage() {
  const [activeView, setActiveView] = useState<'front' | 'back' | 'side'>('front');
  const [activeStyle, setActiveStyle] = useState(0);

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative min-h-[85vh] bg-black text-white flex items-center px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1920"
            alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/25 mb-5">i bio Band</p>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
              Built to be<br />worn 24/7.
            </h1>
            <p className="text-white/45 mt-6 text-xl leading-relaxed max-w-md">
              A screen-free design with always-on sensors. No distractions. No pings. Just pure, continuous biometric capture from the moment you put it on.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link href="/ibio/membership">
                <motion.button className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full flex items-center gap-2 text-sm"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  Get the Band <ArrowRight size={16} />
                </motion.button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-white/[0.06]">
              {[
                { v: '14+', l: 'Day Battery' },
                { v: '50m', l: 'Waterproof' },
                { v: '7', l: 'Sensors' },
                { v: '0', l: 'Screen' },
              ].map(s => (
                <div key={s.l}>
                  <div className="text-2xl font-black">{s.v}</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 3D-style device view */}
          <motion.div className="flex flex-col items-center gap-8"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }}>
            {/* View selector */}
            <div className="flex gap-2">
              {(['front', 'back', 'side'] as const).map(v => (
                <button key={v} onClick={() => setActiveView(v)}
                  className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${activeView === v ? 'bg-white text-black' : 'border border-white/15 text-white/30 hover:text-white'}`}>
                  {v}
                </button>
              ))}
            </div>
            <motion.div key={activeView} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }} className="flex flex-col items-center">
              <motion.div className="w-full max-w-xs" animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity }}>
                <img
                  src={activeView === 'front' ? DEVICE_IMGS.peak : activeView === 'back' ? DEVICE_IMGS.one : DEVICE_IMGS.life}
                  alt={`i bio Band — ${activeView}`}
                  className="w-full h-auto drop-shadow-2xl"
                />
              </motion.div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-4">
                {activeView === 'front' ? 'Front — Screen-free face' : activeView === 'back' ? 'Back — Sensor array' : 'Side profile — 13g device'}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sensor Breakdown */}
      <section className="py-20 px-6 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-3">Inside the Band</p>
            <h2 className="text-5xl font-black tracking-tighter">7 sensors. Always on.</h2>
            <p className="text-black/50 mt-4 max-w-xl mx-auto">Every sensor is optimized for continuous, clinical-grade measurement while you live your life.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sensors.map((s, i) => (
              <motion.div key={s.label}
                className="bg-black/[0.02] border border-black/[0.07] rounded-3xl p-7 hover:border-black/15 transition-all group"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * 0.08 }}>
                <div className="w-10 h-10 rounded-xl bg-black/[0.05] border border-black/[0.08] flex items-center justify-center mb-5 group-hover:bg-black/[0.08] transition-colors">
                  <s.icon size={18} className="text-black/50" />
                </div>
                <p className="font-black mb-0.5">{s.label}</p>
                <p className="text-[10px] font-bold text-black/35 mb-3 uppercase tracking-wider">{s.detail}</p>
                <p className="text-sm text-black/55 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Band Styles */}
      <section className="py-20 px-6 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-3">Accessories</p>
              <h2 className="text-5xl font-black tracking-tighter">One device,<br /><span className="text-black/35">endless ways to wear it.</span></h2>
              <p className="text-black/55 mt-5 leading-relaxed">Every band uses the same device pod. Switch styles in seconds — from the gym to the boardroom.</p>
              <div className="mt-8 space-y-3">
                {bandStyles.map((b, i) => (
                  <button key={b.name} onClick={() => setActiveStyle(i)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${activeStyle === i ? 'border-black/25 bg-black/[0.05]' : 'border-black/[0.08] hover:border-black/20'}`}>
                    <div>
                      <p className="font-black text-sm">{b.name}</p>
                      <p className="text-xs text-black/40">{b.material}</p>
                    </div>
                    {activeStyle === i && <Check size={14} className="text-black/50" />}
                  </button>
                ))}
              </div>
            </motion.div>
            <motion.div className="flex flex-col items-center gap-6"
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <motion.div key={activeStyle} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm rounded-3xl overflow-hidden">
                <img src={DEVICE_IMGS.leatherLuxe} alt={bandStyles[activeStyle].name}
                  className="w-full h-56 object-cover" />
              </motion.div>
              <div className="bg-black/[0.04] border border-black/[0.1] rounded-2xl px-6 py-4 text-center max-w-xs">
                <p className="font-black text-black">{bandStyles[activeStyle].name}</p>
                <p className="text-xs text-black/50 mt-1">{bandStyles[activeStyle].detail}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Full Specs */}
      <section className="py-20 px-6 bg-white text-black">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-3">Technical Specifications</p>
            <h2 className="text-5xl font-black tracking-tighter">Full specs.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {specs.map((s, i) => (
              <motion.div key={s.label}
                className="flex justify-between items-start border-b border-black/[0.08] py-4 gap-4"
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                <span className="text-sm text-black/50 font-bold">{s.label}</span>
                <div className="text-right">
                  <span className="text-sm font-black">{s.value}</span>
                  {s.sub && <p className="text-xs text-black/40 mt-0.5">{s.sub}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's in the box */}
      <section className="py-20 px-6 bg-white text-black">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-3">In the Box</p>
            <h2 className="text-4xl font-black tracking-tighter mb-8">Everything you need<br /><span className="text-black/35">from day one.</span></h2>
            <div className="space-y-4">
              {whatsInBox.map(item => (
                <div key={item} className="flex items-center gap-3">
                  <Check size={14} className="text-black/40 flex-shrink-0" />
                  <span className="text-sm font-bold text-black/65">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div className="relative rounded-3xl overflow-hidden"
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <img src={DEVICE_IMGS.whatsInBox} alt="What's in the box"
              className="w-full h-auto rounded-3xl shadow-2xl" />
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-black text-white border-t border-white/[0.05] text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/25 mb-4">Get Started</p>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter">Get the band.<br /><span className="text-white/35">Own your data.</span></h2>
          <p className="text-white/35 mt-5 text-lg">Included with every membership. 1-month free trial.</p>
          <Link href="/ibio/membership">
            <motion.button className="mt-8 px-10 py-5 bg-white text-black font-black uppercase tracking-widest rounded-full inline-flex items-center gap-2 text-sm"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              View Membership Plans <ArrowRight size={16} />
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
