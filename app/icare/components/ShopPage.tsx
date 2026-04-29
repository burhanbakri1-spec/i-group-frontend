import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProductCard } from './ProductCard';
import { ChevronDown, Grid2X2, LayoutGrid, X } from 'lucide-react';
import { fetchWixProducts } from '../lib/wix-client';
import { Language } from '../translations';
import { Product } from '../types';

interface ShopPageProps {
  lang: Language;
  onProductSelect: (product: Product) => void;
}

const brandHierarchy: Record<string, string[]> = {
  'usa': ['ACURE', 'Advanced Clinicals', 'Benefit', 'CeraVe', 'Cetaphil', 'Clinique', 'COACH', 'Dermalogica', 'Dove', 'Elf', 'Estée Lauder', 'First Aid Beauty', 'Glossier', 'Gold Bond', 'Hero Cosmetics', 'Kiehl\'s', 'Laneige', 'M.A.C', 'Mario Badescu', 'Neutrogena', 'Old Spice', 'Origins', 'Oxy', 'Pacifica', 'Palmers', 'Paula\'s Choice', 'Peter Thomas Roth', 'Physicians Formula', 'Rare Beauty', 'Remington', 'SheaMoisture', 'Skinceuticals', 'Sol de Janeiro', 'Stridex', 'The Ordinary', 'Tree Hut', 'Vaseline', 'Victoria\'s Secret'],
  'korea (k-beauty)': ['Abib', 'Anua', 'AXIS-Y', 'Beauty of Joseon', 'Biodance', 'Celimax', 'COSRX', 'Dr.Althea', 'Farmstay', 'Heimish', 'KSecret', 'Mary&May', 'Medi-Peel', 'Mixsoon', 'Numbuzin', 'Purito', 'Round Lab', 'Skin1004', 'Some By Mi', 'Tocobo', 'Torriden'],
  'france': ['Bioderma', 'Dior', 'Embryolisse', 'Franck Olivier', 'Garnier', 'Givenchy', 'Jean Paul Gaultier', 'L\'Oréal', 'La Roche-Posay', 'Sephora', 'Vichy'],
  'italy': ['Dolce & Gabbana', 'Giorgio Armani', 'Kiko', 'Marvis', 'Moschino', 'Prada', 'Versace'],
  'united kingdom': ['Beauty Formulas', 'Charlotte Tilbury', 'Dyson', 'Perfekt'],
  'germany': ['Essence', 'Eucerin', 'Nivea'],
  'china': ['Bioaqua', 'Dr. Davey', 'Dr. Rashel', '8xp', 'ENZO', 'Iconsign', 'Kads', 'Karwell', 'Lanbena', 'New Jole', 'Sheglam', 'Ustar', 'Veralba'],
  'japan': ['&-Honey', 'Ouo', 'Fino'],
  'turkey': ['Gabrini', 'Golden Rose', 'Nascita'],
  'poland': ['Novaclear', 'Paese'],
  'uae': ['Huda Beauty', 'Zimaya'],
  'canada': ['The Ordinary'],
  'brazil': ['Skala'],
  'netherlands': ['Gisou'],
  'switzerland': ['Mavala'],
  'saudi arabia': ['LAVERNE', 'Areej'],
};

const categoryHierarchy = {
  'face care': {
    'cleansing & toning': ['cleansers (gel/cream)', 'toners', 'micellar water'],
    'moisturizers & treatments': ['face serums', 'face moisturizers', 'eye creams'],
    'masks & exfoliation': ['sheet masks', 'exfoliators & scrubs'],
    'sun protection': ['sunscreen']
  },
  'hair care': {
    'washing & routine': ['shampoo', 'conditioner', 'curly hair care'],
    'treatments & growth': ['hair oils', 'ampoules', 'hair vitamins'],
    'hair tools': ['hair dryers', 'curlers', 'hair brushes']
  },
  'body care': {
    'bath & body': ['shower gel', 'body lotion', 'body scrubs'],
    'fragrance & deo': ['body mist', 'perfumes', 'deodorants'],
    'hair removal': ['razors', 'laser devices']
  },
  'makeup': {
    'face & cheek': ['foundation', 'concealer', 'blush'],
    'eyes & lips': ['mascara', 'eyeliner', 'lipsticks']
  },
  'nails': {
    'polish & care': ['nail polish', 'nail treatments']
  },
  'brands': brandHierarchy,
  'trends': {
    'new arrivals': ['new in', 'limited edition'],
    'best sellers': ['allure winners', 'tiktok viral'],
    'gifted': ['sets', 'travel size']
  }
};

export const ShopPage: React.FC<ShopPageProps> = ({ lang, onProductSelect }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wixProducts, setWixProducts] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMain, setActiveMain] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [cols, setCols] = useState(3);
  const [activeSort, setActiveSort] = useState('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchWixProducts();
        if (data && Array.isArray(data) && data.length > 0) {
          setWixProducts(data);
        }
      } catch (err) {
        console.error("Failed to load Wix products", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const mockProducts = useMemo(() => [
    // FACE CARE
    { id: '1', main: 'face care', sub: 'cleansing & toning', type: 'cleansers (gel/cream)', brand: 'CeraVe', name: 'hydrating facial cleanser', price: '$18.00', rawPrice: 18, image: 'https://images.unsplash.com/photo-1714176774596-45946a7325fd?q=80&w=800', description: 'daily hydrating cleanser for normal to dry skin.', rating: '4.8', reviews: '1.2k', date: '2025-08-01' },
    { id: '4', main: 'face care', sub: 'moisturizers & treatments', type: 'face serums', brand: 'The Ordinary', name: 'niacinamide 10% + zinc 1%', price: '$12.00', rawPrice: 12, image: 'https://images.unsplash.com/photo-1714176774596-45946a7325fd?q=80&w=800', description: 'high-strength vitamin and mineral blemish formula.', rating: '4.7', reviews: '5k', date: '2025-06-20' },
    { id: '7', main: 'face care', sub: 'masks & exfoliation', type: 'sheet masks', brand: 'Laneige', name: 'water sleeping mask', price: '$32.00', rawPrice: 32, image: 'https://images.unsplash.com/photo-1762827990160-9f2d35fb0fd5?q=80&w=800', description: 'overnight mask for intensive hydration.', rating: '4.8', reviews: '3.1k', date: '2025-05-30' },
    { id: '9', main: 'face care', sub: 'sun protection', type: 'sunscreen', brand: 'La Roche-Posay', name: 'anthelios melt-in milk', price: '$36.00', rawPrice: 36, image: 'https://images.unsplash.com/photo-1661347243240-5ce7c9992369?q=80&w=800', description: 'broad spectrum spf 60 sunscreen for face and body.', rating: '4.7', reviews: '4.2k', date: '2025-03-25' },
    { id: '16', main: 'face care', sub: 'moisturizers & treatments', type: 'eye creams', brand: 'Kiehl\'s', name: 'creamy eye treatment with avocado', price: '$54.00', rawPrice: 54, image: 'https://images.unsplash.com/photo-1594813591867-02e797aa4581?q=80&w=800', description: 'nourishing under-eye cream with avocado oil.', rating: '4.6', reviews: '2.8k', date: '2025-10-10' },
    { id: '17', main: 'face care', sub: 'cleansing & toning', type: 'toners', brand: 'Paula\'s Choice', name: 'skin perfecting 2% bha liquid exfoliant', price: '$34.00', rawPrice: 34, image: 'https://images.unsplash.com/photo-1714176774596-45946a7325fd?q=80&w=800', description: 'cult-favorite liquid exfoliant for radiant skin.', rating: '4.9', reviews: '15k', date: '2025-11-05' },

    // HAIR CARE
    { id: '6', main: 'hair care', sub: 'hair tools', type: 'hair dryers', brand: 'Dyson', name: 'supersonic hair dryer', price: '$429.00', rawPrice: 429, image: 'https://images.unsplash.com/photo-1681837163667-2af19d19e413?q=80&w=800', description: 'engineered for different hair types.', rating: '4.9', reviews: '1.8k', date: '2025-11-12' },
    { id: '11', main: 'hair care', sub: 'washing & routine', type: 'shampoo', brand: 'SheaMoisture', name: 'raw shea butter shampoo', price: '$13.00', rawPrice: 13, image: 'https://images.unsplash.com/photo-1766142167641-507c80e35eb9?q=80&w=800', description: 'gentle cleansing for dry, damaged hair.', rating: '4.5', reviews: '2.1k', date: '2025-01-08' },
    { id: '18', main: 'hair care', sub: 'treatments & growth', type: 'hair oils', brand: 'Gisou', name: 'honey infused hair oil', price: '$46.00', rawPrice: 46, image: 'https://images.unsplash.com/photo-1766101293873-41ef9c5f32b5?q=80&w=800', description: 'enriched with honey from the mirsalehi bee garden.', rating: '4.7', reviews: '3.5k', date: '2025-09-22' },
    { id: '19', main: 'hair care', sub: 'washing & routine', type: 'curly hair care', brand: 'Olaplex', name: 'no. 3 hair perfector', price: '$30.00', rawPrice: 30, image: 'https://images.unsplash.com/photo-1766142167641-507c80e35eb9?q=80&w=800', description: 'strengthens and repairs damaged hair.', rating: '4.8', reviews: '25k', date: '2025-08-14' },

    // BODY CARE
    { id: '8', main: 'body care', sub: 'bath & body', type: 'body lotion', brand: 'Sol de Janeiro', name: 'brazilian bum bum cream', price: '$48.00', rawPrice: 48, image: 'https://images.unsplash.com/photo-1714176774596-45946a7325fd?q=80&w=800', description: 'fast-absorbing body cream with caffeine.', rating: '4.9', reviews: '12k', date: '2025-04-18' },
    { id: '2', main: 'body care', sub: 'fragrance & deo', type: 'perfumes', brand: 'LAVERNE', name: 'musk lavers perfume', price: '$85.00', rawPrice: 85, image: 'https://images.unsplash.com/photo-1737920459846-2d0318700658?q=80&w=800', description: 'luxury signature scent from saudi arabia.', rating: '5.0', reviews: '450', date: '2025-09-01' },
    { id: '20', main: 'body care', sub: 'bath & body', type: 'body scrubs', brand: 'Tree Hut', name: 'shea sugar scrub vitamin c', price: '$10.50', rawPrice: 10.5, image: 'https://images.unsplash.com/photo-1714176774596-45946a7325fd?q=80&w=800', description: 'exfoliates and brightens skin.', rating: '4.8', reviews: '18k', date: '2025-07-07' },
    { id: '21', main: 'body care', sub: 'fragrance & deo', type: 'body mist', brand: 'Victoria\'s Secret', name: 'bare vanilla mist', price: '$19.00', rawPrice: 19, image: 'https://images.unsplash.com/photo-1737920459846-2d0318700658?q=80&w=800', description: 'warm and cozy vanilla scent.', rating: '4.7', reviews: '6.2k', date: '2025-06-12' },

    // MAKEUP
    { id: '3', main: 'makeup', sub: 'face & cheek', type: 'blush', brand: 'Rare Beauty', name: 'soft pinch liquid blush', price: '$23.00', rawPrice: 23, image: 'https://images.unsplash.com/photo-1764333746618-6285bf70db23?q=80&w=800', description: 'weightless, long-lasting liquid blush.', rating: '4.9', reviews: '2.5k', date: '2025-07-15' },
    { id: '13', main: 'makeup', sub: 'eyes & lips', type: 'mascara', brand: 'Glossier', name: 'lash slick', price: '$18.00', rawPrice: 18, image: 'https://images.unsplash.com/photo-1764333746618-6285bf70db23?q=80&w=800', description: 'everyday mascara for length and lift.', rating: '4.6', reviews: '4.5k', date: '2024-11-15' },
    { id: '22', main: 'makeup', sub: 'face & cheek', type: 'foundation', brand: 'Giorgio Armani', name: 'luminous silk foundation', price: '$69.00', rawPrice: 69, image: 'https://images.unsplash.com/photo-1538489281439-336a8b1ccb2c?q=80&w=800', description: 'award-winning oil-free foundation.', rating: '4.9', reviews: '8k', date: '2025-12-05' },
    { id: '23', main: 'makeup', sub: 'eyes & lips', type: 'lipsticks', brand: 'Dior', name: 'rouge dior lipstick', price: '$45.00', rawPrice: 45, image: 'https://images.unsplash.com/photo-1709095458638-08cef2b85cc0?q=80&w=800', description: 'long-wear couture color lipstick.', rating: '4.8', reviews: '1.5k', date: '2025-10-20' },

    // NAILS
    { id: '12', main: 'nails', sub: 'polish & care', type: 'nail polish', brand: 'Essie', name: 'ballet slippers pink', price: '$10.00', rawPrice: 10, image: 'https://images.unsplash.com/photo-1698308233758-d55c98fd7444?q=80&w=800', description: 'classic sheer pink nail polish.', rating: '4.7', reviews: '6k', date: '2024-12-20' },
    { id: '24', main: 'nails', sub: 'polish & care', type: 'nail treatments', brand: 'Mavala', name: 'scientifique k+ nail hardener', price: '$22.00', rawPrice: 22, image: 'https://images.unsplash.com/photo-1616247380767-5ebadc9b869e?q=80&w=800', description: 'pro-keratin hardener for split nails.', rating: '4.8', reviews: '950', date: '2025-05-15' },

    // TRENDS & BRANDS
    { id: '5', main: 'brands', sub: 'korea (k-beauty)', type: 'COSRX', brand: 'COSRX', name: 'advanced snail 96 mucin', price: '$25.00', rawPrice: 25, image: 'https://images.unsplash.com/photo-1762827990160-9f2d35fb0fd5?q=80&w=800', description: 'hydrating essence with 96% snail secretion filtrate.', rating: '4.9', reviews: '8.2k', date: '2025-10-05' },
    { id: '10', main: 'brands', sub: 'france', type: 'Bioderma', brand: 'Bioderma', name: 'sensibio h2o micellar water', price: '$17.00', rawPrice: 17, image: 'https://images.unsplash.com/photo-1714176774596-45946a7325fd?q=80&w=800', description: 'original micellar water for sensitive skin.', rating: '4.8', reviews: '9k', date: '2025-02-14' },
    { id: '14', main: 'brands', sub: 'usa', type: 'Glossier', brand: 'Glossier', name: 'cloud paint blush', price: '$20.00', rawPrice: 20, image: 'https://images.unsplash.com/photo-1764333746618-6285bf70db23?q=80&w=800', description: 'seamless cheek color.', rating: '4.8', reviews: '7.2k', date: '2024-10-30' },
    { id: '25', main: 'brands', sub: 'saudi arabia', type: 'Areej', brand: 'Areej', name: 'oud wood fragrance', price: '$120.00', rawPrice: 120, image: 'https://images.unsplash.com/photo-1737920459846-2d0318700658?q=80&w=800', description: 'premium saudi oud fragrance.', rating: '5.0', reviews: '120', date: '2025-12-25' },
    { id: '15', main: 'trends', sub: 'new arrivals', type: 'new in', brand: 'rhode', name: 'peptide lip treatment', price: '$16.00', rawPrice: 16, image: 'https://images.unsplash.com/photo-1714176774596-45946a7325fd?q=80&w=800', description: 'restorative lip treatment for naturally plump lips.', rating: '4.9', reviews: '15k', date: '2025-12-01' },
    { id: '26', main: 'trends', sub: 'best sellers', type: 'tiktok viral', brand: 'Glow Recipe', name: 'watermelon glow dew drops', price: '$35.00', rawPrice: 35, image: 'https://images.unsplash.com/photo-1714176774596-45946a7325fd?q=80&w=800', description: 'viral niacinamide serum for glowing skin.', rating: '4.8', reviews: '10k', date: '2025-08-10' },
    { id: '27', main: 'face care', sub: 'moisturizers & treatments', type: 'face moisturizers', brand: 'Clinique', name: 'moisture surge 100h', price: '$46.00', rawPrice: 46, image: 'https://images.unsplash.com/photo-1714176774596-45946a7325fd?q=80&w=800', description: 'auto-replenishing hydrator.', rating: '4.7', reviews: '4k', date: '2025-07-28' },
    { id: '28', main: 'makeup', sub: 'eyes & lips', type: 'eyeliner', brand: 'Benefit', name: 'roller liner liquid eyeliner', price: '$22.00', rawPrice: 22, image: 'https://images.unsplash.com/photo-1764333746618-6285bf70db23?q=80&w=800', description: 'matte liquid eyeliner with precision felt tip.', rating: '4.6', reviews: '2.1k', date: '2025-09-15' },
    { id: '29', main: 'brands', sub: 'italy', type: 'Kiko', brand: 'Kiko', name: '3d hydra lip gloss', price: '$12.00', rawPrice: 12, image: 'https://images.unsplash.com/photo-1709095458638-08cef2b85cc0?q=80&w=800', description: 'softening lip gloss for a 3d look.', rating: '4.7', reviews: '5.5k', date: '2025-11-20' },
    { id: '30', main: 'hair care', sub: 'washing & routine', type: 'conditioner', brand: 'Nivea', name: 'pure color conditioner', price: '$8.00', rawPrice: 8, image: 'https://images.unsplash.com/photo-1766142167641-507c80e35eb9?q=80&w=800', description: 'protects color-treated hair.', rating: '4.4', reviews: '1.2k', date: '2025-03-10' }
  ], []);

  const allProducts = wixProducts || mockProducts;

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (activeMain) {
      if (activeMain === 'brands') {
        if (activeSub) {
          result = result.filter(p => p.sub?.toLowerCase() === activeSub.toLowerCase());
          if (activeType) {
            result = result.filter(p => p.brand?.toLowerCase() === activeType.toLowerCase());
          }
        } else {
          result = result.filter(p => p.main?.toLowerCase() === 'brands');
        }
      } else {
        result = result.filter(p => p.main?.toLowerCase() === activeMain.toLowerCase());
        if (activeSub) {
          result = result.filter(p => p.sub?.toLowerCase() === activeSub.toLowerCase());
        }
        if (activeType) {
          result = result.filter(p => p.type?.toLowerCase() === activeType.toLowerCase());
        }
      }
    }

    switch (activeSort) {
      case 'newest':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'price: low to high':
        result.sort((a, b) => (a.rawPrice || 0) - (b.rawPrice || 0));
        break;
      case 'price: high to low':
        result.sort((a, b) => (b.rawPrice || 0) - (a.rawPrice || 0));
        break;
      default:
        result.sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'));
        break;
    }

    return result;
  }, [allProducts, activeMain, activeSub, activeType, activeSort]);

  const resetFilters = () => {
    setActiveMain(null);
    setActiveSub(null);
    setActiveType(null);
    setVisibleCount(12);
  };

  const removeFilter = (level: number) => {
    if (level === 1) resetFilters();
    if (level === 2) { setActiveSub(null); setActiveType(null); setVisibleCount(12); }
    if (level === 3) { setActiveType(null); setVisibleCount(12); }
  };

  useEffect(() => {
    setVisibleCount(12);
  }, [activeMain, activeSub, activeType, activeSort]);

  if (loading && !wixProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Banner */}
      <section className="relative w-full h-[30vh] md:h-[40vh] overflow-hidden rounded-b-[24px]">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1920"
          alt="Shop Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/15 flex flex-col items-center justify-center text-white text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="text-[42px] md:text-[68px] font-brand lowercase italic leading-tight"
          >
            {lang === 'en' ? 'curated care' : 'عناية مختارة'}
          </motion.h1>
          <p className="text-[12px] font-bold uppercase tracking-[0.3em] mt-4 opacity-80">
            {lang === 'en' ? 'exploration of beauty' : 'استكشاف الجمال'}
          </p>
        </div>
      </section>

      {/* Navigation & Hierarchy */}
      <div className="max-w-[1600px] mx-auto px-6 py-10 flex flex-col gap-8">

        {/* Level 1: Main */}
        <div className="overflow-x-auto no-scrollbar border-b border-black/5 pb-4">
          <div className="flex md:justify-center justify-start gap-4 px-4 min-w-max">
            <button
              onClick={resetFilters}
              className={`px-8 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-all ${!activeMain ? 'bg-black text-white shadow-lg' : 'bg-white text-black/40 border border-black/5 hover:text-black'
                }`}
            >
              {lang === 'en' ? 'shop all' : 'تسوق الكل'}
            </button>
            {Object.keys(categoryHierarchy).map((main) => (
              <button
                key={main}
                onClick={() => { setActiveMain(main); setActiveSub(null); setActiveType(null); }}
                className={`px-8 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-all ${activeMain === main ? 'bg-black text-white shadow-lg' : 'bg-white text-black/40 border border-black/5 hover:text-black'
                  }`}
              >
                {main}
              </button>
            ))}
          </div>
        </div>

        {/* Level 2: Sub / Country */}
        <AnimatePresence mode="wait">
          {activeMain && (
            <motion.div
              key={activeMain}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="overflow-x-auto no-scrollbar border-b border-black/5 pb-4"
            >
              <div className="flex md:justify-center justify-start gap-3 px-4 min-w-max">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {Object.keys((categoryHierarchy as any)[activeMain]).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => { setActiveSub(sub); setActiveType(null); }}
                    className={`px-6 py-2 rounded-full text-[11px] font-bold uppercase transition-all ${activeSub === sub ? 'bg-white text-black border border-black shadow-sm' : 'bg-[#EFEEEC]/50 text-black/60 hover:bg-[#EFEEEC]'
                      }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level 3: Types / Brands (Logo Circles) */}
        <AnimatePresence mode="wait">
          {activeMain && activeSub && (
            <motion.div
              key={`${activeMain}-${activeSub}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white/40 rounded-[24px] p-6"
            >
              <div className="overflow-x-auto no-scrollbar">
                <div className={`flex ${activeMain === 'brands' ? 'gap-8' : 'gap-3 flex-wrap justify-center'} min-w-max`}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(categoryHierarchy as any)[activeMain][activeSub].map((item: string) => (
                    <button
                      key={item}
                      onClick={() => setActiveType(item)}
                      className="group flex flex-col items-center gap-3 transition-all"
                    >
                      {activeMain === 'brands' ? (
                        <div className={`w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center transition-all ${activeType === item ? 'ring-2 ring-black ring-offset-4 bg-black text-white' : 'bg-white border border-black/5 shadow-sm group-hover:shadow-md'
                          }`}>
                          <span className="text-[10px] font-black uppercase text-center px-2 leading-tight">
                            {item}
                          </span>
                        </div>
                      ) : (
                        <span className={`px-5 py-2 text-[11px] font-bold lowercase border rounded-full transition-all ${activeType === item ? 'bg-black text-white border-black' : 'bg-white/50 text-black/70 border-black/10 hover:border-black/30'
                          }`}>
                          {item}
                        </span>
                      )}
                      {activeMain === 'brands' && (
                        <span className={`text-[10px] font-bold lowercase ${activeType === item ? 'text-black' : 'text-black/50'}`}>
                          {item}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filter Badges */}
        {(activeMain || activeSub || activeType) && (
          <div className="flex flex-wrap items-center gap-3 px-4">
            <span className="text-[11px] font-bold text-black/40 uppercase tracking-widest">{lang === 'en' ? 'active filters:' : 'الفلاتر النشطة:'}</span>
            {activeMain && (
              <div className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {activeMain} <X size={12} className="cursor-pointer" onClick={() => removeFilter(1)} />
              </div>
            )}
            {activeSub && (
              <div className="flex items-center gap-2 bg-white border border-black px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {activeSub} <X size={12} className="cursor-pointer" onClick={() => removeFilter(2)} />
              </div>
            )}
            {activeType && (
              <div className="flex items-center gap-2 bg-[#EFEEEC] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {activeType} <X size={12} className="cursor-pointer" onClick={() => removeFilter(3)} />
              </div>
            )}
            <button onClick={resetFilters} className="text-[10px] font-bold text-black/40 underline underline-offset-4 hover:text-black transition-colors uppercase">
              {lang === 'en' ? 'clear all' : 'مسح الكل'}
            </button>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="max-w-[1600px] mx-auto px-6 py-6 flex justify-between items-center border-b border-black/5 mb-10 sticky top-0 bg-[#FFFFFF]/80 backdrop-blur-md z-40">
        <div className="relative">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsSortOpen(!isSortOpen)}>
            <span className="text-[14px] text-black/50 lowercase font-medium">sort:</span>
            <span className="text-[14px] text-black font-black lowercase">{activeSort}</span>
            <ChevronDown size={16} className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
          </div>
          <AnimatePresence>
            {isSortOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 mt-4 w-56 bg-white rounded-[16px] shadow-2xl z-50 py-3 border border-black/5"
              >
                {['featured', 'newest', 'price: low to high', 'price: high to low'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setActiveSort(opt); setIsSortOpen(false); }}
                    className="w-full text-left px-6 py-3 text-[13px] font-medium hover:bg-[#F2F1ED] transition-colors lowercase"
                  >
                    {opt}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => setCols(2)} className={`transition-colors ${cols === 2 ? 'text-black' : 'text-black/20 hover:text-black/40'}`}><LayoutGrid size={22} /></button>
          <button onClick={() => setCols(3)} className={`transition-colors hidden lg:block ${cols === 3 ? 'text-black' : 'text-black/20 hover:text-black/40'}`}><Grid2X2 size={22} /></button>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1600px] mx-auto px-3 md:px-6 pb-24">

        <div className={`grid grid-cols-2 ${cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-x-3 gap-y-3 md:gap-x-8 md:gap-y-16`}>
          {filteredProducts.slice(0, visibleCount).map((p) => (
            <ProductCard key={p.id} product={p} lang={lang} onSelect={() => onProductSelect(p)} />
          ))}
        </div>

        {visibleCount < filteredProducts.length && (
          <div className="mt-12 md:mt-20 flex justify-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="px-12 py-4 bg-black text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-black/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95"
            >
              {lang === 'en' ? 'show more' : 'عرض المزيد'}
            </button>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center">
            <h3 className="text-[24px] font-brand lowercase italic text-black/40">no products found in this selection.</h3>
            <button onClick={resetFilters} className="mt-6 text-[12px] font-black uppercase tracking-widest underline underline-offset-8">back to all products</button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
    </div>
  );
};
