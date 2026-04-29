import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronDown, Plus, Play, ChevronRight, ThumbsUp, ThumbsDown, CheckCircle2, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';
import { ProductLineup } from './ProductLineup';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';

interface ProductPageProps {
  product: Product;
  onBack: () => void;
  lang: Language;
}

const productImages = [
  "https://images.unsplash.com/photo-1654374504608-67c4cfe65fca?q=80&w=1200", // Application
  "https://images.unsplash.com/photo-1739984730991-3a592bc6f12d?q=80&w=1200", // Kit
  "https://images.unsplash.com/photo-1595515770338-e4d3c5d8dd91?q=80&w=1200", // Lifestyle
  "https://images.unsplash.com/photo-1638609927040-8a7e97cd9d6a?q=80&w=1200", // Texture
];

const applicationSteps = [
  {
    image: "https://images.unsplash.com/photo-1666025062728-c33a25e8ee3f?q=80&w=1200",
    text: "rhode trick: Mix with your favorite foundation for a dewy, skin-first makeup base.",
    number: "(01)"
  },
  {
    image: "https://images.unsplash.com/photo-1762121903467-8cf5cc423ba5?q=80&w=1200",
    text: "for a glassy finish: apply a pea-sized amount to the high points of your face after makeup.",
    number: "(02)"
  },
  {
    image: "https://images.unsplash.com/photo-1670201203150-bf8771401590?q=80&w=1200",
    text: "overnight mask: apply a generous layer before bed to wake up with deeply hydrated, plump skin.",
    number: "(03)"
  }
];

const reviews = [
  {
    name: "Faith H.",
    verified: true,
    age: "18 - 24",
    concern: "Dullness, Pore Size",
    skinType: "Combination",
    favorites: "Immediate Dewy Glow, Hydrating, Works Under Makeup, Noticeable Results, Non-Sticky",
    rating: 5,
    time: "41 minutes ago",
    title: "Glazing Milk",
    content: "I love this stuff, very hydrating and leaves that dewy glow.",
    hydration: 85
  },
  {
    name: "Lauren P.",
    verified: true,
    age: "18 - 24",
    concern: "Dryness, Pore Size, Uneven Skin Tone, Dullness",
    skinType: "Combination",
    favorites: "Immediate Dewy Glow, Gentle, Layers Easily, Hydrating, Noticeable Results",
    rating: 5,
    time: "1 hour ago",
    title: "Glazing Milk",
    content: "I like this product! Super easy to use and soaks into skin very quickly. Leaves a dewy, hydrated glow!",
    hydration: 75
  }
];

const routineSteps = [
  {
    title: "pineapple refresh",
    subtitle: "PGA daily cleanser",
    label: "CLEANSE",
    image: "https://images.unsplash.com/photo-1611960555774-35f9d21c7e25?q=80&w=800",
    color: "#F7F2D5"
  },
  {
    title: "glazing milk",
    subtitle: "facial treatment essence",
    label: "PREP",
    image: "https://images.unsplash.com/photo-1728994062543-74a1dc2c9392?q=80&w=800",
    color: "#FFFFFF"
  },
  {
    title: "peptide glazing fluid",
    subtitle: "dewy hydration serum",
    label: "GLAZE",
    image: "https://images.unsplash.com/photo-1710580889701-9fa8f2cd5927?q=80&w=800",
    color: "#F2F1ED"
  },
  {
    title: "barrier restore cream",
    subtitle: "rich moisturizing treatment",
    label: "COMFORT",
    image: "https://images.unsplash.com/photo-1728994062543-74a1dc2c9392?q=80&w=800",
    color: "#FFFFFF"
  },
  {
    title: "peptide lip treatment",
    subtitle: "nourishing lip layer",
    label: "NOURISH",
    image: "https://images.unsplash.com/photo-1764346452591-9bf2da5f82e9?q=80&w=800",
    color: "#FCE7E9"
  }
];

const ReviewItem = ({ review }: { review: typeof reviews[0] }) => (
  <div className="py-12 border-b border-black/5 grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
    {/* Left Sidebar */}
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-[#333]">{review.name}</span>
          {review.verified && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#333] opacity-60">
              Verified Buyer <CheckCircle2 size={12} className="fill-black text-white" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {[
          { label: "Age Range", value: review.age },
          { label: "Biggest Skin Concern", value: review.concern },
          { label: "What is your skin type?", value: review.skinType },
          { label: "What are your favorite features about this product?", value: review.favorites },
        ].map((item, idx) => (
          <div key={idx} className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#333]">{item.label}</p>
            <p className="text-[12px] text-[#333] opacity-60 leading-relaxed">{item.value}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Main Content */}
    <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill={i < review.rating ? "black" : "none"} className={i < review.rating ? "text-black" : "text-black/10"} />
            ))}
          </div>
          <span className="text-[11px] font-bold opacity-40">{review.time}</span>
        </div>

        <div className="space-y-3">
          <h4 className="text-[16px] font-bold text-[#333]">{review.title}</h4>
          <p className="text-[15px] text-[#333] leading-relaxed max-w-2xl">{review.content}</p>
        </div>

        <div className="space-y-4 max-w-sm pt-4">
          <p className="text-[11px] font-bold text-[#333]">How hydrated did your skin feel?</p>
          <div className="relative pt-2">
            <div className="h-0.5 w-full bg-black/10 rounded-full">
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#66635F] rounded-full shadow-sm border-2 border-white"
                style={{ left: `${review.hydration}%` }}
              />
            </div>
            <div className="flex justify-between pt-3 text-[10px] font-bold opacity-40 uppercase tracking-widest">
              <span>Not very hydrated</span>
              <span>Super hydrated</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-6 pt-8">
        <div className="flex items-center gap-4 text-[11px] font-bold opacity-40">
          <span>Was this helpful?</span>
          <button className="flex items-center gap-1.5 hover:opacity-100 transition-opacity">
            <ThumbsUp size={14} /> 0
          </button>
          <button className="flex items-center gap-1.5 hover:opacity-100 transition-opacity">
            <ThumbsDown size={14} /> 0
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const ProductPage: React.FC<ProductPageProps> = ({ product, lang }) => {
  const { addToCart } = useShop();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [activeRoutineStep, setActiveRoutineStep] = useState(0);
  const [resultsTab, setResultsTab] = useState(0);
  const [showBottomBar, setShowBottomBar] = useState(true);
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);
  const lastScrollY = useRef(0);
  const isRtl = lang === 'ar';

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setShowBottomBar(true);
      } else {
        // Scrolling up
        setShowBottomBar(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`bg-white min-h-screen selection:bg-black selection:text-white ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* 1. HERO SECTION - REFINED FOR MOBILE */}
      <section className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6 overflow-hidden">
        
        {/* LEFT COLUMN: IMAGE SLIDER */}
        <div className="relative aspect-[4/5] md:aspect-[4/5] rounded-[24px] md:rounded-[32px] group z-0 overflow-hidden shadow-sm">
          <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <ImageWithFallback 
                  src={productImages[activeImageIndex]} 
                  alt="Product View" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Floating Navigation Thumbnails - Mobile Optimized */}
          <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 md:gap-3 z-20">
             {productImages.map((img, idx) => (
               <button 
                 key={idx}
                 onClick={() => setActiveImageIndex(idx)}
                 className={`w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden border-2 transition-all scale-95 hover:scale-105 ${activeImageIndex === idx ? 'border-white ring-2 ring-black/10 shadow-lg' : 'border-transparent opacity-40'}`}
               >
                 <ImageWithFallback src={img} alt="thumb" className="w-full h-full object-cover" />
               </button>
             ))}
             <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all">
               <Play size={14} fill="currentColor" />
             </button>
          </div>

          {/* Mobile Bottom Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
            {productImages.map((_, idx) => (
              <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${activeImageIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/30'}`} />
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: PRODUCT INFO - REFINED MOBILE DENSITY */}
        <div className="bg-[#F2F1ED] rounded-[24px] md:rounded-[32px] p-6 md:p-14 flex flex-col space-y-6 md:space-y-8 md:h-full md:overflow-y-auto no-scrollbar relative z-10 shadow-[-20px_0_40px_rgba(0,0,0,0.01)]">
          
          <div className="space-y-3 md:space-y-4">
             <h1 className="text-[42px] md:text-[72px] font-black tracking-[-0.04em] leading-[0.85] lowercase">
               the winter kit
             </h1>
             <div className="flex items-center gap-4 md:gap-6">
               <p className="text-[9px] md:text-[12px] font-black uppercase tracking-[0.2em] opacity-60">THREE COZY SKIN ESSENTIALS</p>
               <div className="flex items-center gap-1">
                  <div className="flex text-black">
                    {[...Array(5)].map((_, i) => <Star key={i} size={8} className="md:size-[10px]" fill="currentColor" />)}
                  </div>
                  <span className="text-[10px] md:text-[11px] font-bold opacity-40">(61)</span>
               </div>
             </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <p className="text-[14px] md:text-[15px] leading-relaxed text-[#444] font-medium opacity-80">
              Cozy hydration that fits in your carry-on. Our limited edition kit bundles three winter essentials in the mini rhode bubble bag. Perfect for holiday travels, gifting, and keeping your skin and lips nourished in the cooler months.
            </p>
            
            <div className="space-y-3 text-[13px] md:text-[14px] border-t border-black/5 pt-6">
              <p className="text-[#444] leading-relaxed"><span className="font-black lowercase">includes:</span> little glazing milk, little barrier butter, and a scented peptide lip tint of your choice.</p>
              <div className="flex justify-between items-center py-2">
                <p className="font-black lowercase">original value: <span className="opacity-40 line-through ml-1">$94</span></p>
                <p className="font-black text-[15px] md:text-[18px]">$78.00</p>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-6 md:space-y-8">
             <div className="flex items-center gap-2 text-[12px] md:text-[13px]">
               <span className="opacity-40 lowercase">select tint:</span>
               <button className="font-black underline underline-offset-4 flex items-center gap-1 lowercase">
                 espresso
                 <ChevronDown size={14} />
               </button>
             </div>

             <div className="space-y-4">
               <motion.button 
                 whileHover={{ scale: 1.01 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => addToCart(product)}
                 className="w-full bg-black text-white py-5 rounded-full text-[12px] md:text-[13px] font-black uppercase tracking-[0.2em] hover:bg-black/90 transition-all duration-300 shadow-xl shadow-black/10 flex items-center justify-center gap-2"
               >
                 <ShoppingBag size={16} />
                 {lang === 'en' ? `add to bag — ${product.price}` : `أضف للسلة — ${product.price}`}
               </motion.button>
               <div className="flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-bold opacity-30">
                 {lang === 'en' ? 'or 4 interest-free payments with' : 'أو 4 دفعات بدون فوائد مع'} <span className="text-black font-black bg-[#ACEBFF] px-1.5 py-0.5 rounded italic">Afterpay</span>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. KIT CONTENTS SECTION - REFINED FOR MOBILE */}
      <section className="px-4 md:px-6 pb-12 md:pb-16">
        <div className="max-w-[1600px] mx-auto bg-[#F2F1ED] rounded-[24px] md:rounded-[40px] px-6 md:px-20 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-center overflow-hidden">
          
          <div className="space-y-8 md:space-y-12 order-2 md:order-1 px-2 md:px-0">
            <h2 className="text-[28px] md:text-[44px] tracking-tight leading-[1] max-w-sm">
              <span className="font-black uppercase">TRAVEL-SIZE</span>{' '}
              <span className="text-[#666] italic font-serif">staples for</span>{' '}
              <br className="hidden md:block" />
              <span className="font-black uppercase">WINTER</span>{' '}
              <span className="text-[#666] italic font-serif">skin.</span>
            </h2>

            <div className="border-t border-black/10 pt-4">
              {[
                "LITTLE GLAZING MILK",
                "LITTLE BARRIER BUTTER",
                "SCENTED PEPTIDE LIP TINT",
                "MINI RHODE BUBBLE BAG"
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="group flex items-center justify-between py-5 md:py-6 border-b border-black/10 cursor-pointer hover:bg-black/5 px-2 transition-colors"
                >
                  <span className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.15em]">{item}</span>
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#66635F] text-white flex items-center justify-center group-hover:bg-black transition-colors">
                    <Plus size={12} className="md:size-[14px]" strokeWidth={3} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 md:order-2 bg-white rounded-[24px] md:rounded-[32px] overflow-hidden aspect-square md:h-[500px] shadow-sm">
             <ImageWithFallback 
               src="https://images.unsplash.com/photo-1635870224943-26189bd9e527?q=80&w=1200" 
               alt="Kit swatches" 
               className="w-full h-full object-cover" 
             />
          </div>
        </div>
      </section>

      {/* 3. APPLICATION SECTION - MERGED FOR MOBILE */}
      <section className="px-4 md:px-6 pb-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* SHARED/CONTENT BOX */}
            <div className="bg-[#F2F1ED] rounded-[32px] p-6 md:p-12 flex flex-col justify-between min-h-fit md:min-h-[600px] shadow-sm border border-black/[0.02]">
              <div className="space-y-6 md:space-y-10">
                {/* Thumbnails - Optimized size for mobile */}
                <div className="flex gap-2 md:gap-3">
                  {applicationSteps.map((step, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveStep(i)}
                      className={`w-14 md:w-32 aspect-square rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${activeStep === i ? 'ring-2 ring-black scale-105 z-10' : 'opacity-30 hover:opacity-100'}`}
                    >
                       <ImageWithFallback src={step.image} alt="step" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="space-y-6 md:space-y-8 relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeStep}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                      className="space-y-4 md:space-y-6"
                    >
                      <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.25em] opacity-40">APPLICATION</p>
                      <div className="flex gap-3 md:gap-4 items-start max-w-md">
                         <span className="text-[10px] md:text-[11px] font-bold opacity-30 mt-1.5">{applicationSteps[activeStep].number}</span>
                         <h3 className="text-[20px] md:text-[32px] font-medium leading-[1.3] text-[#333] tracking-tight">
                           {applicationSteps[activeStep].text}
                         </h3>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Mobile Integrated Image - Reduced height for professionalism */}
                <div className="md:hidden relative h-[280px] rounded-[24px] overflow-hidden shadow-inner mt-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0"
                    >
                      <ImageWithFallback 
                        src={applicationSteps[activeStep].image} 
                        alt="Step Result" 
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Navigation Arrow */}
              <div className="flex justify-end pt-6">
                <button 
                  onClick={() => setActiveStep((prev) => (prev + 1) % applicationSteps.length)}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-black/10 flex items-center justify-center bg-white/50 md:bg-transparent hover:bg-black hover:text-white transition-all group"
                >
                  <ChevronRight size={18} className="md:size-[20px] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* DESKTOP ONLY SIDE IMAGE */}
            <div className="hidden md:block bg-white rounded-[32px] overflow-hidden min-h-[600px] shadow-sm relative group border border-black/[0.02]">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={activeStep}
                   initial={{ opacity: 0, scale: 1.02 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.98 }}
                   transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                   className="absolute inset-0"
                 >
                   <ImageWithFallback 
                     src={applicationSteps[activeStep].image} 
                     alt="Application result" 
                     className="w-full h-full object-cover" 
                   />
                 </motion.div>
               </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* 4. RESULTS SECTION - REFINED FOR MOBILE TO MATCH IMAGE */}
      <section className="px-4 md:px-6 pb-20">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* TOP RESULTS CARD */}
          <div className="bg-[#F2F1ED] rounded-[32px] p-8 md:p-16 flex flex-col justify-between min-h-[550px] md:min-h-[600px] border border-black/[0.02]">
            <div className="space-y-12 md:space-y-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={resultsTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-10 md:space-y-14"
                >
                  {resultsTab === 0 ? (
                    <>
                      <div className="space-y-2">
                        <h4 className="text-[48px] md:text-[64px] font-bold text-[#4A5D4E] tracking-tight leading-none">97%</h4>
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#333] opacity-60">AGREED IT LEAVES SKIN DEWY, RADIANT, AND GLOWING</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[48px] md:text-[64px] font-bold text-[#4A5D4E] tracking-tight leading-none">90%</h4>
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#333] opacity-60">AGREED SKIN FEELS HYDRATED ALL DAY</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[48px] md:text-[64px] font-bold text-[#4A5D4E] tracking-tight leading-none">87%</h4>
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#333] opacity-60">AGREED IT HELPS CALM IRRITATED SKIN</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <h4 className="text-[48px] md:text-[64px] font-bold text-[#4A5D4E] tracking-tight leading-none">100%</h4>
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#333] opacity-60">COMMUNITY AGREED IT&apos;S THE PERFECT WINTER BASE</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[48px] md:text-[64px] font-bold text-[#4A5D4E] tracking-tight leading-none">95%</h4>
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#333] opacity-60">SAID IT REPLACED THEIR DAILY MOISTURIZER</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[48px] md:text-[64px] font-bold text-[#4A5D4E] tracking-tight leading-none">92%</h4>
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#333] opacity-60">LOVED THE COZY, SCENTED EXPERIENCE</p>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* MOBILE ONLY TRANSFORMATION IMAGE - INTEGRATED IN BOX */}
            <div className="md:hidden relative h-[300px] rounded-[24px] overflow-hidden mt-10 shadow-sm">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={resultsTab}
                   initial={{ opacity: 0, scale: 1.05 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.6 }}
                   className="absolute inset-0 flex h-full"
                 >
                   <div className="relative w-1/2 h-full overflow-hidden">
                     <ImageWithFallback 
                       src={resultsTab === 0 ? "https://images.unsplash.com/photo-1589221134210-f010476445e2?q=80&w=800" : "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800"} 
                       alt="Before" 
                       className="w-full h-full object-cover grayscale-[0.2]" 
                     />
                     <div className="absolute inset-0 bg-black/5" />
                   </div>
                   <div className="relative w-1/2 h-full overflow-hidden border-l border-white/20">
                     <ImageWithFallback 
                       src={resultsTab === 0 ? "https://images.unsplash.com/photo-1663691222849-92b8eb09fda5?q=80&w=800" : "https://images.unsplash.com/photo-1616683693504-3ce769069d67?q=80&w=800"} 
                       alt="After" 
                       className="w-full h-full object-cover" 
                     />
                   </div>
                 </motion.div>
               </AnimatePresence>
            </div>

            <div className="space-y-8 md:space-y-10 pt-12">
              <p className="text-[9px] md:text-[10px] leading-relaxed opacity-30 italic max-w-[280px]">
                {resultsTab === 0 
                  ? "*Based on a 31-subject consumer perception study after one week of use. Photos have not been retouched."
                  : "*Results shared by our community members after 2 weeks of consistent use. Real skin, no filters."}
              </p>

              <div className="space-y-2.5">
                <button 
                  onClick={() => setResultsTab(0)}
                  className={`w-full py-5 px-8 rounded-[14px] text-left transition-all text-[15px] md:text-[17px] font-medium lowercase ${resultsTab === 0 ? 'bg-black/[0.04] border border-black/10 text-black shadow-sm' : 'text-black/30 hover:text-black/50'}`}
                >
                  consumer study results
                </button>
                <button 
                  onClick={() => setResultsTab(1)}
                  className={`w-full py-5 px-8 rounded-[14px] text-left transition-all text-[15px] md:text-[17px] font-medium lowercase ${resultsTab === 1 ? 'bg-black/[0.04] border border-black/10 text-black shadow-sm' : 'text-black/30 hover:text-black/50'}`}
                >
                  community results
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM TRANSFORMATION CARD - DESKTOP ONLY */}
          <div className="hidden md:block bg-white rounded-[32px] overflow-hidden aspect-[4/5] md:min-h-[600px] relative group border border-black/[0.02] shadow-sm">
             <AnimatePresence mode="wait">
               <motion.div
                 key={resultsTab}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.6 }}
                 className="absolute inset-0 flex h-full"
               >
                 {/* LEFT HALF */}
                 <div className="relative w-1/2 h-full border-r border-white/20 overflow-hidden">
                   <ImageWithFallback 
                     src={resultsTab === 0 ? "https://images.unsplash.com/photo-1589221134210-f010476445e2?q=80&w=800" : "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800"} 
                     alt="Before" 
                     className="w-full h-full object-cover grayscale-[0.2]" 
                   />
                   <div className="absolute inset-0 bg-black/5" />
                   <div className="absolute bottom-6 left-0 w-full flex justify-center z-10">
                     <div className="bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-bold text-white uppercase tracking-widest border border-white/10">
                       Before
                     </div>
                   </div>
                 </div>

                 {/* RIGHT HALF */}
                 <div className="relative w-1/2 h-full overflow-hidden">
                   <ImageWithFallback 
                     src={resultsTab === 0 ? "https://images.unsplash.com/photo-1663691222849-92b8eb09fda5?q=80&w=800" : "https://images.unsplash.com/photo-1616683693504-3ce769069d67?q=80&w=800"} 
                     alt="After" 
                     className="w-full h-full object-cover" 
                   />
                   <div className="absolute bottom-6 left-0 w-full flex justify-center z-10">
                     <div className="bg-white/20 backdrop-blur-lg px-4 py-1.5 rounded-full text-[9px] font-bold text-white uppercase tracking-widest border border-white/20">
                       After
                     </div>
                   </div>
                 </div>
               </motion.div>
             </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 5. ROUTINE SECTION - MATCHING ATTACHED IMAGE */}
      <section className="px-4 lg:px-6 pb-20">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* LEFT: LIFESTYLE IMAGE */}
          <div className="bg-white rounded-[24px] overflow-hidden min-h-[500px] lg:min-h-[700px] relative">
             <ImageWithFallback 
               src="https://images.unsplash.com/photo-1747324831504-5ee9aa8eec59?q=80&w=1200" 
               alt="The rhode routine" 
               className="w-full h-full object-cover" 
             />
          </div>

          {/* RIGHT: INTERACTIVE ROUTINE */}
          <div className="bg-[#FAF9F6] rounded-[24px] p-8 lg:p-16 flex flex-col justify-between min-h-[500px] lg:min-h-[700px] relative overflow-hidden">
            <div className="space-y-4">
               <h2 className="text-[44px] lg:text-[56px] font-medium leading-[1] text-[#333]">
                 The rhode ROUTINE for <br />
                 <span className="uppercase font-black">GLAZED</span> skin.
               </h2>
               <p className="text-[14px] text-[#666]">Your morning and evening skincare steps.</p>
            </div>

            {/* INTERACTIVE SWATCH AREA */}
            <div className="flex-1 flex items-center justify-center relative py-12">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={activeRoutineStep}
                   initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                   animate={{ opacity: 1, scale: 1, rotate: 0 }}
                   exit={{ opacity: 0, scale: 1.1, rotate: 5 }}
                   transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                   className="relative w-full aspect-square max-w-[400px]"
                 >
                   <ImageWithFallback 
                     src={routineSteps[activeRoutineStep].image} 
                     alt={routineSteps[activeRoutineStep].title} 
                     className="w-full h-full object-contain mix-blend-multiply" 
                   />
                   
                   {/* LABEL TOOLTIP */}
                   <motion.div 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.4 }}
                     className="absolute top-[40%] left-[-20px] lg:left-[-40px] z-10"
                   >
                     <div className="flex flex-col">
                        <span className="text-[14px] font-black uppercase tracking-widest text-[#333] mb-0.5">
                          {routineSteps[activeRoutineStep].title}
                        </span>
                        <span className="text-[12px] text-[#666]">{routineSteps[activeRoutineStep].subtitle}</span>
                        <div className="w-[100px] lg:w-[150px] h-[1px] bg-black/10 mt-2 relative">
                           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black/20 rounded-full" />
                        </div>
                     </div>
                   </motion.div>
                 </motion.div>
               </AnimatePresence>
            </div>

            {/* STEP NAVIGATION */}
            <div className="grid grid-cols-5 gap-2 lg:gap-4">
               {routineSteps.map((step, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setActiveRoutineStep(idx)}
                   className="flex flex-col items-center gap-4 group"
                 >
                   <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full border-2 flex items-center justify-center text-[12px] font-black transition-all duration-500 ${activeRoutineStep === idx ? 'bg-black border-black text-white' : 'border-black/10 bg-transparent text-black/40 hover:border-black/30'}`}>
                     0{idx + 1}
                   </div>
                   <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeRoutineStep === idx ? 'opacity-100' : 'opacity-20 group-hover:opacity-60'}`}>
                     {step.label}
                   </span>
                 </button>
               ))}
            </div>
          </div>

        </div>
      </section>

      {/* 6. REVIEWS SECTION */}
      <section className="px-4 lg:px-6 pb-32">
        <div className="max-w-[1600px] mx-auto bg-[#FAF9F6] rounded-[24px] p-8 lg:p-16">
          
          <div className="border-b border-black/10 pb-8 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-[44px] font-black tracking-tighter">4.7</span>
                  <div className="flex text-black mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[12px] font-black uppercase tracking-widest text-[#333]">AVERAGE RATING</p>
                  <p className="text-[12px] text-[#333] opacity-40">Based on 6,021 reviews</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-black/10 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                  FILTERS
                </button>
                <div className="relative group">
                  <button className="flex items-center gap-6 px-6 py-2.5 rounded-full border border-black/10 text-[10px] font-black uppercase tracking-widest hover:border-black transition-all">
                    MOST RECENT <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`relative transition-all duration-700 ease-in-out overflow-hidden ${!isReviewsExpanded ? 'max-h-[500px] md:max-h-none' : 'max-h-[5000px]'}`}>
            <div className="divide-y divide-black/5">
              {reviews.map((review, idx) => (
                <ReviewItem key={idx} review={review} />
              ))}
            </div>
            
            {/* Mobile Gradient Overlay */}
            {!isReviewsExpanded && (
              <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/80 to-transparent z-10 md:hidden pointer-events-none" />
            )}
          </div>

          <div className="flex justify-center pt-8 md:pt-12 relative z-20">
            <button 
              onClick={() => setIsReviewsExpanded(!isReviewsExpanded)}
              className="px-12 py-3 rounded-full border border-black/10 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-500 bg-white"
            >
              {isReviewsExpanded ? 'SHOW LESS' : 'SHOW MORE'}
            </button>
          </div>
        </div>
      </section>

      {/* 7. LINEUP SECTION */}
      <ProductLineup />

      {/* FLOATING STICKY BAR */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ 
            y: showBottomBar ? 0 : 120, 
            opacity: showBottomBar ? 1 : 0 
          }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="fixed bottom-0 left-0 w-full bg-[#EEEEEE] px-8 py-3 flex items-center justify-between z-50 border-t border-black/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-white rounded-md flex items-center justify-center p-1.5 shadow-sm">
               <ImageWithFallback src="https://images.unsplash.com/photo-1739984730991-3a592bc6f12d?q=80&w=200" alt="kit icon" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#333]">THE WINTER KIT</span>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => addToCart(product)}
            className="bg-[#66635F] text-white px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all duration-300 flex items-center gap-2"
          >
            <ShoppingBag size={14} />
            {lang === 'en' ? `BUY NOW - ${product.price}` : `اشتر الآن - ${product.price}`}
          </motion.button>
        </motion.div>
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};
