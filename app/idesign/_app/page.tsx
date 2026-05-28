'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowUpRight, Play, ChevronRight, MapPin, Phone, Mail, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@igroup/shared';

// ─── Image Collections ────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1920',
    label: 'R E S I D E N C E S',
    title: 'Where luxury meets living.',
  },
  {
    img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1920',
    label: 'I N T E R I O R S',
    title: 'Spaces that tell your story.',
  },
  {
    img: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1920',
    label: 'H O S P I T A L I T Y',
    title: 'Excellence in every detail.',
  },
  {
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1920',
    label: 'C O M M E R C I A L',
    title: 'Inspire. Engage. Elevate.',
  },
];

const COLLECTIONS = [
  {
    id: '01',
    title: 'Living Rooms',
    subtitle: 'SITTING SPACES',
    desc: 'Curated comfort and timeless elegance in every arrangement.',
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800',
  },
  {
    id: '02',
    title: 'Dining Rooms',
    subtitle: 'DINING SPACES',
    desc: 'Where every meal becomes a memorable occasion.',
    img: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=800',
  },
  {
    id: '03',
    title: 'Bedrooms',
    subtitle: 'PRIVATE RETREAT',
    desc: 'Sanctuary design for the deepest rest and personal luxury.',
    img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800',
  },
  {
    id: '04',
    title: 'Office Spaces',
    subtitle: 'WORK ENVIRONMENTS',
    desc: 'Productivity-driven design with an executive edge.',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800',
  },
  {
    id: '05',
    title: 'Kitchens',
    subtitle: 'CULINARY SPACES',
    desc: 'Form meets function in every detail of the kitchen.',
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800',
  },
  {
    id: '06',
    title: 'Wall Systems',
    subtitle: 'STORAGE & DISPLAY',
    desc: 'Architectural wall units that define the character of a room.',
    img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800',
  },
];

const PROJECTS = [
  {
    category: 'RESIDENCE',
    title: 'The Amara Villa',
    location: 'Ramallah, Palestine',
    desc: 'A 600m² private residence designed around natural light and the surrounding landscape.',
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=900',
    tags: ['Residential', 'Full Interior', 'Architecture'],
    year: '2025',
  },
  {
    category: 'HOTEL',
    title: 'The Meridian Hotel',
    location: 'Jerusalem, Palestine',
    desc: 'Turn-key luxury hotel concept — 120 rooms, lobby, spa, and F&B outlets.',
    img: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=900',
    tags: ['Hospitality', 'Turn-Key', 'FF&E'],
    year: '2024',
  },
  {
    category: 'RESTAURANT',
    title: 'Sahra Fine Dining',
    location: 'Gaza, Palestine',
    desc: 'A 300-cover restaurant space blending traditional motifs with contemporary form.',
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=900',
    tags: ['F&B', 'Brand Identity', 'Furniture'],
    year: '2025',
  },
  {
    category: 'OFFICE',
    title: 'i Group HQ',
    location: 'Nablus, Palestine',
    desc: 'The i Group headquarters — a workplace designed for focus, collaboration, and brand identity.',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=900',
    tags: ['Corporate', 'Full Fit-Out', 'MEP'],
    year: '2026',
  },
  {
    category: 'RETAIL',
    title: 'Luxe Boutique',
    location: 'Hebron, Palestine',
    desc: 'High-end retail concept with tactile material palette and theatrical lighting design.',
    img: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=900',
    tags: ['Retail', 'Visual Merchandising', 'Lighting'],
    year: '2024',
  },
  {
    category: 'YACHT',
    title: 'Horizon 48',
    location: 'Mediterranean Sea',
    desc: 'A 48-foot private yacht interior with custom joinery, stone surfaces, and marine-grade fabrics.',
    img: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=900',
    tags: ['Marine', 'Custom Furniture', 'Joinery'],
    year: '2025',
  },
];

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Discovery',
    desc: 'We begin by listening deeply — understanding your vision, lifestyle, and aspirations for the space.',
  },
  {
    num: '02',
    title: 'Concept',
    desc: 'Our designers craft mood boards, spatial layouts, and material palettes that bring your brief to life.',
  },
  {
    num: '03',
    title: 'Design',
    desc: 'Technical drawings, 3D visualizations, and final material specifications are developed and approved.',
  },
  {
    num: '04',
    title: 'Execute',
    desc: 'Our construction and fit-out teams deliver with precision — on time, on budget, with zero compromise.',
  },
  {
    num: '05',
    title: 'Deliver',
    desc: 'A fully completed space, styled to perfection. We hand over the keys — and your new world.',
  },
];

const STATS = [
  { v: '15+', l: 'Years of Excellence' },
  { v: '340+', l: 'Projects Delivered' },
  { v: '12', l: 'Countries' },
  { v: '100%', l: 'Client Satisfaction' },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ v, l, delay }: { v: string; l: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay }}
      className="text-center">
      <div className="text-5xl md:text-6xl font-black text-white tracking-tight">{v}</div>
      <div className="text-xs text-white/40 uppercase tracking-[0.2em] mt-2 font-bold">{l}</div>
    </motion.div>
  );
}

function CollectionCard({ item, index }: { item: typeof COLLECTIONS[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: index * 0.1 }}
      className="group relative cursor-pointer overflow-hidden"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="relative overflow-hidden aspect-[4/5]">
        <motion.img src={item.img} alt={item.title}
          className="w-full h-full object-cover"
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <AnimatePresence>
          {hovered && (
            <motion.div className="absolute inset-0 bg-black/30"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          )}
        </AnimatePresence>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-[9px] text-white/50 uppercase tracking-[0.3em] font-black mb-1">{item.subtitle}</p>
          <h3 className="text-xl font-black text-white tracking-tight">{item.title}</h3>
          <motion.p className="text-sm text-white/60 mt-1 leading-relaxed overflow-hidden"
            animate={{ maxHeight: hovered ? 60 : 0, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}>
            {item.desc}
          </motion.p>
        </div>
        <div className="absolute top-4 right-4">
          <span className="text-[11px] font-black text-white/30 tracking-widest">{item.id}</span>
        </div>
      </div>
    </motion.div>
  );
}

function ProcessStep({ step, index, isLast }: { step: typeof PROCESS_STEPS[0]; index: number; isLast: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: index * 0.15 }}
      className="relative border-l border-white/[0.08] pl-6 pb-12 md:pb-0 md:border-l-0 md:border-t md:pt-6 md:pl-0 md:pr-6">
      <div className="text-[11px] font-black tracking-[0.3em] text-white/25 mb-3">{step.num}</div>
      <h3 className="text-xl font-black text-white mb-3">{step.title}</h3>
      <p className="text-sm text-white/45 leading-relaxed">{step.desc}</p>
      {!isLast && <ChevronRight size={16} className="hidden md:block absolute -right-2 top-8 text-white/20" />}
    </motion.div>
  );
}

function TestimonialCard({ t, index }: { t: { quote: string; name: string; role: string }; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: index * 0.1 }}
      className="border border-black/[0.08] p-8">
      <p className="text-3xl text-black/15 font-black mb-4 leading-none">"</p>
      <p className="text-black/60 leading-relaxed mb-7 text-sm">"{t.quote}"</p>
      <div className="border-t border-black/[0.06] pt-5">
        <p className="font-black text-black text-sm">{t.name}</p>
        <p className="text-xs text-black/35 mt-0.5">{t.role}</p>
      </div>
    </motion.div>
  );
}

function ProjectCard({ project, index }: { project: typeof PROJECTS[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: index * 0.08 }}
      className="group cursor-pointer">
      <div className="overflow-hidden aspect-[16/10] mb-5">
        <motion.img src={project.img} alt={project.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }} />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-black tracking-[0.3em] text-black/35 uppercase mb-1">{project.category} · {project.year}</p>
          <h3 className="text-xl font-black text-black tracking-tight group-hover:text-black/70 transition-colors">{project.title}</h3>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={10} className="text-black/30" />
            <span className="text-xs text-black/40">{project.location}</span>
          </div>
          <p className="text-sm text-black/50 mt-2 leading-relaxed">{project.desc}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {project.tags.map(t => (
              <span key={t} className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 border border-black/10 text-black/40">{t}</span>
            ))}
          </div>
        </div>
        <ArrowUpRight size={20} className="text-black/20 group-hover:text-black transition-colors flex-shrink-0 mt-1" />
      </div>
    </motion.div>
  );
}

import { useBrandSettings } from '@igroup/shared';

// ... (existing constants)

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function IDesignPage() {
  const { contactSettings, socialLinks } = useBrandSettings();
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    message: '',
  });

  const heroRef = useRef(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      await apiRequest('settings/contact', {
        method: 'POST',
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: `i-design: ${formData.projectType}`,
          message: formData.message,
        },
      });
      setSubmitMessage('Thank you. Your message has been sent.');
      setFormData({ name: '', email: '', phone: '', projectType: '', message: '' });
    } catch (error) {
      setSubmitMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 700], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  // Auto-advance hero slider
  useEffect(() => {
    const t = setInterval(() => setActiveSlide(p => (p + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const categories = ['ALL', 'RESIDENCE', 'HOTEL', 'RESTAURANT', 'OFFICE', 'RETAIL', 'YACHT'];
  const filteredProjects = activeCategory === 'ALL'
    ? PROJECTS
    : PROJECTS.filter(p => p.category === activeCategory);

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[700px] overflow-hidden bg-black" ref={heroRef}>
        {/* Slides */}
        <AnimatePresence mode="wait">
          <motion.div key={activeSlide} className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}>
            <motion.img src={HERO_SLIDES[activeSlide].img} alt=""
              className="w-full h-full object-cover opacity-60"
              style={{ y: heroParallax }} />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

        {/* Content */}
        <motion.div className="relative h-full flex flex-col justify-end max-w-7xl mx-auto px-6 pb-20"
          style={{ opacity: heroOpacity }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeSlide}
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.3 }}>
              <p className="text-[10px] font-black tracking-[0.5em] text-white/40 uppercase mb-4">
                {HERO_SLIDES[activeSlide].label}
              </p>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-none max-w-4xl">
                {HERO_SLIDES[activeSlide].title}
              </h1>
            </motion.div>
          </AnimatePresence>

          {/* Slide dots + CTA */}
          <div className="flex items-end justify-between mt-12">
            <div className="flex gap-2">
              {HERO_SLIDES.map((_, i) => (
                <button key={i} onClick={() => setActiveSlide(i)}
                  className={`h-px transition-all duration-500 ${i === activeSlide ? 'w-10 bg-white' : 'w-4 bg-white/25 hover:bg-white/50'}`} />
              ))}
            </div>
            <Link href="/idesign#collection">
              <motion.button className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
                whileHover={{ x: 4 }}>
                Explore Collection <ArrowRight size={13} />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Slide number */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3">
          {HERO_SLIDES.map((_, i) => (
            <div key={i} className={`w-px transition-all duration-500 ${i === activeSlide ? 'h-12 bg-white' : 'h-4 bg-white/20'}`} />
          ))}
        </div>

        {/* Brand name overlay */}
        <div className="absolute top-24 right-8 hidden lg:block">
          <p className="text-[11px] font-black tracking-[0.4em] text-white/20 uppercase writing-mode-vertical">
            i design · {new Date().getFullYear()}
          </p>
        </div>
      </section>

      {/* ── INTRO STRIP ──────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6 border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] font-black tracking-[0.35em] uppercase text-black/30 mb-5">i Group · i design</p>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-black leading-tight">
              Architecture<br />that breathes.<br />
              <span className="text-black/25">Interiors that live.</span>
            </h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-black/55 text-lg leading-relaxed mb-6">
              i design is the luxury design and construction arm of i Group — delivering world-class residential, commercial, and hospitality spaces across Palestine and beyond.
            </p>
            <p className="text-black/40 leading-relaxed">
              From concept sketches to the final nail, we control every detail of the design-build process. No compromises. No middlemen. Just extraordinary spaces.
            </p>
            <div className="flex items-center gap-6 mt-8 pt-8 border-t border-black/[0.08]">
              {['Design', 'Build', 'Furnish', 'Deliver'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && <div className="w-4 h-px bg-black/20" />}
                  <span className="text-xs font-black uppercase tracking-wider text-black/50">{s}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section className="bg-black py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map((s, i) => <StatCard key={s.l} v={s.v} l={s.l} delay={i * 0.1} />)}
        </div>
      </section>

      {/* ── COLLECTION ───────────────────────────────────────────────── */}
      <section className="bg-white py-24 px-6" id="collection">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[10px] font-black tracking-[0.35em] uppercase text-black/30 mb-4">Our Collection</p>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-black">
                Designed for<br /><span className="text-black/30">every space.</span>
              </h2>
            </div>
            <p className="text-black/45 max-w-xs leading-relaxed text-sm">
              Each collection reflects a distinct lifestyle — from minimalist serenity to opulent grandeur.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COLLECTIONS.map((item, i) => <CollectionCard key={item.id} item={item} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── FEATURE BANNER ───────────────────────────────────────────── */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden bg-black">
        <img src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1920"
          alt="" className="w-full h-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-white/35 mb-5">Interior Design</p>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-tight max-w-3xl">
                Passionate living spaces!<br />
                <span className="text-white/35">Created by master designers.</span>
              </h2>
              <p className="text-white/45 mt-6 max-w-lg leading-relaxed">
                i design is the leader in turn-key projects across Palestine. We handle design, consultation, production and implementation — fully, in the shortest time.
              </p>
              <Link href="/idesign#projects">
                <motion.button className="mt-8 flex items-center gap-2 bg-white text-black font-black uppercase tracking-widest px-8 py-4 text-sm hover:bg-white/90 transition-colors"
                  whileHover={{ x: 4 }}>
                  View All Projects <ArrowRight size={15} />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PROJECTS ─────────────────────────────────────────────────── */}
      <section className="bg-[#F7F6F4] py-24 px-6" id="projects">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-[10px] font-black tracking-[0.35em] uppercase text-black/30 mb-4">Portfolio</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-black">
                Selected<br /><span className="text-black/30">projects.</span>
              </h2>
              {/* Category filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`text-[10px] font-black tracking-wider uppercase px-3 py-1.5 border transition-all ${
                      activeCategory === cat
                        ? 'bg-black text-white border-black'
                        : 'border-black/15 text-black/40 hover:border-black/30 hover:text-black'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence>
              {filteredProjects.map((p, i) => (
                <motion.div key={p.title}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}>
                  <ProjectCard project={p} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────────────────────── */}
      <section className="bg-black text-white py-24 px-6" id="process">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-[10px] font-black tracking-[0.35em] uppercase text-white/30 mb-4">Our Approach</p>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight">
              From vision<br /><span className="text-white/30">to reality.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-5 gap-0">
            {PROCESS_STEPS.map((step, i) => (
              <ProcessStep key={step.num} step={step} index={i} isLast={i === PROCESS_STEPS.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY ───────────────────────────────────────────────── */}
      <section className="bg-white py-24 px-6" id="philosophy">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] font-black tracking-[0.35em] uppercase text-black/30 mb-5">Our Philosophy</p>
            <h2 className="text-5xl font-black tracking-tighter text-black leading-tight mb-7">
              Creative ideas.<br />Extraordinary spaces.<br /><span className="text-black/25">Built to last.</span>
            </h2>
            <div className="space-y-4">
              {[
                'We design for the people who will live in each space.',
                'Every material is chosen with intention and longevity in mind.',
                'Our architecture connects local culture with global standards.',
                'Sustainability is woven into every design decision we make.',
              ].map(t => (
                <div key={t} className="flex items-start gap-3">
                  <Check size={14} className="text-black/35 mt-0.5 flex-shrink-0" />
                  <span className="text-black/60 text-sm leading-relaxed">{t}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="grid grid-cols-2 gap-3">
            <img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=600"
              alt="" className="w-full aspect-[3/4] object-cover" />
            <div className="flex flex-col gap-3 pt-8">
              <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600"
                alt="" className="w-full aspect-square object-cover" />
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600"
                alt="" className="w-full aspect-square object-cover" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PARTNERS STRIP ───────────────────────────────────────────── */}
      <section className="bg-[#F7F6F4] py-14 px-6 border-y border-black/[0.06]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] font-black tracking-[0.35em] uppercase text-black/25 text-center mb-8">Trusted by</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-40">
            {['ARMANI CASA', 'MINOTTI', 'POLIFORM', 'B&B ITALIA', 'FENDI CASA', 'MOLTENI&C'].map(brand => (
              <span key={brand} className="text-sm font-black tracking-[0.2em] text-black uppercase">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] font-black tracking-[0.35em] uppercase text-black/30 mb-12 text-center">What Our Clients Say</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "i design transformed our home into a masterpiece. Every detail was considered — we couldn't be more delighted.", name: 'Rania Al-Khalidi', role: 'Homeowner · Ramallah' },
              { quote: 'The hotel design exceeded every expectation. Guest satisfaction scores have never been higher.', name: 'Faisal Nabulsi', role: 'Hotel Owner · Jerusalem' },
              { quote: "Our restaurant's ambience is now a destination in itself. i design understood our brand perfectly.", name: 'Dina Mansour', role: 'F&B Entrepreneur · Nablus' },
            ].map((t, i) => (
              <TestimonialCard key={t.name} t={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────────── */}
      <section className="bg-black text-white py-24 px-6" id="contact">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] font-black tracking-[0.35em] uppercase text-white/30 mb-5">Let's Create Together</p>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight mb-6">
              Start your<br />design journey.
            </h2>
            <p className="text-white/45 leading-relaxed mb-10">
              Tell us about your project — and we'll schedule a complimentary consultation with our lead designer.
            </p>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <MapPin size={15} className="text-white/30" />
                <span className="text-sm text-white/55">{contactSettings.address || 'Nablus · Jerusalem · Gaza, Palestine'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={15} className="text-white/30" />
                <span className="text-sm text-white/55">{contactSettings.phone || '+970 59 000 0000'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={15} className="text-white/30" />
                <span className="text-sm text-white/55">{contactSettings.email || 'design@igroup.ps'}</span>
              </div>
              
              {socialLinks.length > 0 && (
                <div className="pt-6 flex gap-4">
                  {socialLinks.map(link => (
                    <a key={link.key} href={link.url} target="_blank" rel="noreferrer" className="text-white/20 hover:text-white transition-colors">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{link.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-white/[0.04] border border-white/[0.08] p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black tracking-[0.2em] uppercase text-white/30 block mb-1.5">Full Name</label>
                <input type="text" placeholder="Your name" required
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white/25 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-black tracking-[0.2em] uppercase text-white/30 block mb-1.5">Email</label>
                <input type="email" placeholder="your@email.com" required
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white/25 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-black tracking-[0.2em] uppercase text-white/30 block mb-1.5">Phone</label>
                <input type="tel" placeholder="+970 ..." required
                  value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white/25 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-black tracking-[0.2em] uppercase text-white/30 block mb-1.5">Project Type</label>
                <input type="text" placeholder="Residential / Commercial / Hotel ..." required
                  value={formData.projectType} onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white/25 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-black tracking-[0.2em] uppercase text-white/30 block mb-1.5">Message</label>
                <textarea placeholder="Tell us about your project..." rows={4} required
                  value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white/25 transition-colors resize-none" />
              </div>
              <motion.button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : 'Send Message'}
                <ArrowRight size={15} />
              </motion.button>
              {submitMessage && (
                <p className="text-xs text-white/60 text-center mt-4 uppercase font-bold tracking-widest">{submitMessage}</p>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#F7F6F4] py-32 px-6 text-center">
        <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1920"
          alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
        <div className="relative">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] font-black tracking-[0.4em] uppercase text-black/30 mb-6">Creative Ideas</p>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-black leading-none">
              Your space.<br />Our artistry.
            </h2>
            <p className="text-black/45 mt-6 text-lg max-w-lg mx-auto">
              Special living spaces designed by our interior architects — available for consultation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link href="/idesign#contact">
                <motion.button className="px-10 py-4 bg-black text-white font-black uppercase tracking-widest text-sm inline-flex items-center gap-2 hover:bg-black/80 transition-colors"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  Contact Us <ArrowRight size={15} />
                </motion.button>
              </Link>
              <Link href="/idesign#projects">
                <motion.button className="px-10 py-4 border-2 border-black text-black font-black uppercase tracking-widest text-sm hover:bg-black hover:text-white transition-colors"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  View Portfolio
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
