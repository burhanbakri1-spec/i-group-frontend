import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { Menu, Search, ShoppingBag, Globe, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { translations, Language } from '../translations';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { Product } from '../types';
import { fetchCatalogProducts } from '../lib/catalog-client';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onNavigate: (page: string) => void;
  onProductSelect?: (product: Product) => void;
  onOpenMenu: () => void;
  isDrawerOpen?: boolean;
  lang: Language;
  onToggleLang: () => void;
}

const FOCUS_VISIBLE_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F6]';
const MUTED_TEXT_CLASS = 'text-[#5C5A56] hover:text-black';

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenSearch, onNavigate, onProductSelect, onOpenMenu, isDrawerOpen, lang, onToggleLang }) => {
  const t = translations[lang];
  const { cartCount, wishlistItems } = useShop();
  const { announcementText, shopEmptyAll } = useSiteContent();
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState(t.categories.all);
  const [isVisible, setIsVisible] = useState(true);
  const [isPinkTheme, setIsPinkTheme] = useState(false);
  const [previewProducts, setPreviewProducts] = useState<Product[]>([]);
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calmTween = shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' as const };

  const cancelHideTimer = () => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const showShop = () => {
    cancelHideTimer();
    setIsShopHovered(true);
  };

  const hideShop = () => {
    cancelHideTimer();
    hideTimerRef.current = setTimeout(() => setIsShopHovered(false), 200);
  };

  useEffect(() => () => { cancelHideTimer(); }, []);

  useEffect(() => {
    let cancelled = false;
    const loadPreviewProducts = async () => {
      const products = await fetchCatalogProducts();
      if (cancelled || products === null) return;
      setPreviewProducts(products.slice(0, 16));
    };
    loadPreviewProducts();
    return () => { cancelled = true; };
  }, []);

  const previewCategories = useMemo(() => {
    if (previewProducts.length === 0) return [];
    const backendCategories = Array.from(new Set(previewProducts
      .map((product) => product.category?.trim())
      .filter((category): category is string => Boolean(category))));

    return [t.categories.all, ...backendCategories];
  }, [previewProducts, t.categories.all]);

  const activePreviewCategory = previewCategories.some((category) => category.trim().toLowerCase() === activeCategory.trim().toLowerCase())
    ? activeCategory
    : t.categories.all;

  const visiblePreviewProducts = useMemo(() => {
    if (activePreviewCategory === t.categories.all) return previewProducts;
    return previewProducts.filter((product) => product.category?.trim().toLowerCase() === activePreviewCategory.trim().toLowerCase());
  }, [activePreviewCategory, previewProducts, t.categories.all]);

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

  const headerY = !isVisible || isDrawerOpen ? -128 : 0;
  const headerOpacity = isDrawerOpen ? 0 : 1;

  return (
    <motion.div 
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: headerY, opacity: headerOpacity }}
      transition={calmTween}
      onMouseLeave={hideShop}
      className={`fixed top-0 left-0 right-0 z-[60] ${isDrawerOpen ? 'pointer-events-none' : ''}`}
    >
      {/* Announcement Bar */}
      <div className="bg-[#FAF9F6]/70 backdrop-blur-xl text-[#5C5A56] py-2 text-center border-b border-black/5">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
          {announcementText}
        </span>
      </div>

      <div className="mx-3 md:mx-5 mt-2 md:mt-3">
        <header 
          className={`transition-colors duration-200 rounded-[12px] px-4 md:px-6 py-3 flex min-h-[64px] items-center justify-between border border-white/40 shadow-sm ${
            isPinkTheme ? 'bg-[#FFE4E6]/40' : 'bg-[#FAF9F6]/60'
          } backdrop-blur-3xl`}
        >
          {/* Navigation */}
          <div className="flex items-center gap-10">
            <button 
              onClick={onOpenMenu}
              className={`p-2 hover:bg-black/5 rounded-full transition-colors lg:hidden ${FOCUS_VISIBLE_CLASS}`}
              aria-label="Open menu"
            >
              <Menu size={20} className={isPinkTheme ? 'text-[#E11D48]' : 'text-[#706E6A]'} />
            </button>
            <nav className="hidden lg:flex items-center gap-7">
              <button 
                onMouseEnter={showShop}
                onClick={() => onNavigate('shop')}
                className={`rounded-full px-1 text-[13px] font-[800] uppercase tracking-normal transition-colors ${FOCUS_VISIBLE_CLASS} ${
                  isPinkTheme ? 'text-[#E11D48] hover:text-black' : MUTED_TEXT_CLASS
                }`}
              >
                {t.shop}
              </button>
              <button 
                onClick={() => onNavigate('story')}
                className={`rounded-full px-1 text-[13px] font-[800] uppercase tracking-normal transition-colors ${FOCUS_VISIBLE_CLASS} ${
                  isPinkTheme ? 'text-[#E11D48] hover:text-black' : MUTED_TEXT_CLASS
                }`}
              >
                {t.story}
              </button>
              <button 
                onClick={onToggleLang}
                className={`text-[12px] font-bold flex items-center gap-2 border border-black/10 px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors ${FOCUS_VISIBLE_CLASS} ${
                  isPinkTheme ? 'text-[#E11D48]' : 'text-[#5C5A56]'
                }`}
              >
                <Globe size={14} />
                {lang === 'en' ? 'العربية' : 'EN'}
              </button>
            </nav>
          </div>

          {/* Logo */}
          <motion.button 
            onClick={() => onNavigate('home')}
            className={`absolute left-1/2 -translate-x-1/2 h-12 md:h-14 lg:h-16 w-auto flex items-center justify-center rounded-full ${FOCUS_VISIBLE_CLASS}`}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
            transition={calmTween}
            aria-label="Go to home"
          >
            <img 
              src="/icare-logo.png" 
              alt="icare beauty" 
              className="h-full w-auto object-contain transition-all duration-200"
            />
          </motion.button>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-6">
            <button 
                onClick={onOpenSearch}
                className={`rounded-full px-1 text-[13px] font-[800] uppercase tracking-normal transition-colors ${FOCUS_VISIBLE_CLASS} ${
                  isPinkTheme ? 'text-[#E11D48] hover:text-black' : MUTED_TEXT_CLASS
                }`}
                aria-label={t.search}
            >
              <span className="hidden md:inline">{t.search}</span>
              <Search size={20} className="md:hidden" />
            </button>
            <button 
              onClick={() => onNavigate('wishlist')}
              className={`rounded-full px-1 text-[13px] font-[800] uppercase tracking-normal transition-colors relative ${FOCUS_VISIBLE_CLASS} ${
                isPinkTheme ? 'text-[#E11D48] hover:text-black' : MUTED_TEXT_CLASS
              }`}
              aria-label={t.wishlist}
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
              className={`rounded-full px-1 text-[13px] font-[800] uppercase tracking-normal transition-colors hidden md:block ${FOCUS_VISIBLE_CLASS} ${
                isPinkTheme ? 'text-[#E11D48] hover:text-black' : MUTED_TEXT_CLASS
              }`}
            >
              {t.account}
            </button>
            <button 
              onClick={onOpenCart}
              className={`rounded-full px-1 text-[13px] font-[800] uppercase tracking-normal transition-colors relative ${FOCUS_VISIBLE_CLASS} ${
                isPinkTheme ? 'text-[#E11D48] hover:text-black' : MUTED_TEXT_CLASS
              }`}
              aria-label={t.cart}
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
              transition={calmTween}
              className="absolute top-[calc(100%-8px)] left-0 z-[55] w-full bg-[#FAF9F6]/90 backdrop-blur-3xl rounded-[16px] pt-10 pb-12 shadow-xl overflow-hidden border border-white/40"
              onMouseEnter={showShop}
            >
              <div className="max-w-[1440px] mx-auto px-10">
                {previewCategories.length > 0 && (
                  <div className="flex justify-end gap-8 mb-10 px-10">
                    {previewCategories.map((cat) => (
                      <button
                        key={cat}
                        onMouseEnter={() => setActiveCategory(cat)}
                         className={`rounded-full px-1 text-[14px] font-bold uppercase tracking-tight relative transition-colors duration-200 ${FOCUS_VISIBLE_CLASS} ${
                           activePreviewCategory.trim().toLowerCase() === cat.trim().toLowerCase() ? 'text-black' : 'text-[#5C5A56]'
                         }`}
                      >
                        {cat}
                        {activePreviewCategory.trim().toLowerCase() === cat.trim().toLowerCase() && (
                           <motion.div
                             layoutId="activeCategoryUnderline"
                             transition={calmTween}
                             className="absolute -bottom-2 left-0 w-full h-[1px] bg-black"
                           />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {visiblePreviewProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-10">
                    {visiblePreviewProducts.map((product) => (
                    <motion.div 
                      key={product.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={calmTween}
                      className="bg-white/60 backdrop-blur-md rounded-[12px] p-6 flex flex-col group cursor-pointer hover:bg-white/85 transition-colors duration-200"
                      onClick={() => { onProductSelect?.(product); setIsShopHovered(false); }}
                    >
                      <div className="relative aspect-square mb-6 flex items-center justify-center p-4">
                        <ImageWithFallback 
                          src={product.image} 
                          alt={product.title ?? product.name}
                          className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-200"
                        />
                      </div>
                      <div className="mt-auto">
                        <h4 className="text-[14px] font-bold uppercase tracking-tight text-black mb-1 italic">
                          {product.title ?? product.name}
                        </h4>
                        <p className="text-[14px] text-[#5C5A56] font-medium leading-tight mb-4">
                          {product.description ?? product.price}
                        </p>
                        <button className={`text-[11px] font-black uppercase tracking-widest border-b border-black pb-0.5 self-start hover:opacity-70 transition-opacity ${FOCUS_VISIBLE_CLASS}`}>
                          {t.shopNow}
                        </button>
                      </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="px-10 py-16 text-center text-[13px] font-bold uppercase tracking-[0.2em] text-[#5C5A56]">
                    product previews unavailable
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
