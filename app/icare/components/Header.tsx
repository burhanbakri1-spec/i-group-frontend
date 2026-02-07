import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, Search, User, ShoppingBag, Globe, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { translations, Language } from '../translations';
import { useShop } from '../context/ShopContext';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onNavigate: (page: string) => void;
  onOpenMenu: () => void;
  isDrawerOpen?: boolean;
  lang: Language;
  onToggleLang: () => void;
}

const categoryProducts: Record<string, any[]> = {
  'SHOP ALL': [
    { id: 'sa1', title: 'BARRIER BUTTER', subtitle: 'The intensive moisture balm', badge: 'allure', image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400' },
    { id: 'sa2', title: 'THE WINTER KIT', subtitle: 'Three cozy skin essentials', badge: 'limited edition', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400' },
    { id: 'sa3', title: 'PEPTIDE LIP TINT', subtitle: 'Sheer but buildable color', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400' },
    { id: 'sa4', title: 'POCKET CLEANSER', subtitle: 'Travel size hydration', image: 'https://images.unsplash.com/photo-1594125355977-903e303f4435?q=80&w=400' }
  ],
  'FACE CARE': [
    { id: 'fc1', title: 'PEPTIDE GLAZE', subtitle: 'Dewy hydration fluid', badge: 'allure', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=400' },
    { id: 'fc2', title: 'BARRIER BUTTER', subtitle: 'The intensive moisture balm', image: 'https://images.unsplash.com/photo-1549127024-18ee7271c819?q=80&w=400' }
  ]
};

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenSearch, onNavigate, onOpenMenu, isDrawerOpen, lang, onToggleLang }) => {
  const t = translations[lang];
  const { cartCount, wishlistItems } = useShop();
  const mainCategories = [t.categories.all, t.categories.face, t.categories.hair, t.categories.body, t.categories.makeup, t.categories.nails];
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState(t.categories.all);
  const [isVisible, setIsVisible] = useState(true);
  const [isPinkTheme, setIsPinkTheme] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    
    // Hide/Show header on scroll
    if (latest > previous && latest > 150) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }

    if (latest > 1200 && latest < 2200) {
      setIsPinkTheme(true);
    } else {
      setIsPinkTheme(false);
    }
  });

  const headerY = !isVisible || isDrawerOpen ? -200 : 0;
  const headerOpacity = isDrawerOpen ? 0 : 1;

  return (
    <motion.div 
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: headerY, opacity: headerOpacity }}
      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
      onMouseLeave={() => setIsShopHovered(false)} 
      className="fixed top-0 left-0 right-0 z-[9999]"
    >
      {/* Announcement Bar */}
      <div className="bg-[#FAF9F6]/60 backdrop-blur-xl text-[#706E6A] py-3 text-center border-b border-black/5">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em]">
          {lang === 'en' ? 'FREE US SHIPPING ON ORDERS OVER $45' : 'شحن مجاني للطلبات التي تزيد عن 45 دولاراً'}
        </span>
      </div>

      <div className="mx-4 mt-3">
        <header 
          className={`transition-colors duration-500 rounded-[12px] px-8 py-4 flex items-center justify-between border border-white/40 shadow-sm ${
            isPinkTheme ? 'bg-[#FFE4E6]/40' : 'bg-[#FAF9F6]/60'
          } backdrop-blur-3xl`}
        >
          {/* Navigation */}
          <div className="flex items-center gap-10">
            <button 
              onClick={onOpenMenu}
              className="p-2 hover:bg-black/5 rounded-full transition-colors lg:hidden"
            >
              <Menu size={20} className={isPinkTheme ? 'text-[#E11D48]' : 'text-[#706E6A]'} />
            </button>
            <nav className="hidden lg:flex items-center gap-10">
              <button 
                onMouseEnter={() => setIsShopHovered(true)}
                onClick={() => onNavigate('shop')}
                className={`text-[14px] font-[800] uppercase tracking-normal transition-colors ${
                  isPinkTheme ? 'text-[#E11D48] hover:text-black' : 'text-[#706E6A] hover:text-black'
                }`}
              >
                {t.shop}
              </button>
              <button 
                onClick={() => onNavigate('story')}
                className={`text-[14px] font-[800] uppercase tracking-normal transition-colors ${
                  isPinkTheme ? 'text-[#E11D48] hover:text-black' : 'text-[#706E6A] hover:text-black'
                }`}
              >
                {t.story}
              </button>
              <button 
                onClick={onToggleLang}
                className={`text-[12px] font-bold flex items-center gap-2 border border-black/10 px-3 py-1 rounded-full hover:bg-black/5 transition-all ${
                  isPinkTheme ? 'text-[#E11D48]' : 'text-[#706E6A]'
                }`}
              >
                <Globe size={14} />
                {lang === 'en' ? 'العربية' : 'EN'}
              </button>
            </nav>
          </div>

          {/* Logo - Increased Size */}
          <button 
            onClick={() => onNavigate('home')}
            className="absolute left-1/2 -translate-x-1/2 h-16 md:h-20 w-auto flex items-center justify-center transition-all duration-500"
          >
            <img 
              src="/logo.svg" 
              alt="icare beauty" 
              className="h-full w-auto object-contain transition-all duration-500 py-1"
              style={{ 
                filter: isPinkTheme 
                  ? 'none' 
                  : 'grayscale(1) brightness(0.4) contrast(1.2) opacity(0.8)' 
              }}
            />
          </button>

          {/* Actions */}
          <div className="flex items-center gap-4 md:gap-8">
            <button 
                onClick={onOpenSearch}
                className={`text-[14px] font-[800] uppercase tracking-normal transition-colors ${
                  isPinkTheme ? 'text-[#E11D48] hover:text-black' : 'text-[#706E6A] hover:text-black'
                }`}
            >
              <span className="hidden md:inline">{t.search}</span>
              <Search size={20} className="md:hidden" />
            </button>
            <button 
              onClick={() => onNavigate('wishlist')}
              className={`text-[14px] font-[800] uppercase tracking-normal transition-colors relative ${
                isPinkTheme ? 'text-[#E11D48] hover:text-black' : 'text-[#706E6A] hover:text-black'
              }`}
            >
              <span className="hidden md:inline">{t.wishlist}</span>
              <div className="md:hidden relative">
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#E11D48] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
            </button>
            <button 
              onClick={() => onNavigate('account')}
              className={`text-[14px] font-[800] uppercase tracking-normal transition-colors hidden md:block ${
                isPinkTheme ? 'text-[#E11D48] hover:text-black' : 'text-[#706E6A] hover:text-black'
              }`}
            >
              {t.account}
            </button>
            <button 
              onClick={onOpenCart}
              className={`text-[14px] font-[800] uppercase tracking-normal transition-colors relative ${
                isPinkTheme ? 'text-[#E11D48] hover:text-black' : 'text-[#706E6A] hover:text-black'
              }`}
            >
              <span className="hidden md:inline">{t.cart} ({cartCount})</span>
              <div className="md:hidden flex items-center gap-1 relative">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </header>

        {/* Mega Menu Dropdown */}
        <AnimatePresence>
          {isShopHovered && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 w-full mt-3 bg-[#FAF9F6]/80 backdrop-blur-3xl rounded-[16px] pt-12 pb-20 shadow-2xl overflow-hidden border border-white/40"
            >
              <div className="max-w-[1440px] mx-auto px-10">
                <div className="flex justify-end gap-10 mb-16 px-10">
                  {mainCategories.map((cat) => (
                    <button
                      key={cat}
                      onMouseEnter={() => setActiveCategory(cat)}
                      className={`text-[15px] font-bold uppercase tracking-tight relative transition-all duration-300 ${
                        activeCategory === cat ? 'text-black' : 'text-[#9A9A9A]'
                      }`}
                    >
                      {cat}
                      {activeCategory === cat && (
                        <motion.div 
                          layoutId="activeCategoryUnderline"
                          className="absolute -bottom-2 left-0 w-full h-[1px] bg-black"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-10">
                  {(categoryProducts['SHOP ALL']).map((product) => (
                    <motion.div 
                      key={product.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white/50 backdrop-blur-md rounded-[12px] p-8 flex flex-col group cursor-pointer hover:bg-white/80 transition-all duration-500"
                      onClick={() => { onNavigate('shop'); setIsShopHovered(false); }}
                    >
                      <div className="relative aspect-square mb-10 flex items-center justify-center p-4">
                        <ImageWithFallback 
                          src={product.image} 
                          alt={product.title} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="mt-auto">
                        <h4 className="text-[14px] font-bold uppercase tracking-tight text-black mb-1 italic">
                          {product.title}
                        </h4>
                        <p className="text-[14px] text-[#706E6A] font-medium leading-tight mb-4">
                          {product.subtitle}
                        </p>
                        <button className="text-[11px] font-black uppercase tracking-widest border-b border-black pb-0.5 self-start hover:opacity-50 transition-opacity">
                          {t.shopNow}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
