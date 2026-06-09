import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, ShoppingBag, Globe } from 'lucide-react';
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
const FOCUS_VISIBLE_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#67645E]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rb-bg-warm-gray)]';

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onNavigate, onProductSelect, onOpenCart, onOpenSearch, lang, onToggleLang }) => {
  // onOpenSearch is passed from parent but not currently used in this component
  void onOpenSearch;
  const [activeCategory, setActiveCategory] = useState(SHOP_ALL_CATEGORY);
  const [remoteProducts, setRemoteProducts] = useState<Product[]>([]);
  const { cartCount } = useShop();
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
          className="fixed inset-0 z-[80] bg-[var(--rb-bg-warm-gray)] flex flex-col"
        >
          {/* Mobile Header Inside Menu */}
          <div className="px-6 py-4 flex items-center justify-between">
            <button onClick={onClose} className={`p-2 rounded-full hover:bg-black/5 transition-colors ${FOCUS_VISIBLE_CLASS}`} aria-label="Close menu">
              <X size={24} className="text-[var(--rb-primary-text)]" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 h-10">
              <img src="/icare-logo.png" alt="icare" className="h-full w-auto object-contain" />
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={onToggleLang}
                className={`p-2 flex items-center gap-1.5 border border-[var(--rb-border-light)] rounded-full bg-[var(--rb-bg-surface)] hover:bg-[var(--rb-bg-light)] transition-colors ${FOCUS_VISIBLE_CLASS}`}
              >
                <Globe size={16} className="text-[var(--rb-primary-text)]" />
                <span className="text-[12px] font-bold text-[var(--rb-primary-text)] uppercase">
                  {lang === 'en' ? 'AR' : 'EN'}
                </span>
              </button>
              <button onClick={() => { onOpenCart(); onClose(); }} className={`p-2 relative rounded-full hover:bg-black/5 transition-colors ${FOCUS_VISIBLE_CLASS}`} aria-label="Open cart">
                <ShoppingBag size={22} className="text-[var(--rb-primary-text)]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Horizontal Category Scroll */}
          <div className="px-6 border-b border-[var(--rb-border-light)] overflow-x-auto no-scrollbar">
            <div className="flex gap-8 min-w-max py-4">
              {mobileCategories.length > 0 ? mobileCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[13px] font-bold uppercase tracking-tight relative pb-2 rounded-sm transition-colors ${FOCUS_VISIBLE_CLASS} ${
                      activeMobileCategory === cat ? 'text-[var(--rb-near-black)]' : 'text-[var(--rb-primary-text)]'
                    }`}
                  >
                    {cat}
                    {activeMobileCategory === cat && (
                      <motion.div
                        layoutId="mobileActiveTab"
                        transition={calmTween}
                        className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[var(--rb-near-black)]"
                      />
                    )}
                  </button>
                )) : (
                  <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--rb-primary-text)] pb-2">
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
                    className={`w-full bg-[var(--rb-pure-white)] rounded-[var(--rb-radius-card)] p-4 flex items-center gap-5 relative group active:scale-[0.99] transition-transform duration-150 text-left ${FOCUS_VISIBLE_CLASS}`}
                    aria-label={`${lang === 'en' ? 'Open product' : 'فتح المنتج'} ${product.title ?? product.name}`}
                  >
                    <div className="w-20 h-20 bg-[var(--rb-bg-light)] rounded-[var(--rb-radius-card)] flex items-center justify-center p-2">
                      <ImageWithFallback 
                        src={product.primaryImage} 
                        alt={product.title ?? product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="flex-1">
                      {product.label && (
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--rb-primary-text)] mb-1">
                          {product.label}
                        </p>
                      )}
                      <div className="flex items-start justify-between">
                        <h4 className="text-[13px] font-bold uppercase tracking-tight text-[var(--rb-near-black)] leading-tight">
                          {product.title ?? product.name}
                        </h4>
                      </div>
                      <p className="text-[12px] text-[var(--rb-gray-84827E)] font-medium leading-tight mt-1">
                        {product.description ?? <>{product.originalPrice && <span className="line-through mr-1">{product.originalPrice}</span>}{product.price}</>}
                      </p>
                    </div>
                  </button>
                )) : (
                  <div className="bg-[var(--rb-bg-light)]/70 rounded-[var(--rb-radius-card)] p-6 text-center text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--rb-primary-text)]">
                    no products available
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Navigation Links - Compact */}
          <div className="p-6 py-4 border-t border-[var(--rb-border-light)] space-y-3 bg-[var(--rb-bg-surface)]/30">
            <div className="flex gap-6">
                <button onClick={() => { onNavigate('story'); onClose(); }} className={`block rounded-sm text-[15px] font-bold uppercase tracking-tight text-[var(--rb-near-black)] hover:text-[var(--rb-near-black)] transition-colors ${FOCUS_VISIBLE_CLASS}`}>
                  {lang === 'en' ? 'STORY' : 'قصتنا'}
                </button>
                <button onClick={() => { onNavigate('vlog'); onClose(); }} className={`block rounded-sm text-[15px] font-bold uppercase tracking-tight text-[var(--rb-near-black)] hover:text-[var(--rb-near-black)] transition-colors ${FOCUS_VISIBLE_CLASS}`}>
                  {lang === 'en' ? 'VLOG' : 'فلوج'}
                </button>
                <button onClick={() => { onNavigate('account'); onClose(); }} className={`block rounded-sm text-[15px] font-bold uppercase tracking-tight text-[var(--rb-near-black)] hover:text-[var(--rb-near-black)] transition-colors ${FOCUS_VISIBLE_CLASS}`}>
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
                    className={`p-2 bg-[var(--rb-pure-white)] rounded-full shadow-sm text-[var(--rb-primary-text)] hover:text-[var(--rb-near-black)] transition-colors ${FOCUS_VISIBLE_CLASS}`}
                    aria-label={social.name}
                  >
                    <social.Icon size={18} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            )}

            <p className="text-[9px] text-[var(--rb-gray-84827E)] font-bold tracking-widest uppercase">
              © ICARE 2026
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
