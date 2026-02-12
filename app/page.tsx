'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { 
  Sparkles, 
  Heart, 
  Utensils, 
  Watch, 
  Home as HomeIcon, 
  Activity, 
  TrendingUp, 
  Dumbbell, 
  Code2,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

const companies = [
  {
    id: 1,
    name: 'iCare Beauty',
    subtitle: 'PREMIUM SKINCARE',
    description: 'Elevate your skincare routine with our luxurious, science-backed products.',
    icon: Sparkles,
    color: '#E11D48',
    link: '/icare',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=1200'
  },
  {
    id: 2,
    name: 'Healthy Food Co',
    subtitle: 'NUTRITION & WELLNESS',
    description: 'Fuel your performance with nutritious meal plans designed for athletes.',
    icon: Utensils,
    color: '#10B981',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200'
  },
  {
    id: 3,
    name: 'Luxury Perfumes',
    subtitle: 'FRAGRANCES & WATCHES',
    description: 'Define your essence with exquisite fragrances and premium timepieces.',
    icon: Watch,
    color: '#F59E0B',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200'
  },
  {
    id: 4,
    name: 'Imkan Palestine',
    subtitle: 'DESIGN & CONSTRUCTION',
    description: 'Transform spaces with world-class interior design and construction.',
    icon: HomeIcon,
    color: '#3B82F6',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200'
  },
  {
    id: 5,
    name: 'Bio-Tech',
    subtitle: 'BIOMETRIC TRACKING',
    description: 'Optimize your health with advanced biometric monitoring technology.',
    icon: Activity,
    color: '#EF4444',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200'
  },
  {
    id: 6,
    name: 'Marketing Agency',
    subtitle: 'BRAND AMPLIFICATION',
    description: 'Strategic marketing solutions for beauty and wellness brands.',
    icon: TrendingUp,
    color: '#8B5CF6',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200'
  },
  {
    id: 7,
    name: 'Training & Nutrition',
    subtitle: 'FITNESS COACHING',
    description: 'Transform your body with personalized remote training programs.',
    icon: Dumbbell,
    color: '#F97316',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200'
  },
  {
    id: 8,
    name: 'Software House',
    subtitle: 'DIGITAL INNOVATION',
    description: 'Engineer tomorrow with cutting-edge software solutions.',
    icon: Code2,
    color: '#64748B',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1200'
  },
  {
    id: 9,
    name: 'BA Supplements',
    subtitle: 'SUPPLEMENTS & PERFORMANCE',
    description: 'Premium nutritional supplements designed for strength, recovery, and long-term wellness.',
    icon: Heart,
    color: '#22C55E',
    image: 'https://images.unsplash.com/photo-1612532275214-e4ca76d0e4d1?q=80&w=1200'
  },
];

// Apple-style text reveal animation component
const AnimatedText = ({ children, delay = 0 }: { children: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <span ref={ref} className="inline-block overflow-hidden">
      <motion.span
        className="inline-block"
        initial={{ y: 100, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
        transition={{ 
          duration: 0.8, 
          delay: delay,
          ease: [0.33, 1, 0.68, 1] // Apple's cubic bezier
        }}
      >
        {children}
      </motion.span>
    </span>
  );
};

// Smooth scale on scroll
const ScaleOnScroll = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  
  return (
    <motion.div ref={ref} style={{ scale, opacity }} className={className}>
      {children}
    </motion.div>
  );
};

export default function Home() {
  const [activeSection, setActiveSection] = useState('home');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [particlePositions, setParticlePositions] = useState<Array<{left: number, top: number}>>([]);
  const heroRef = useRef(null);
  
  // Generate random positions only on client-side
  useEffect(() => {
    setParticlePositions(
      Array.from({ length: 30 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100
      }))
    );
  }, []);
  
  // Smooth scroll progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  // Parallax effect for hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Smooth Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] z-100 origin-left"
        style={{ scaleX }}
      />

      {/* Header - Simple & Clean */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/10">
        <nav className="px-6 lg:px-12 h-24 flex items-center justify-between">
          {/* Logo - Simple & Elegant */}
          <motion.div 
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            whileHover={{ scale: 1.05 }}
          >
            {/* Simple Golden Badge */}
            <motion.div
              className="relative w-14 h-14 bg-linear-to-br from-[#D4AF37] to-[#FFD700] rounded-xl flex items-center justify-center shadow-2xl"
              whileHover={{ 
                boxShadow: "0 0 30px rgba(212, 175, 55, 0.6)",
                rotate: [0, -5, 5, 0]
              }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-black font-black text-2xl">BA</span>
              
              {/* Animated Ring */}
              <motion.div
                className="absolute inset-0 border-2 border-[#D4AF37] rounded-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            
            {/* Text with Gradient */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="text-3xl font-black tracking-tighter bg-linear-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                BA GROUP
              </div>
              <motion.div 
                className="h-0.5 bg-linear-to-r from-[#D4AF37] to-transparent"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </motion.div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-12">
            <motion.button 
              onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}
              className="relative text-sm font-bold tracking-widest uppercase text-white transition-colors group"
              whileHover={{ y: -2 }}
            >
              HOME
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-[#D4AF37]"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            <motion.button 
              onClick={() => document.getElementById('companies')?.scrollIntoView({ behavior: 'smooth' })}
              className="relative text-sm font-bold tracking-widest uppercase text-white transition-colors group"
              whileHover={{ y: -2 }}
            >
              COMPANIES
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-[#D4AF37]"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            <motion.button 
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="relative text-sm font-bold tracking-widest uppercase text-white transition-colors group"
              whileHover={{ y: -2 }}
            >
              ABOUT
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-[#D4AF37]"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            <motion.button 
              onClick={() => document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth' })}
              className="relative text-sm font-bold tracking-widest uppercase text-white transition-colors group"
              whileHover={{ y: -2 }}
            >
              PARTNERS
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-[#D4AF37]"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            <motion.button 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="relative text-sm font-bold tracking-widest uppercase text-white transition-colors group"
              whileHover={{ y: -2 }}
            >
              CONTACT
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-[#D4AF37]"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
        </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white"
          >
            {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </nav>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-[#0A0A0A] border-l border-white/10 z-50 lg:hidden"
            >
              <div className="p-8 space-y-8">
                <button onClick={() => setSidebarOpen(false)} className="absolute top-8 right-8">
                  <X size={24} />
                </button>
                
                <div className="space-y-6 mt-16">
                  <button 
                    onClick={() => { document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }); setSidebarOpen(false); }}
                    className="block text-2xl font-black tracking-tight hover:text-[#D4AF37] transition-colors text-left"
                  >
                    HOME
                  </button>
                  <button 
                    onClick={() => { document.getElementById('companies')?.scrollIntoView({ behavior: 'smooth' }); setSidebarOpen(false); }}
                    className="block text-2xl font-black tracking-tight hover:text-[#D4AF37] transition-colors text-left"
                  >
                    COMPANIES
                  </button>
                  <button 
                    onClick={() => { document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); setSidebarOpen(false); }}
                    className="block text-2xl font-black tracking-tight hover:text-[#D4AF37] transition-colors text-left"
                  >
                    ABOUT
                  </button>
                  <button 
                    onClick={() => { document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth' }); setSidebarOpen(false); }}
                    className="block text-2xl font-black tracking-tight hover:text-[#D4AF37] transition-colors text-left"
                  >
                    PARTNERS
                  </button>
                  <button 
                    onClick={() => { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); setSidebarOpen(false); }}
                    className="block text-2xl font-black tracking-tight hover:text-[#D4AF37] transition-colors text-left"
                  >
                    CONTACT
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section - Bold & Clear Background */}
      <section id="home" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Bold Modern Background */}
        <motion.div 
          className="absolute inset-0 bg-linear-to-b from-[#000000] via-[#0A0A0A] to-[#000000]"
          style={{ y: heroY }}
        >
          {/* Strong Animated Gradient Mesh */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                background: `
                  radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.35) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.35) 0%, transparent 50%),
                  radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.25) 0%, transparent 50%)
                `
              }}
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </div>

          {/* Bold Geometric Shapes */}
          <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
            {/* Large Circles */}
            <motion.circle
              cx="20%"
              cy="30%"
              r="200"
              stroke="rgba(147, 197, 253, 0.8)"
              strokeWidth="3"
              fill="none"
              initial={{ pathLength: 0, rotate: 0 }}
              animate={{ pathLength: 1, rotate: 360 }}
              transition={{
                pathLength: { duration: 2, ease: "easeInOut" },
                rotate: { duration: 20, repeat: Infinity, ease: "linear" }
              }}
            />
            <motion.circle
              cx="20%"
              cy="30%"
              r="180"
              stroke="rgba(147, 197, 253, 0.5)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, rotate: 0 }}
              animate={{ pathLength: 1, rotate: -360 }}
              transition={{
                pathLength: { duration: 2.5, ease: "easeInOut" },
                rotate: { duration: 15, repeat: Infinity, ease: "linear" }
              }}
            />
            
            <motion.circle
              cx="80%"
              cy="70%"
              r="180"
              stroke="rgba(167, 139, 250, 0.8)"
              strokeWidth="3"
              fill="none"
              initial={{ pathLength: 0, rotate: 0 }}
              animate={{ pathLength: 1, rotate: -360 }}
              transition={{
                pathLength: { duration: 2, delay: 0.5, ease: "easeInOut" },
                rotate: { duration: 25, repeat: Infinity, ease: "linear" }
              }}
            />
            <motion.circle
              cx="80%"
              cy="70%"
              r="160"
              stroke="rgba(167, 139, 250, 0.5)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, rotate: 0 }}
              animate={{ pathLength: 1, rotate: 360 }}
              transition={{
                pathLength: { duration: 2.5, delay: 0.5, ease: "easeInOut" },
                rotate: { duration: 18, repeat: Infinity, ease: "linear" }
              }}
            />
            
            {/* Bold Lines */}
            <motion.line
              x1="10%"
              y1="20%"
              x2="90%"
              y2="80%"
              stroke="rgba(147, 197, 253, 0.6)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <motion.line
              x1="90%"
              y1="20%"
              x2="10%"
              y2="80%"
              stroke="rgba(167, 139, 250, 0.6)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{
                duration: 2.5,
                delay: 0.3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            
            {/* Diagonal Lines */}
            <motion.line
              x1="0%"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="rgba(96, 165, 250, 0.4)"
              strokeWidth="1"
              strokeDasharray="10 5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </svg>

          {/* Prominent Floating Dots */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => {
              const x = (i % 6) * 16 + 8;
              const y = Math.floor(i / 6) * 20 + 10;
              return (
                <motion.div
                  key={`dot-${i}`}
                  className="absolute w-2 h-2 bg-blue-400/60 rounded-full shadow-lg shadow-blue-500/50"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.08,
                    ease: "easeInOut"
                  }}
                />
              );
            })}
          </div>

          {/* Clear Particles */}
          {particlePositions.map((pos, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1.5 h-1.5 bg-blue-300/80 rounded-full shadow-sm shadow-blue-400/50"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
              }}
              animate={{
                y: [-30, -120, -30],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 5 + (i % 3),
                repeat: Infinity,
                delay: (i % 10) * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Glowing Orbs - More Visible */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[100px] opacity-30"
            style={{
              background: "radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, transparent 70%)"
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] rounded-full blur-[100px] opacity-25"
            style={{
              background: "radial-gradient(circle, rgba(147, 51, 234, 0.6) 0%, transparent 70%)"
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.25, 0.4, 0.25]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />

          {/* Bottom Fade - Smooth Transition */}
          <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-linear-to-t from-black via-black/80 to-transparent pointer-events-none z-20" />
        </motion.div>

        {/* Hero Content with Apple-style reveal */}
        <motion.div 
          className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12 text-center"
          style={{ opacity: heroOpacity }}
        >
          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none">
              <div className="mb-4">
                <AnimatedText delay={0.2}>BUILDING</AnimatedText>{' '}
                <AnimatedText delay={0.3}>THE</AnimatedText>
              </div>
              <div>
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]">
                  <AnimatedText delay={0.4}>FUTURE</AnimatedText>
                </span>
              </div>
            </h1>
            
            <motion.p 
              className="text-lg md:text-2xl font-light tracking-wider text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.33, 1, 0.68, 1] }}
            >
              A digital and wellness empire spanning 9 industries
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1, ease: [0.33, 1, 0.68, 1] }}
            >
              <motion.button
                onClick={() => document.getElementById('companies')?.scrollIntoView({ behavior: 'smooth' })}
                className="group px-10 py-5 bg-white text-black rounded-full text-sm font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-all duration-500 inline-flex items-center gap-3 shadow-2xl"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(212, 175, 55, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                EXPLORE COMPANIES
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={20} />
                </motion.div>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Animated Scroll Indicator */}
        <motion.div 
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
              <motion.div 
                className="w-1 h-2 bg-white/50 rounded-full"
                animate={{ y: [0, 14, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Companies Grid Section - Seamless Blend */}
      <section id="companies" className="min-h-screen py-24 px-6 lg:px-12 relative">
        {/* Top Gradient Blend with Hero */}
        <div className="absolute top-0 left-0 right-0 h-[200px] bg-linear-to-b from-black via-black/50 to-transparent pointer-events-none z-10" />
        
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-linear-to-b from-black via-[#0A0A0A] to-black opacity-50 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative">
          <ScaleOnScroll className="mb-20">
            <div className="text-center">
              <motion.h2 
                className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <span className="inline-block overflow-hidden">
                  <motion.span
                    className="inline-block"
                    initial={{ y: 100 }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                  >
                    OUR{' '}
                  </motion.span>
                </span>
                <span className="inline-block overflow-hidden">
                  <motion.span
                    className="inline-block text-[#D4AF37]"
                    initial={{ y: 100 }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
                  >
                    COMPANIES
                  </motion.span>
                </span>
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-400 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
              >
                Nine businesses, one vision: to redefine excellence across digital and physical wellness
              </motion.p>
            </div>
          </ScaleOnScroll>

          {/* Companies Vertical Showcase - Premium Zoom-Out Motion */}
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
            {companies.map((company, index) => (
              <motion.a
                key={company.id}
                href={company.link || '#'}
                onMouseEnter={() => setHoveredCard(company.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl"
                initial={{ opacity: 0, y: 70, scale: 1.08, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{
                  duration: 0.9,
                  delay: index * 0.08,
                  ease: [0.33, 1, 0.68, 1]
                }}
                whileHover={{
                  y: -6,
                  transition: { duration: 0.35, ease: [0.33, 1, 0.68, 1] }
                }}
              >
                {/* Full Background */}
                <div className="absolute inset-0">
                  <motion.img
                    src={company.image}
                    alt={company.name}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.22 }}
                    whileInView={{ scale: 1.06 }}
                    viewport={{ once: true }}
                    animate={{
                      scale: hoveredCard === company.id ? 1.1 : 1.06,
                      filter: hoveredCard === company.id ? "brightness(1.05)" : "brightness(0.78)"
                    }}
                    transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-black/30 md:to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-7 md:p-10 min-h-[280px] md:min-h-[340px] flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <motion.div
                      className="text-xs font-black tracking-[0.2em] uppercase"
                      style={{ color: company.color }}
                      animate={{ letterSpacing: hoveredCard === company.id ? "0.26em" : "0.2em" }}
                      transition={{ duration: 0.3 }}
                    >
                      {company.subtitle}
                    </motion.div>
                    <motion.div
                      className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl"
                      style={{ backgroundColor: `${company.color}20`, border: `1px solid ${company.color}` }}
                      animate={{
                        rotate: hoveredCard === company.id ? 180 : 0,
                        scale: hoveredCard === company.id ? 1.1 : 1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <company.icon size={20} style={{ color: company.color }} />
                    </motion.div>
                  </div>

                  <div className="max-w-2xl">
                    <motion.h3
                      className="text-3xl md:text-5xl font-black tracking-tight mb-3"
                      animate={{ color: hoveredCard === company.id ? company.color : "#FFFFFF" }}
                      transition={{ duration: 0.35 }}
                    >
                      {company.name}
                    </motion.h3>
                    <motion.p
                      className="text-sm md:text-base text-gray-200 leading-relaxed max-w-xl"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: hoveredCard === company.id ? 1 : 0.75 }}
                      transition={{ duration: 0.35 }}
                    >
                      {company.description}
                    </motion.p>

                    <motion.div
                      className="inline-flex items-center gap-2 mt-6 text-sm font-bold tracking-[0.14em] uppercase"
                      animate={{
                        x: hoveredCard === company.id ? 10 : 0,
                        opacity: hoveredCard === company.id ? 1 : 0.75
                      }}
                      transition={{ duration: 0.35 }}
                    >
                      <span>Explore</span>
                      <motion.div
                        animate={{ x: hoveredCard === company.id ? [0, 5, 0] : 0 }}
                        transition={{ duration: 1, repeat: hoveredCard === company.id ? Infinity : 0 }}
                      >
                        <ArrowRight size={18} />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>

                {/* Hover Glow Border */}
                <motion.div
                  className="absolute inset-0 rounded-3xl border-2"
                  style={{ borderColor: company.color }}
                  animate={{
                    opacity: hoveredCard === company.id ? 0.8 : 0,
                    boxShadow: hoveredCard === company.id ? `0 0 45px ${company.color}55` : "none"
                  }}
                  transition={{ duration: 0.35 }}
                />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* About Section with Advanced Animations */}
      <section id="about" className="min-h-screen flex items-center justify-center py-24 px-6 lg:px-12 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-linear-to-br from-[#D4AF37]/10 via-transparent to-black"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        />
        
        <ScaleOnScroll className="max-w-5xl mx-auto relative z-10 text-center">
          <div>
            <motion.h2 
              className="text-5xl md:text-7xl font-black tracking-tighter mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <span className="inline-block overflow-hidden">
                <motion.span
                  className="inline-block"
                  initial={{ y: 100 }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                >
                  ABOUT{' '}
                </motion.span>
              </span>
              <span className="inline-block overflow-hidden">
                <motion.span
                  className="inline-block text-[#D4AF37]"
                  initial={{ y: 100 }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
                >
                  BA GROUP
                </motion.span>
              </span>
            </motion.h2>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
            >
              We are a multi-industry conglomerate committed to excellence across digital innovation, 
              wellness, beauty, and lifestyle. From cutting-edge software to premium skincare, 
              we build brands that inspire and transform.
            </motion.p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {[
                { number: '9', label: 'Companies' },
                { number: '50K+', label: 'Customers' },
                { number: '100+', label: 'Team Members' },
                { number: '15+', label: 'Countries' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.1,
                    ease: [0.33, 1, 0.68, 1]
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    borderColor: "#D4AF37",
                    boxShadow: "0 0 30px rgba(212, 175, 55, 0.3)"
                  }}
                  className="border border-[#D4AF37]/30 rounded-2xl p-6 backdrop-blur-xl cursor-default transition-all duration-500"
                >
                  <motion.div 
                    className="text-5xl font-black text-[#D4AF37] mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: index * 0.1 + 0.3,
                      type: "spring",
                      bounce: 0.5,
                      stiffness: 200
                    }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-sm uppercase tracking-widest text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </ScaleOnScroll>
      </section>

      {/* Partners Section */}
      <section id="partners" className="min-h-screen flex items-center justify-center py-24 px-6 lg:px-12 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-linear-to-br from-black via-[#0A0A0A] to-black"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <ScaleOnScroll>
            <div className="text-center mb-20">
              <motion.h2 
                className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <span className="inline-block overflow-hidden">
                  <motion.span
                    className="inline-block"
                    initial={{ y: 100 }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                  >
                    OUR{' '}
                  </motion.span>
                </span>
                <span className="inline-block overflow-hidden">
                  <motion.span
                    className="inline-block text-[#D4AF37]"
                    initial={{ y: 100 }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
                  >
                    PARTNERS
                  </motion.span>
                </span>
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-400 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Trusted by industry leaders and innovators worldwide
              </motion.p>
            </div>

            {/* Partners Grid with Innovative Animations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {[
                { 
                  name: 'Microsoft', 
                  logo: (
                    <svg viewBox="0 0 23 23" className="w-20 h-20">
                      <path fill="#F25022" d="M0 0h11v11H0z"/>
                      <path fill="#7FBA00" d="M12 0h11v11H12z"/>
                      <path fill="#00A4EF" d="M0 12h11v11H0z"/>
                      <path fill="#FFB900" d="M12 12h11v11H12z"/>
                    </svg>
                  )
                },
                { 
                  name: 'Google', 
                  logo: (
                    <svg viewBox="0 0 24 24" className="w-20 h-20">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )
                },
                { 
                  name: 'Amazon', 
                  logo: (
                    <svg viewBox="0 0 200 60" className="w-24 h-20">
                      <g fill="#FF9900">
                        <path d="M117.7 40.4c-10.2 7.5-25 11.5-37.7 11.5-17.8 0-33.9-6.6-46-17.6-.9-.8-.1-2 1-1.3 12.8 7.5 28.7 12 45.1 12 11.1 0 23.2-2.3 34.4-7.1 1.7-.7 3.1 1.1 1.5 2.5z"/>
                        <path d="M121.4 36.2c-1.3-1.7-8.6-.8-11.9-.4-1 .1-1.2-.8-.3-1.4 5.8-4.1 15.4-2.9 16.5-1.5 1.1 1.4-.3 11.1-5.8 15.7-.8.7-1.7.3-1.3-.6 1.3-3.2 4.1-10.4 2.8-12z"/>
                      </g>
                      <path fill="#221F1F" d="M102.9 9.5V6.1c0-.5.4-.9.9-.9h16.3c.5 0 .9.4.9.9v2.9c0 .5-.4 1.2-1.1 2.2L110 24.4c2.5-.1 5.1.3 7.4 1.5.5.3.6.7.7 1.1v3.6c0 .5-.6 1.1-1.2.8-4.8-2.5-11.2-2.8-16.5.1-.5.3-1.1-.3-1.1-.8v-3.4c0-.6 0-1.6.6-2.5l10.6-15.2h-8.5c-.5 0-.9-.4-.9-.9zm-38.2 23h-4.6c-.4 0-.8-.3-.8-.7V6.2c0-.5.4-.8.9-.8h4.3c.5 0 .8.3.8.7v3.3h.1c1.1-3.1 3.2-4.5 6-4.5 2.9 0 4.7 1.4 5.9 4.5 1.1-3.1 3.6-4.5 6.3-4.5 1.9 0 4 .8 5.3 2.5 1.5 1.9 1.2 4.7 1.2 7.1v16.3c0 .5-.4.8-.9.8h-4.6c-.5 0-.8-.4-.8-.8V14.3c0-1 .1-3.4-.1-4.3-.4-1.5-1.4-1.9-2.8-1.9-1.2 0-2.4.8-2.9 2-.5 1.2-.5 3.2-.5 4.3v17.4c0 .5-.4.8-.9.8h-4.6c-.5 0-.8-.4-.8-.8l-.1-17.4c0-3.7.6-9.1-3-9.1-3.6 0-3.5 5.5-3.5 9.1v17.4c-.1.4-.5.7-1 .7zm72.7.9c-6.8 0-14.4-3-14.4-11.9 0-8.4 6.5-11.6 14.4-11.6 6.7 0 14 2.6 14 11.6 0 9-7.4 11.9-14 11.9zm0-18.6c-3.8 0-4 5.2-4 8.4s-.1 10.2 4 10.2c4 0 4.2-5.6 4.2-9 0-2.2-.1-4.9-.8-7-.6-1.8-1.7-2.6-3.4-2.6zm24.5 17.7h-4.6c-.5 0-.8-.4-.8-.8V6.2c0-.5.4-.8.9-.8h4.3c.4 0 .7.2.8.6v3.9h.1c1.3-3.4 3.1-5 6.5-5 2.1 0 4.2.8 5.5 2.8 1.2 1.9 1.2 5.1 1.2 7.4v16.6c0 .5-.4.8-.9.8h-4.6c-.4 0-.8-.3-.8-.7V16.1c0-3.3.4-8.2-3.7-8.2-1.4 0-2.7.9-3.4 2.3-.8 1.8-.9 3.5-.9 5.5v16.1c-.2.3-.5.6-1 .6zM33.3 20.7c0 2 .1 3.6-.9 5.3-1 1.4-2.4 2.3-4 2.3-2.2 0-3.5-1.7-3.5-4.2 0-5 4.4-5.8 8.5-5.8v2.4zm4.7 11.2c-.3.3-.7.3-1 .1-1.4-1.2-1.7-1.7-2.4-2.8-2.3 2.4-4 3.1-7 3.1-3.6 0-6.3-2.2-6.3-6.6 0-3.4 1.9-5.8 4.5-6.9 2.3-1 5.4-1.2 7.8-1.5v-.6c0-1 .1-2.3-.5-3.2-.5-.8-1.5-1.1-2.4-1.1-1.6 0-3.1.8-3.4 2.5-.1.4-.3.7-.7.7l-4.4-.5c-.3-.1-.7-.3-.6-.8 1-5 5.4-6.6 9.4-6.6 2 0 4.7.5 6.3 2 2 1.8 1.8 4.3 1.8 6.9v6.3c0 1.9.8 2.7 1.5 3.7.3.4.3.8 0 1l-3.6 3.1zm-22-11.6V6.2c0-.5-.4-.9-.9-.9H9.8c-.5 0-.9.4-.9.8v24.6c0 .5.4.9.9.9h4.5c.5 0 .8-.4.9-.8v-9.5h7.1c4.6 0 9.2-.4 13-3.1 3.1-2.3 5.3-5.6 5.3-10.1 0-9.9-7.2-11-12.7-11H9.8c-.5 0-.9.4-.9.9v3.5c0 .5.4.9.9.9h13.4c2.2 0 4.2.2 6.2 1.2 1.7.9 2.8 2.4 2.8 4.5 0 2.3-1.2 4.1-2.9 5.1-1.9 1.1-4.1 1.3-6.3 1.3h-2z"/>
                    </svg>
                  )
                },
                { 
                  name: 'Apple', 
                  logo: (
                    <svg viewBox="0 0 24 24" className="w-20 h-20" fill="#FFFFFF">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                  )
                },
                { 
                  name: 'Meta', 
                  logo: (
                    <svg viewBox="0 0 200 80" className="w-24 h-20">
                      <defs>
                        <linearGradient id="metaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#0081FB' }} />
                          <stop offset="50%" style={{ stopColor: '#0064E0' }} />
                          <stop offset="100%" style={{ stopColor: '#00C3FF' }} />
                        </linearGradient>
                      </defs>
                      <path fill="url(#metaGradient)" d="M154.7 40c0-22.1-17.9-40-40-40S74.7 17.9 74.7 40c0 19.9 14.6 36.5 33.7 39.5V51.7h-10.1V40h10.1v-8.8c0-10 6-15.6 15.1-15.6 4.4 0 9 .8 9 .8v9.9h-5.1c-5 0-6.5 3.1-6.5 6.3V40h11.1l-1.8 11.7h-9.3v27.8c19.1-3 33.7-19.6 33.7-39.5z"/>
                      <path fill="#FFFFFF" d="M122.6 51.7l1.8-11.7h-11.1v-7.4c0-3.2 1.6-6.3 6.5-6.3h5.1v-9.9s-4.6-.8-9-.8c-9.2 0-15.1 5.6-15.1 15.6V40H91.7v11.7h10.1v27.8c2 .3 4.1.5 6.2.5s4.1-.2 6.2-.5V51.7h8.4z"/>
                    </svg>
                  )
                },
                { 
                  name: 'Tesla', 
                  logo: (
                    <svg viewBox="0 0 342 35" className="w-24 h-20" fill="#E31937">
                      <path d="M0 .1a9.7 9.7 0 007 7h11l.5.1v27.6h6.8V7.3L26 7h11a9.8 9.8 0 007-7H0zm238.6 0h-6.8v34.8H263a9.7 9.7 0 006-6.8h-30.3V0zm-52.3 6.8c3.6-1 6.6-3.8 7.4-6.9l-38.1.1v20.6h31.1v7.2h-24.4a13.6 13.6 0 00-8.7 7h39.9V13.9h-31.2v-7h24zm116.2 28h6.7v-14h24.6v14h6.7v-21h-38zM85.3 7h26a9.6 9.6 0 007.1-7H78.3a9.6 9.6 0 007 7zm0 13.8h26a9.6 9.6 0 007.1-7H78.3a9.6 9.6 0 007 7zm0 14.1h26a9.6 9.6 0 007.1-7H78.3a9.6 9.6 0 007 7zM308.5 7h26a9.6 9.6 0 007-7h-40a9.6 9.6 0 007 7z"/>
                    </svg>
                  )
                },
                { 
                  name: 'Nike', 
                  logo: (
                    <svg viewBox="0 0 1000 356" className="w-24 h-16" fill="#FFFFFF">
                      <path d="M245.8 0L0 356h172.8c53.7 0 102.1-9.7 144.5-28.9l-71.5-327.1zM866.6 198.1c-33.3-46.3-80.4-69.5-141.3-69.5-21.3 0-42.8 3.4-64.5 10.2-46.3 14.4-87.4 47.5-122.9 99.3-25.7 37.4-45.8 80.1-60.2 128-2 6.7-3.9 13.5-5.7 20.4 54.5-77.9 120.9-123.8 199.1-137.7 18.9-3.4 37.7-5.1 56.4-5.1 45.8 0 82.7 10.7 110.8 32 28 21.3 42.1 50.5 42.1 87.5 0 22.7-5.7 44.7-17.1 66-11.4 21.3-27.4 39.7-48 55.1-20.6 15.4-44.7 27.4-72.3 36-27.6 8.6-57.1 12.9-88.6 12.9-43.5 0-83.3-7.4-119.4-22.1-36.1-14.7-67.1-34.7-93-60-25.9-25.3-46.3-55.1-61.2-89.3-14.9-34.3-22.4-70.7-22.4-109.3 0-41.6 7.7-81.6 23.1-120 15.4-38.4 36.8-72 64.3-100.8C484 34 515.7 11.3 551.8 0l-72.3 327.1c42.5 19.2 90.8 28.9 144.5 28.9H796L1000 0L245.8 0z"/>
                    </svg>
                  )
                },
                { 
                  name: 'Adidas', 
                  logo: (
                    <svg viewBox="0 0 200 200" className="w-20 h-20">
                      <g fill="#FFFFFF">
                        <polygon points="99.6,46 133.6,46 166.4,99.7 132.4,99.7"/>
                        <polygon points="88.2,65.7 122.2,65.7 155,119.4 121,119.4"/>
                        <polygon points="76.8,85.4 110.8,85.4 143.6,139.1 109.6,139.1"/>
                        <path d="M33.6,160c-4.2,0-7.5-1.4-9.9-4.1c-2.4-2.7-3.6-6.5-3.6-11.4v-0.3c0-4.9,1.2-8.7,3.6-11.4c2.4-2.7,5.7-4.1,9.9-4.1c4.2,0,7.5,1.4,9.9,4.1c2.4,2.7,3.6,6.5,3.6,11.4v0.3c0,4.9-1.2,8.7-3.6,11.4C41.1,158.6,37.8,160,33.6,160z M33.6,155.7c2,0,3.5-0.8,4.5-2.3c1-1.5,1.5-3.7,1.5-6.5v-0.3c0-2.8-0.5-5-1.5-6.5c-1-1.5-2.5-2.3-4.5-2.3c-2,0-3.5,0.8-4.5,2.3c-1,1.5-1.5,3.7-1.5,6.5v0.3c0,2.8,0.5,5,1.5,6.5C30.1,154.9,31.6,155.7,33.6,155.7z"/>
                        <path d="M58.4,160c-4.2,0-7.5-1.4-9.9-4.1c-2.4-2.7-3.6-6.5-3.6-11.4v-0.3c0-4.9,1.2-8.7,3.6-11.4c2.4-2.7,5.7-4.1,9.9-4.1c4.2,0,7.5,1.4,9.9,4.1c2.4,2.7,3.6,6.5,3.6,11.4v0.3c0,4.9-1.2,8.7-3.6,11.4C65.9,158.6,62.6,160,58.4,160z M58.4,155.7c2,0,3.5-0.8,4.5-2.3c1-1.5,1.5-3.7,1.5-6.5v-0.3c0-2.8-0.5-5-1.5-6.5c-1-1.5-2.5-2.3-4.5-2.3c-2,0-3.5,0.8-4.5,2.3c-1,1.5-1.5,3.7-1.5,6.5v0.3c0,2.8,0.5,5,1.5,6.5C54.9,154.9,56.4,155.7,58.4,155.7z"/>
                        <path d="M75.4,159.4v-30.1h5.3v30.1H75.4z"/>
                      </g>
                    </svg>
                  )
                }
              ].map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0, rotateY: -90, scale: 0.5 }}
                  whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.15,
                    ease: [0.33, 1, 0.68, 1],
                    rotateY: { type: "spring", stiffness: 100 }
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    y: -12,
                    rotateY: 10,
                    transition: { duration: 0.4 }
                  }}
                  className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-[#D4AF37]/50 transition-all duration-500 cursor-pointer"
                  style={{ 
                    transformStyle: "preserve-3d",
                    perspective: "1000px"
                  }}
                >
                  {/* Animated Glow Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                    style={{
                      background: "radial-gradient(circle at center, rgba(212, 175, 55, 0.3) 0%, transparent 70%)"
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  <div className="relative flex flex-col items-center justify-center h-full">
                    {/* Logo SVG with 3D Effect */}
                    <motion.div 
                      className="mb-4 flex items-center justify-center"
                      whileHover={{ 
                        rotateY: 360,
                        scale: 1.15
                      }}
                      transition={{ 
                        rotateY: { duration: 0.8, ease: "easeInOut" },
                        scale: { duration: 0.3 }
                      }}
                      style={{ 
                        transformStyle: "preserve-3d"
                      }}
                    >
                      {partner.logo}
                    </motion.div>
                    
                    {/* Partner Name with Slide Effect */}
                    <motion.h3 
                      className="text-lg font-bold tracking-wider uppercase text-gray-300 group-hover:text-[#D4AF37] transition-colors duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 + 0.3, duration: 0.5 }}
                    >
                      {partner.name}
                    </motion.h3>
                  </div>

                  {/* Animated Corner Accents */}
                  <motion.div
                    className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#D4AF37]"
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ 
                      scale: 1, 
                      opacity: 1,
                      transition: { delay: index * 0.15 + 0.4, type: "spring" }
                    }}
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(212, 175, 55, 0.7)",
                        "0 0 0 10px rgba(212, 175, 55, 0)",
                        "0 0 0 0 rgba(212, 175, 55, 0)"
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Bottom Left Accent */}
                  <motion.div
                    className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-[#D4AF37] opacity-0 group-hover:opacity-100"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Stats Row */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {[
                { number: '200+', label: 'Global Partners' },
                { number: '50+', label: 'Countries' },
                { number: '$10B+', label: 'Combined Revenue' },
                { number: '99%', label: 'Satisfaction Rate' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-[#D4AF37]/50 transition-all duration-500"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(212, 175, 55, 0.2)"
                  }}
                >
                  <motion.div 
                    className="text-4xl font-black text-[#D4AF37] mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: 0.9 + index * 0.1,
                      type: "spring",
                      bounce: 0.5,
                      stiffness: 200
                    }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-sm uppercase tracking-widest text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              className="text-center mt-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <motion.button
                className="px-10 py-5 bg-linear-to-r from-[#D4AF37] to-[#FFD700] text-black font-black uppercase tracking-widest rounded-full hover:shadow-2xl transition-all duration-500"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 60px rgba(212, 175, 55, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                Become a Partner
              </motion.button>
            </motion.div>
          </ScaleOnScroll>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen flex items-center justify-center py-24 px-6 lg:px-12 relative overflow-hidden">
        {/* Animated Background */}
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-linear-to-br from-black via-[#0A0A0A] to-black" />
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)"
            }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </motion.div>

        <div className="max-w-6xl mx-auto relative z-10 w-full">
          <ScaleOnScroll>
            <div className="text-center mb-16">
              <motion.h2 
                className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <span className="inline-block overflow-hidden">
                  <motion.span
                    className="inline-block"
                    initial={{ y: 100 }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                  >
                    GET IN{' '}
                  </motion.span>
                </span>
                <span className="inline-block overflow-hidden">
                  <motion.span
                    className="inline-block text-[#D4AF37]"
                    initial={{ y: 100 }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
                  >
                    TOUCH
                  </motion.span>
                </span>
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-400 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Let's build the future together. Reach out to explore partnerships and opportunities.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold tracking-wider uppercase text-gray-400 mb-2">
                    Name
                  </label>
                  <motion.input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-all duration-300"
                    placeholder="Your name"
                    whileFocus={{ scale: 1.02, borderColor: "#D4AF37" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold tracking-wider uppercase text-gray-400 mb-2">
                    Email
                  </label>
                  <motion.input
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-all duration-300"
                    placeholder="your@email.com"
                    whileFocus={{ scale: 1.02, borderColor: "#D4AF37" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold tracking-wider uppercase text-gray-400 mb-2">
                    Company
                  </label>
                  <motion.input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-all duration-300"
                    placeholder="Your company"
                    whileFocus={{ scale: 1.02, borderColor: "#D4AF37" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold tracking-wider uppercase text-gray-400 mb-2">
                    Message
                  </label>
                  <motion.textarea
                    rows={5}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-all duration-300 resize-none"
                    placeholder="Tell us about your project..."
                    whileFocus={{ scale: 1.02, borderColor: "#D4AF37" }}
                  />
                </div>

                <motion.button
                  className="w-full bg-linear-to-r from-[#D4AF37] to-[#FFD700] text-black font-black uppercase tracking-widest py-5 rounded-full hover:shadow-2xl transition-all duration-500"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 60px rgba(212, 175, 55, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Message
                </motion.button>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-8"
              >
                {/* Info Cards */}
                {[
                  {
                    title: "Email",
                    value: "hello@bagroup.com",
                    icon: "✉️"
                  },
                  {
                    title: "Phone",
                    value: "+1 (555) 123-4567",
                    icon: "📞"
                  },
                  {
                    title: "Office",
                    value: "123 Business St, Tech City, TC 12345",
                    icon: "📍"
                  },
                  {
                    title: "Follow Us",
                    value: "@bagroup",
                    icon: "🌐"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#D4AF37] transition-all duration-500 cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 20px 40px rgba(212, 175, 55, 0.2)"
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        className="text-4xl"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.icon}
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold tracking-wider uppercase text-gray-400 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-lg font-medium text-white group-hover:text-[#D4AF37] transition-colors">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </ScaleOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 lg:px-12 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <motion.div 
              className="text-2xl font-black tracking-tighter bg-linear-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              BA GROUP
            </motion.div>
            <div className="flex gap-8">
              {['HOME', 'COMPANIES', 'ABOUT', 'PARTNERS', 'CONTACT'].map((item, index) => (
                <motion.button
                  key={item}
                  onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm font-bold tracking-wider uppercase text-gray-400 hover:text-[#D4AF37] transition-colors"
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 border-t border-white/5 pt-8">
            © 2026 BA Group. Building the future, one company at a time.
          </div>
        </div>
      </footer>
    </div>
  );
}
