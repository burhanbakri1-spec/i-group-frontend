import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Globe, Instagram, Music2, Youtube, Facebook } from 'lucide-react';
import { Language } from '../translations';
import { useShop } from '../context/ShopContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onOpenCart: () => void;
  onOpenSearch?: () => void;
  lang: Language;
  onToggleLang: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mobileCategoryProducts: Record<string, any[]> = {
  'SHOP ALL': [
    { id: 'm-sa1', title: 'BARRIER BUTTER', subtitle: 'The intensive moisture balm', badge: 'new', image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=200' },
    { id: 'm-sa2', title: 'THE WINTER KIT', subtitle: 'Three cozy skin essentials', badge: 'limited edition', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200' },
    { id: 'm-sa3', title: 'PEPTIDE LIP TINT', subtitle: 'Sheer but buildable color', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=200' }
  ],
  'FACE CARE': [
    { id: 'm-fc1', title: 'PEPTIDE GLAZE', subtitle: 'Dewy hydration fluid', badge: 'new', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=200' },
    { id: 'm-fc2', title: 'BARRIER BUTTER', subtitle: 'The intensive moisture balm', image: 'https://images.unsplash.com/photo-1549127024-18ee7271c819?q=80&w=200' },
    { id: 'm-fc3', title: 'DAILY CLEANSING', subtitle: 'Creamy milk wash', image: 'https://images.unsplash.com/photo-1559539751-030138c2955e?q=80&w=200' }
  ],
  'HAIR CARE': [
    { id: 'm-hc1', title: 'SCALP SERUM', subtitle: 'Root revitalization oil', image: 'https://images.unsplash.com/photo-1527799822367-a2886701f252?q=80&w=200' },
    { id: 'm-hc2', title: 'GLOSS RINSE', subtitle: 'Liquid shine treatment', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=200' }
  ],
  'BODY CARE': [
    { id: 'm-bc1', title: 'BODY GLAZE', subtitle: 'Full body hydration', image: 'https://images.unsplash.com/photo-1552046122-03184de85e08?q=80&w=200' },
    { id: 'm-bc2', title: 'CREAM WASH', subtitle: 'Scentless nutrition', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=200' }
  ],
  'MAKEUP': [
    { id: 'm-mu1', title: 'LIP TINT', subtitle: 'Sheer peptide gloss', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=200' },
    { id: 'm-mu2', title: 'CHEEK FLUSH', subtitle: 'Natural dewy blush', image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=200' }
  ],
  'NAILS': [
    { id: 'm-n1', title: 'PEARL POLISH', subtitle: 'Glazed donut finish', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=200' },
    { id: 'm-n2', title: 'STRENGTH BASE', subtitle: 'Keratin infused coat', image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=200' }
  ]
};

const mobileCategories = ['SHOP ALL', 'FACE CARE', 'HAIR CARE', 'BODY CARE', 'MAKEUP', 'NAILS'];

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onNavigate, onOpenCart, onOpenSearch, lang, onToggleLang }) => {
  // onOpenSearch is passed from parent but not currently used in this component
  void onOpenSearch;
  const [activeCategory, setActiveCategory] = useState('SHOP ALL');
  const { cartCount, wishlistItems } = useShop();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[200] bg-[#F2F1ED] flex flex-col"
        >
          {/* Mobile Header Inside Menu */}
          <div className="px-6 py-5 flex items-center justify-between">
            <button onClick={onClose} className="p-2">
              <X size={24} className="text-[#5C5A56]" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 h-10">
              <img src="/icare-logo.png" alt="icare" className="h-full w-auto object-contain" />
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={onToggleLang}
                className="p-2 flex items-center gap-1.5 border border-black/5 rounded-full bg-white/50"
              >
                <Globe size={16} className="text-[#5C5A56]" />
                <span className="text-[12px] font-bold text-[#5C5A56] uppercase">
                  {lang === 'en' ? 'AR' : 'EN'}
                </span>
              </button>
              <button onClick={() => { onNavigate('wishlist'); onClose(); }} className="p-2 relative">
                <Heart size={22} className="text-[#5C5A56]" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E11D48] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </button>
              <button onClick={() => { onOpenCart(); onClose(); }} className="p-2 relative">
                <ShoppingBag size={22} className="text-[#5C5A56]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Horizontal Category Scroll */}
          <div className="px-6 border-b border-[#D9D7D2] overflow-x-auto no-scrollbar">
            <div className="flex gap-8 min-w-max py-4">
              {mobileCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[13px] font-bold uppercase tracking-tight relative pb-2 transition-colors ${
                    activeCategory === cat ? 'text-black' : 'text-[#9A9A9A]'
                  }`}
                >
                  {cat}
                  {activeCategory === cat && (
                    <motion.div 
                      layoutId="mobileActiveTab"
                      className="absolute bottom-0 left-0 w-full h-[1.5px] bg-black"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Product List Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {mobileCategoryProducts[activeCategory]?.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => { onNavigate('shop'); onClose(); }}
                    className="bg-white rounded-[16px] p-4 flex items-center gap-5 relative group active:scale-[0.98] transition-transform"
                  >
                    <div className="w-20 h-20 bg-[#F9F9F8] rounded-[12px] flex items-center justify-center p-2">
                      <ImageWithFallback 
                        src={product.image} 
                        alt={product.title} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="text-[13px] font-bold uppercase tracking-tight text-[#444] leading-tight">
                          {product.title}
                        </h4>
                        {product.badge && (
                          <span className="text-[8px] font-bold uppercase tracking-widest bg-[#6E6E6E] text-white px-2 py-0.5 rounded-full">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#706E6A] font-medium leading-tight mt-1">
                        {product.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Navigation Links - Compact */}
          <div className="p-6 py-4 border-t border-[#D9D7D2] space-y-3 bg-white/30">
            <div className="flex gap-6">
              <button onClick={() => { onNavigate('story'); onClose(); }} className="block text-[15px] font-bold uppercase tracking-tight text-[#444]">
                {lang === 'en' ? 'STORY' : 'قصتنا'}
              </button>
              <button onClick={() => { onNavigate('vlog'); onClose(); }} className="block text-[15px] font-bold uppercase tracking-tight text-[#444]">
                {lang === 'en' ? 'VLOG' : 'فلوج'}
              </button>
              <button onClick={() => { onNavigate('account'); onClose(); }} className="block text-[15px] font-bold uppercase tracking-tight text-[#444]">
                {lang === 'en' ? 'ACCOUNT' : 'حسابي'}
              </button>
            </div>

            {/* Social Icons - Compact */}
            <div className="flex gap-4">
              <button className="p-2 bg-white rounded-full shadow-sm text-[#5C5A56]">
                <Instagram size={18} strokeWidth={1.5} />
              </button>
              <button className="p-2 bg-white rounded-full shadow-sm text-[#5C5A56]">
                <Music2 size={18} strokeWidth={1.5} />
              </button>
              <button className="p-2 bg-white rounded-full shadow-sm text-[#5C5A56]">
                <Youtube size={18} strokeWidth={1.5} />
              </button>
              <button className="p-2 bg-white rounded-full shadow-sm text-[#5C5A56]">
                <Facebook size={18} strokeWidth={1.5} />
              </button>
            </div>

            <p className="text-[9px] text-[#9A9A9A] font-bold tracking-widest uppercase">
              © ICARE 2026
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
