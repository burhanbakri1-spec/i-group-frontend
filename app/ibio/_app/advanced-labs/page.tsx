'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, ChevronDown, FlaskConical, Microscope, Dna, Lock, Star, Upload, Shield } from 'lucide-react';
import Link from 'next/link';

const biomarkerCategories = [
  {
    id: 'hormonal',
    label: 'Hormones',
    icon: Dna,
    desc: 'Uncover how hormones may influence recovery and performance',
    markers: ['Cortisol', 'Estradiol', 'Testosterone (Total)', 'Free Testosterone', 'Thyroid Stimulating Hormone (TSH)', 'T3 (Triiodothyronine)', 'T4 (Thyroxine)', 'DHEA-S', 'Progesterone', 'LH', 'FSH', 'Prolactin'],
  },
  {
    id: 'heart',
    label: 'Heart Health',
    icon: FlaskConical,
    desc: 'Connect the dots to long-term cardiovascular health',
    markers: ['Total Cholesterol', 'HDL Cholesterol', 'LDL Cholesterol', 'Triglycerides', 'Cholesterol/HDL Ratio', 'Apolipoprotein B (ApoB)', 'Apolipoprotein A1 (ApoA1)', 'hs-CRP', 'Homocysteine', 'Lipoprotein(a)', 'Non-HDL Cholesterol'],
  },
  {
    id: 'metabolic',
    label: 'Metabolic Health',
    icon: Microscope,
    desc: 'See how your body stores and uses energy',
    markers: ['Hemoglobin A1c (HbA1c)', 'Fasting Glucose', 'Fasting Insulin', 'HOMA-IR', 'C-Peptide', 'ApoB / ApoA1 Ratio', 'eGFR (kidney function)', 'Creatinine', 'BUN', 'Uric Acid'],
  },
  {
    id: 'sleep',
    label: 'Sleep',
    icon: FlaskConical,
    desc: 'See what may be disrupting your sleep quality',
    markers: ['Cortisol', 'Red Blood Cell Count', 'Calcium', 'Ferritin', 'Magnesium', 'Melatonin proxy', 'TSH', 'Iron'],
  },
  {
    id: 'inflammation',
    label: 'Inflammation',
    icon: Dna,
    desc: 'Flag potential hidden triggers of internal stress',
    markers: ['hs-CRP', 'White Blood Cell Count', 'Basophil', 'Lymphocyte', 'Neutrophil', 'Eosinophil', 'Monocyte', 'Vitamin D (25-OH)', 'Ferritin', 'IL-6 proxy'],
  },
  {
    id: 'fitness',
    label: 'Fitness',
    icon: Microscope,
    desc: 'Reveal how your body adapts to training stress',
    markers: ['Hematocrit', 'Hemoglobin', 'RBC Count', 'Ferritin', 'Free Testosterone', 'Creatine Kinase', 'Lactate Dehydrogenase', 'Cortisol', 'IGF-1'],
  },
  {
    id: 'nutrients',
    label: 'Nutrients',
    icon: FlaskConical,
    desc: 'Find gaps that may impact energy and immunity',
    markers: ['Vitamin D (25-OH)', 'Vitamin B12', 'Folate', 'Iron', 'Ferritin', 'Calcium', 'Magnesium', 'Zinc', 'Sodium', 'Potassium', 'Phosphorus', 'Total Protein'],
  },
  {
    id: 'cognitive',
    label: 'Cognitive',
    icon: Dna,
    desc: 'Discover signals connected to brain health and performance',
    markers: ['Vitamin D', 'Cortisol', 'RBC Count', 'TSH', 'Omega-3 Index', 'Homocysteine', 'Folate', 'Vitamin B12'],
  },
];

const howItWorks = [
  { n: '01', title: 'Schedule a test', desc: 'Schedule at one of 2,000+ partner lab locations directly in the i bio app. Book in under 2 minutes.' },
  { n: '02', title: 'Get your results', desc: 'A licensed clinician reviews your 65+ biomarker results and begins to explain what\'s driving your health numbers.' },
  { n: '03', title: 'Take action', desc: 'Your data becomes a results-driven plan — focusing on daily habits that unlock better health and lasting change.' },
  { n: '04', title: 'See your progress', desc: 'Biomarkers take time to shift. Retest every 3–6 months to track how your habits are actually changing your biology.' },
];

const labPlans = [
  { tests: 1, freq: 'Year', price: 199, perTest: 199, tag: null, cta: 'START WITH 1 TEST' },
  { tests: 2, freq: 'Year', price: 349, perTest: 175, tag: 'MOST POPULAR', cta: 'START WITH 2 TESTS' },
  { tests: 4, freq: 'Year', price: 599, perTest: 150, tag: 'CONSISTENT RESULTS', cta: 'START WITH 4 TESTS' },
  { tests: 6, freq: 'Year', price: 899, perTest: 150, tag: null, cta: 'START WITH 6 TESTS' },
];

const testimonials = [
  { name: 'Francisco B.', title: 'i bio Elite Member', quote: 'Advanced Labs helped me finally understand myself at a deeper level. It changed how I train, how I rest, and how I show up every day.' },
  { name: 'Luigi A.', title: 'Wellness Practitioner', quote: 'Diet was always something I knew I should focus on, and this Advanced Labs experience is making me prioritize this in a concrete way.' },
  { name: 'Lee G.', title: 'i bio Elite Member', quote: 'Advanced Labs is better than any doctor. The insight it has given me — and the ability to go deep with insights — is revolutionary.' },
  { name: 'Stacey B.', title: 'Competitive Cyclist', quote: 'It gives you a true snapshot of your health at smaller intervals so you can make adjustments and see how they change your metrics.' },
];

const faqs = [
  { q: 'What is i bio Advanced Labs?', a: 'Advanced Labs combines 65+ blood biomarkers with your 24/7 i bio data for the most complete picture of your health. Lab testing is powered by our partner Quest® laboratories.' },
  { q: 'What biomarkers are included?', a: 'The full panel covers hormones, heart health, metabolic health, sleep, inflammation, fitness, nutrients, and cognitive performance — over 65 individual markers in total.' },
  { q: 'Who reviews my results?', a: 'A licensed clinician reviews every panel and prepares a personalized action plan. This is not an automated AI summary — it\'s a real clinical review.' },
  { q: 'How quickly will I get results?', a: 'Typically within 3–5 business days of your blood draw. You\'ll receive a notification in the i bio app when your clinician-reviewed results are ready.' },
  { q: 'Can I upload past lab results?', a: 'Yes. All i bio members can upload past lab results at no additional cost. For full clinician review and personalized plans, purchase tests through i bio.' },
  { q: 'Is Advanced Labs HSA/FSA eligible?', a: 'Yes. Advanced Labs testing is eligible for Health Savings Account (HSA) and Flexible Spending Account (FSA) reimbursement.' },
];

function FAQItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} className="border-b border-white/[0.06]"
      initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.05 }}>
      <button className="w-full flex items-center justify-between py-5 text-left gap-4 group" onClick={() => setOpen(!open)}>
        <span className="font-black text-sm group-hover:text-white/70 transition-colors">{q}</span>
        <ChevronDown size={15} className={`text-white/25 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
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

export default function AdvancedLabsPage() {
  const [activeCategory, setActiveCategory] = useState('hormonal');
  const activeCat = biomarkerCategories.find(c => c.id === activeCategory)!;

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative py-32 px-6 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/25 mb-5">Advanced Labs · Elite</p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              Get a clearer<br />picture of your<br /><span className="text-white/35">health.</span>
            </h1>
            <p className="text-white/45 mt-7 text-xl leading-relaxed max-w-lg">
              i bio Advanced Labs combines 65 biomarkers with thousands of daily data points for the most complete view of your health. Clinician-reviewed. HSA/FSA eligible.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link href="/ibio/membership">
                <motion.button className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full flex items-center gap-2 text-sm"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  Get Advanced Labs <ArrowRight size={16} />
                </motion.button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-white/[0.06]">
              {[
                { icon: Microscope, l: '65+ Biomarkers' },
                { icon: Shield, l: 'Clinician-Reviewed' },
                { icon: Lock, l: 'HSA / FSA Eligible' },
              ].map(b => (
                <div key={b.l} className="flex items-center gap-2">
                  <b.icon size={13} className="text-white/30" />
                  <span className="text-[11px] text-white/35 font-bold">{b.l}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Results card mock */}
          <motion.div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-7"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.3 }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Your Results · March 2026</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { l: 'Testosterone', v: '18.2', u: 'nmol/L', s: 'Optimal' },
                { l: 'Cortisol', v: '14.5', u: 'μg/dL', s: 'Normal' },
                { l: 'HbA1c', v: '5.2', u: '%', s: 'Optimal' },
                { l: 'Vitamin D', v: '38', u: 'ng/mL', s: 'Good' },
                { l: 'hs-CRP', v: '0.4', u: 'mg/L', s: 'Optimal' },
                { l: 'ApoB', v: '72', u: 'mg/dL', s: 'Optimal' },
              ].map(m => (
                <div key={m.l} className="bg-white/[0.04] rounded-xl px-4 py-3">
                  <p className="text-[9px] text-white/25 uppercase">{m.l}</p>
                  <p className="text-lg font-black">{m.v} <span className="text-[10px] text-white/25">{m.u}</span></p>
                  <p className="text-[9px] text-white/40 mt-0.5">{m.s}</p>
                </div>
              ))}
            </div>
            <div className="bg-white/[0.04] rounded-xl px-4 py-3 text-xs">
              <span className="text-white/30">Clinician note: </span>
              <span className="text-white/60 font-bold">ApoB optimal. Consider increasing Vitamin D supplementation. Testosterone trending +12% from last panel.</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* From lab to lasting results */}
      <section className="py-20 px-6 bg-[#F5F5F5] text-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-3">The Process</p>
            <h2 className="text-5xl font-black tracking-tighter">From lab results<br /><span className="text-black/45">to lasting results.</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {howItWorks.map((s, i) => (
              <motion.div key={s.n}
                className="bg-black/[0.02] border border-black/[0.08] rounded-3xl p-7 hover:border-black/15 transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-5xl font-black text-white/[0.08] mb-4">{s.n}</div>
                <h3 className="font-black text-base mb-2">{s.title}</h3>
                <p className="text-sm text-black/50 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Every biomarker chosen for impact */}
      <section className="py-20 px-6 bg-[#F5F5F5] text-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-3">The Panel</p>
            <h2 className="text-5xl font-black tracking-tighter">Every biomarker<br /><span className="text-black/45">chosen for impact.</span></h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Category selector */}
            <div className="space-y-2">
              {biomarkerCategories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all ${activeCategory === cat.id ? 'bg-black/[0.08] border border-black/15' : 'bg-black/[0.02] border border-black/[0.07] hover:border-black/10'}`}>
                    <Icon size={16} className={activeCategory === cat.id ? 'text-black' : 'text-black/40'} />
                    <div>
                      <p className={`text-sm font-black ${activeCategory === cat.id ? 'text-black' : 'text-black/55'}`}>{cat.label}</p>
                      <p className="text-[10px] text-black/30">{cat.markers.length} biomarkers</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Active category detail */}
            <div className="lg:col-span-2">
              <motion.div key={activeCategory} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="bg-black/[0.03] border border-black/[0.1] rounded-3xl p-8 h-full">
                <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">{activeCat.label}</p>
                <h3 className="text-2xl font-black mb-2">{activeCat.desc}</h3>
                <div className="grid grid-cols-2 gap-2 mt-6">
                  {activeCat.markers.map(m => (
                    <div key={m} className="flex items-center gap-2 py-1.5">
                      <div className="w-1 h-1 rounded-full bg-white/30 flex-shrink-0" />
                      <span className="text-sm text-black/60">{m}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Lab Plans Pricing */}
      <section className="py-20 px-6 bg-[#F5F5F5] text-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-3">Pricing</p>
            <h2 className="text-5xl font-black tracking-tighter">Choose the plan<br /><span className="text-black/45">that keeps you on track.</span></h2>
            <p className="text-black/45 mt-4">Requires an active i bio membership or free trial.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {labPlans.map((p, i) => {
              const isPop = p.tag === 'MOST POPULAR';
              return (
                <motion.div key={p.tests}
                  className={`relative rounded-3xl border flex flex-col ${isPop ? 'border-black/25 bg-black/[0.05]' : 'border-black/[0.09] bg-black/[0.02]'}`}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}>
                  {isPop && <div className="absolute top-0 left-0 right-0 h-px bg-white/40 rounded-t-3xl" />}
                  {p.tag && (
                    <div className="absolute top-4 right-4 text-[8px] font-black tracking-widest px-2 py-1 rounded-full bg-white/10 text-black/50 border border-black/10">
                      {p.tag}
                    </div>
                  )}
                  <div className="p-6 flex-1">
                    <p className="text-3xl font-black mb-0.5">{p.tests}</p>
                    <p className="text-sm text-black/40 mb-6">Tests / Year</p>
                    <div className="mb-1">
                      <span className="text-4xl font-black">${p.perTest}</span>
                      <span className="text-black/30 text-sm ml-1">per test</span>
                    </div>
                    <p className="text-xs text-black/30">${p.price} billed annually</p>
                  </div>
                  <div className="p-6 pt-0">
                    <motion.button
                      className={`w-full py-3.5 rounded-2xl font-black text-xs tracking-widest uppercase ${isPop ? 'bg-white text-black' : 'border border-black/15 text-black hover:border-white/30'} transition-colors`}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      {p.cta}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upload past tests */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div className="border border-white/[0.08] rounded-3xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-8"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0">
                <Upload size={20} className="text-white/50" />
              </div>
              <div>
                <h3 className="text-xl font-black">Upload past lab results at no cost</h3>
                <p className="text-white/35 mt-1 text-sm max-w-lg">All i bio members can upload past lab results completely free. For clinician review and personalized plans, purchase tests through i bio.</p>
              </div>
            </div>
            <motion.button className="flex-shrink-0 px-6 py-3.5 border border-white/15 font-black uppercase tracking-widest rounded-full text-sm hover:border-white/30 transition-colors"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              Upload Results
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-[#F5F5F5] text-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-3">Member Stories</p>
            <h2 className="text-4xl font-black tracking-tighter">Loved by members.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={t.name}
                className="bg-black/[0.02] border border-black/[0.08] rounded-3xl p-7"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}>
                  <div className="flex gap-0.5 mb-4">{[...Array(5)].map((_, k) => <Star key={k} size={11} fill="rgba(255,255,255,0.5)" stroke="none" />)}</div>
                  <p className="text-sm text-black/55 leading-relaxed mb-5">&quot;{t.quote}&quot;</p>
                  <p className="text-sm font-black">{t.name}</p>
                  <p className="text-[10px] text-black/30">{t.title}</p>
                </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-[#F5F5F5] text-black">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-black/30 mb-3">Common Questions</p>
            <h2 className="text-4xl font-black tracking-tighter">FAQ</h2>
          </div>
          {faqs.map((f, i) => <FAQItem key={f.q} q={f.q} a={f.a} i={i} />)}
        </div>
      </section>
    </div>
  );
}
