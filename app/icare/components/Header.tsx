import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, Search, ShoppingBag, Globe, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { translations, Language } from '../translations';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { Product } from '../types';
import { icareApi, IcareApiError } from '../lib/api-client';
import { mapBackendProductToProduct } from '../lib/mappers';

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

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      if (!icareApi.isConfigured()) return;
      try {
        const products = await icareApi.products.featured(4);
        if (products.length > 0) {
          setPreviewProducts(products.map((product) => mapBackendProductToProduct(product)));
        }
      } catch (error) {
        if (!(error instanceof IcareApiError && error.status === 0)) {
          console.error('Failed to load header previews', error);
        }
      }
    };

    loadFeaturedProducts();
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
          {announcementText}
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
          <motion.button 
            onClick={() => onNavigate('home')}
            className="absolute left-1/2 -translate-x-1/2 h-16 md:h-20 w-auto flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img 
              src="/icare-logo.png" 
              alt="icare beauty" 
              className="h-full w-auto object-contain transition-all duration-500"
            />
          </motion.button>

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
                {previewCategories.length > 0 && (
                  <div className="flex justify-end gap-10 mb-16 px-10">
                    {previewCategories.map((cat) => (
                      <button
                        key={cat}
                        onMouseEnter={() => setActiveCategory(cat)}
                        className={`text-[15px] font-bold uppercase tracking-tight relative transition-all duration-300 ${
                          activePreviewCategory.trim().toLowerCase() === cat.trim().toLowerCase() ? 'text-black' : 'text-[#9A9A9A]'
                        }`}
                      >
                        {cat}
                        {activePreviewCategory.trim().toLowerCase() === cat.trim().toLowerCase() && (
                          <motion.div
                            layoutId="activeCategoryUnderline"
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
                      className="bg-white/50 backdrop-blur-md rounded-[12px] p-8 flex flex-col group cursor-pointer hover:bg-white/80 transition-all duration-500"
                      onClick={() => { onProductSelect?.(product); setIsShopHovered(false); }}
                    >
                      <div className="relative aspect-square mb-10 flex items-center justify-center p-4">
                        <ImageWithFallback 
                          src={product.image} 
                          alt={product.title ?? product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="mt-auto">
                        <h4 className="text-[14px] font-bold uppercase tracking-tight text-black mb-1 italic">
                          {product.title ?? product.name}
                        </h4>
                        <p className="text-[14px] text-[#706E6A] font-medium leading-tight mb-4">
                          {product.description ?? product.price}
                        </p>
                        <button className="text-[11px] font-black uppercase tracking-widest border-b border-black pb-0.5 self-start hover:opacity-50 transition-opacity">
                          {t.shopNow}
                        </button>
                      </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="px-10 py-16 text-center text-[13px] font-bold uppercase tracking-[0.2em] text-black/40">
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
