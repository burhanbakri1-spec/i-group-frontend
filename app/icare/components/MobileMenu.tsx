import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ShoppingBag, Heart, Globe } from 'lucide-react';
import { Language } from '../translations';
import { useShop } from '../context/ShopContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { fetchCatalogProducts } from '../lib/catalog-client';
import { Product } from '../types';
import { useSiteContent } from '../hooks/useSiteContent';
import { getSocialPlatformIcon, getSocialPlatformLabel } from '../lib/social-links';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onProductSelect?: (product: Product) => void;
  onOpenCart: () => void;
  onOpenSearch?: () => void;
  lang: Language;
  onToggleLang: () => void;
}

const SHOP_ALL_CATEGORY = 'SHOP ALL';
const FOCUS_VISIBLE_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F1ED]';

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onNavigate, onProductSelect, onOpenCart, onOpenSearch, lang, onToggleLang }) => {
  // onOpenSearch is passed from parent but not currently used in this component
  void onOpenSearch;
  const [activeCategory, setActiveCategory] = useState(SHOP_ALL_CATEGORY);
  const [remoteProducts, setRemoteProducts] = useState<Product[]>([]);
  const { cartCount, wishlistItems } = useShop();
  const { socialLinks: rawSocialLinks } = useSiteContent();
  const shouldReduceMotion = useReducedMotion();
  const calmTween = shouldReduceMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' as const };

  useEffect(() => {
    if (!isOpen) return;
    const loadProducts = async () => {
      const products = await fetchCatalogProducts();
      setRemoteProducts(products ?? []);
    };
    loadProducts();
  }, [isOpen]);

  const mobileCategories = useMemo(() => {
    if (remoteProducts.length === 0) return [];
    const backendCategories = Array.from(new Set(remoteProducts
      .map((product) => product.category?.trim().toUpperCase())
      .filter((category): category is string => Boolean(category))));

    return [SHOP_ALL_CATEGORY, ...backendCategories];
  }, [remoteProducts]);

  const activeMobileCategory = mobileCategories.includes(activeCategory) ? activeCategory : SHOP_ALL_CATEGORY;

  const displayProducts = useMemo<Product[]>(() => {
    return remoteProducts
      .filter((product) => activeMobileCategory === SHOP_ALL_CATEGORY || product.category?.trim().toUpperCase() === activeMobileCategory)
      .slice(0, 4);
  }, [activeMobileCategory, remoteProducts]);

  const socialLinks = rawSocialLinks.map(({ platform, url }) => {
    const name = getSocialPlatformLabel(platform);
    const Icon = getSocialPlatformIcon(platform);
    return { name, url, Icon };
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { x: '-100%' }}
          animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { x: '-100%' }}
          transition={calmTween}
          className="fixed inset-0 z-[80] bg-[#F2F1ED] flex flex-col"
        >
          {/* Mobile Header Inside Menu */}
          <div className="px-6 py-5 flex items-center justify-between">
            <button onClick={onClose} className={`p-2 rounded-full hover:bg-black/5 transition-colors ${FOCUS_VISIBLE_CLASS}`} aria-label="Close menu">
              <X size={24} className="text-[#5C5A56]" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 h-10">
              <img src="/icare-logo.png" alt="icare" className="h-full w-auto object-contain" />
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={onToggleLang}
                className={`p-2 flex items-center gap-1.5 border border-black/10 rounded-full bg-white/60 hover:bg-white transition-colors ${FOCUS_VISIBLE_CLASS}`}
              >
                <Globe size={16} className="text-[#5C5A56]" />
                <span className="text-[12px] font-bold text-[#5C5A56] uppercase">
                  {lang === 'en' ? 'AR' : 'EN'}
                </span>
              </button>
              <button onClick={() => { onNavigate('wishlist'); onClose(); }} className={`p-2 relative rounded-full hover:bg-black/5 transition-colors ${FOCUS_VISIBLE_CLASS}`} aria-label="Open wishlist">
                <Heart size={22} className="text-[#5C5A56]" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E11D48] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </button>
              <button onClick={() => { onOpenCart(); onClose(); }} className={`p-2 relative rounded-full hover:bg-black/5 transition-colors ${FOCUS_VISIBLE_CLASS}`} aria-label="Open cart">
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
              {mobileCategories.length > 0 ? mobileCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[13px] font-bold uppercase tracking-tight relative pb-2 rounded-sm transition-colors ${FOCUS_VISIBLE_CLASS} ${
                      activeMobileCategory === cat ? 'text-black' : 'text-[#5C5A56]'
                    }`}
                  >
                    {cat}
                    {activeMobileCategory === cat && (
                      <motion.div
                        layoutId="mobileActiveTab"
                        transition={calmTween}
                        className="absolute bottom-0 left-0 w-full h-[1.5px] bg-black"
                      />
                    )}
                  </button>
                )) : (
                  <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#5C5A56] pb-2">
                    no categories available
                  </span>
                )}
            </div>
          </div>

          {/* Product List Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMobileCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={calmTween}
                className="space-y-3"
              >
                {displayProducts.length > 0 ? displayProducts.map((product) => (
                  <button
                    type="button"
                    key={product.id}
                    onClick={() => { onProductSelect?.(product); onClose(); }}
                    className={`w-full bg-white rounded-[16px] p-4 flex items-center gap-5 relative group active:scale-[0.99] transition-transform duration-150 text-left ${FOCUS_VISIBLE_CLASS}`}
                    aria-label={`${lang === 'en' ? 'Open product' : 'فتح المنتج'} ${product.title ?? product.name}`}
                  >
                    <div className="w-20 h-20 bg-[#F9F9F8] rounded-[12px] flex items-center justify-center p-2">
                      <ImageWithFallback 
                        src={product.image} 
                        alt={product.title ?? product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="text-[13px] font-bold uppercase tracking-tight text-[#444] leading-tight">
                          {product.title ?? product.name}
                        </h4>
                        {product.badge && (
                          <span className="text-[8px] font-bold uppercase tracking-widest bg-[#6E6E6E] text-white px-2 py-0.5 rounded-full">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#706E6A] font-medium leading-tight mt-1">
                        {product.description ?? <>{product.originalPrice && <span className="line-through mr-1">{product.originalPrice}</span>}{product.price}</>}
                      </p>
                    </div>
                  </button>
                )) : (
                  <div className="bg-white/70 rounded-[16px] p-6 text-center text-[12px] font-bold uppercase tracking-[0.15em] text-[#706E6A]">
                    no products available
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Navigation Links - Compact */}
          <div className="p-6 py-4 border-t border-[#D9D7D2] space-y-3 bg-white/30">
            <div className="flex gap-6">
                <button onClick={() => { onNavigate('story'); onClose(); }} className={`block rounded-sm text-[15px] font-bold uppercase tracking-tight text-[#444] hover:text-black transition-colors ${FOCUS_VISIBLE_CLASS}`}>
                  {lang === 'en' ? 'STORY' : 'قصتنا'}
                </button>
                <button onClick={() => { onNavigate('vlog'); onClose(); }} className={`block rounded-sm text-[15px] font-bold uppercase tracking-tight text-[#444] hover:text-black transition-colors ${FOCUS_VISIBLE_CLASS}`}>
                  {lang === 'en' ? 'VLOG' : 'فلوج'}
                </button>
                <button onClick={() => { onNavigate('account'); onClose(); }} className={`block rounded-sm text-[15px] font-bold uppercase tracking-tight text-[#444] hover:text-black transition-colors ${FOCUS_VISIBLE_CLASS}`}>
                  {lang === 'en' ? 'ACCOUNT' : 'حسابي'}
                </button>
            </div>

            {/* Social Icons - Only render if backend links exist */}
            {rawSocialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 bg-white rounded-full shadow-sm text-[#5C5A56] hover:text-black transition-colors ${FOCUS_VISIBLE_CLASS}`}
                    aria-label={social.name}
                  >
                    <social.Icon size={18} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            )}

            <p className="text-[9px] text-[#706E6A] font-bold tracking-widest uppercase">
              © ICARE 2026
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
