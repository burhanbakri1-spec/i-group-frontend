import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Menu, Search, ShoppingBag, Globe, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { translations, Language } from '../translations';
import { useShop } from '../context/ShopContext';
import { usePathname } from 'next/navigation';
import { BackendCategory, Product } from '../types';
import { fetchCatalogProducts, fetchCategoryRoots, fetchCategoryChildren } from '../lib/catalog-client';
import { hasIcareStandardHero } from '../lib/hero-routes';

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

const FOCUS_VISIBLE_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#67645E]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rb-bg-warm-gray)]';
const MUTED_TEXT_CLASS = 'text-[var(--rb-primary-text)] hover:text-[var(--rb-near-black)]';
const SHOP_MEGA_MENU_ID = 'icare-shop-mega-menu';
const HEADER_HIDE_SCROLL_THRESHOLD = 32;
const HEADER_SCROLL_DELTA = 4;

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenSearch, onNavigate, onProductSelect, onOpenMenu, isDrawerOpen, lang, onToggleLang }) => {
  const t = translations[lang];
  const { cartCount, wishlistItems } = useShop();
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState(t.categories.all);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [previewProducts, setPreviewProducts] = useState<Product[]>([]);
  const [rootCategories, setRootCategories] = useState<BackendCategory[]>([]);
  const [categoryChildren, setCategoryChildren] = useState<Record<string, BackendCategory[]>>({});
  const [activeRootSlug, setActiveRootSlug] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const pathname = usePathname();
  const headerRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shopButtonRef = useRef<HTMLButtonElement | null>(null);
  const shopMenuRef = useRef<HTMLDivElement | null>(null);
  const lastScrollYRef = useRef(0);
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
    hideTimerRef.current = setTimeout(() => setIsShopHovered(false), 80);
  };

  const closeShopMenu = () => {
    cancelHideTimer();
    setIsShopHovered(false);
  };

  const focusFirstShopMenuItem = () => {
    window.requestAnimationFrame(() => {
      const firstMenuButton = shopMenuRef.current?.querySelector<HTMLButtonElement>('button');
      firstMenuButton?.focus();
    });
  };

  const handleHeaderBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const nextFocusedElement = event.relatedTarget;
    if (nextFocusedElement instanceof Node && headerRef.current?.contains(nextFocusedElement)) return;
    closeShopMenu();
  };

  const handleShopKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      showShop();
      focusFirstShopMenuItem();
    }
  };

  const handleHeaderKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || !isShopHovered) return;
    event.preventDefault();
    closeShopMenu();
    shopButtonRef.current?.focus();
  };

  useEffect(() => () => { cancelHideTimer(); }, []);

  useEffect(() => {
    if (!isShopHovered) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (
        shopMenuRef.current &&
        !shopMenuRef.current.contains(e.target as Node) &&
        shopButtonRef.current &&
        !shopButtonRef.current.contains(e.target as Node)
      ) {
        cancelHideTimer();
        setIsShopHovered(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isShopHovered]);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      const [products, categories] = await Promise.all([
        fetchCatalogProducts(),
        fetchCategoryRoots(),
      ]);
      if (cancelled) return;
      if (products !== null) {
        setPreviewProducts(products.slice(0, 16));
      }
      setRootCategories(categories);
    };
    loadData();
    return () => { cancelled = true; };
  }, []);

  // Fetch children when a root category is hovered
  useEffect(() => {
    if (!activeRootSlug || categoryChildren[activeRootSlug]) return;
    let cancelled = false;
    fetchCategoryChildren(activeRootSlug).then(children => {
      if (cancelled) return;
      setCategoryChildren(prev => ({ ...prev, [activeRootSlug]: Array.isArray(children) ? children : [] }));
    });
    return () => { cancelled = true; };
  }, [activeRootSlug, categoryChildren]);

  const megaMenuCategories = useMemo(() => {
    if (rootCategories.length > 0) {
      return [t.categories.all, ...rootCategories.map((c) => c.name)];
    }
    if (previewProducts.length === 0) return [];
    const backendCategories = Array.from(new Set(previewProducts
      .map((product) => product.category?.trim())
      .filter((category): category is string => Boolean(category))));
    return [t.categories.all, ...backendCategories];
  }, [rootCategories, previewProducts, t.categories.all]);

  const activePreviewCategory = megaMenuCategories.some((category) => category.trim().toLowerCase() === activeCategory.trim().toLowerCase())
    ? activeCategory
    : t.categories.all;

  const visiblePreviewProducts = useMemo(() => {
    if (activePreviewCategory === t.categories.all) return previewProducts;
    return previewProducts.filter((product) => product.category?.trim().toLowerCase() === activePreviewCategory.trim().toLowerCase());
  }, [activePreviewCategory, previewProducts, t.categories.all]);

  useEffect(() => {
    const updateHeaderState = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;
      const isStandardHeroRoute = hasIcareStandardHero(pathname);

      setIsMounted(true);
      setIsScrolled(currentScrollY > 40 || !isStandardHeroRoute);

      if (currentScrollY <= HEADER_HIDE_SCROLL_THRESHOLD) {
        setIsVisible(true);
      } else if (delta > HEADER_SCROLL_DELTA) {
        setIsVisible(false);
      } else if (delta < -HEADER_SCROLL_DELTA) {
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    lastScrollYRef.current = window.scrollY;
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
    window.addEventListener('resize', updateHeaderState);

    return () => {
      window.removeEventListener('scroll', updateHeaderState);
      window.removeEventListener('resize', updateHeaderState);
    };
  }, [pathname]);

  const headerY = !isVisible || isDrawerOpen ? 'calc(-100% - 2rem)' : 0;
  const headerOpacity = !isVisible || isDrawerOpen ? 0 : 1;
  const isStandardHero = hasIcareStandardHero(pathname);
  const isConnected = isStandardHero && !isScrolled && !isShopHovered;
  const radiusClass = isShopHovered ? 'rounded-t-[var(--rb-radius-card)] rounded-b-[0px] border-b-0' : 'rounded-[var(--rb-radius-card)]';
  const wrapperBg = isShopHovered || isScrolled || !isStandardHero
    ? 'bg-[var(--rb-bg-warm-gray)] shadow-[0_1rem_2rem_rgba(103,100,94,0.06)]'
    : 'bg-transparent';
  const navTextClass = isConnected ? 'text-white hover:text-white/75' : MUTED_TEXT_CLASS;
  const logoToneClass = isConnected ? 'brightness-0 invert' : '';

  return (
    <motion.div 
      ref={headerRef}
      initial={shouldReduceMotion ? { y: 0, opacity: 1 } : { y: -6, opacity: 0 }}
      animate={{ y: headerY, opacity: isMounted ? headerOpacity : 0 }}
      transition={calmTween}
      onMouseLeave={hideShop}
      onBlur={handleHeaderBlur}
      onKeyDown={handleHeaderKeyDown}
      data-icare-header
      className={`icare-header-shell ${isDrawerOpen ? 'pointer-events-none' : ''}`}
    >
      <div>
        <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] border ${isConnected ? 'border-transparent' : 'border-[var(--rb-border-light)]'} ${radiusClass} ${wrapperBg}`}>
          <header 
            className="flex min-h-[64px] items-center justify-between px-4 py-4 md:px-8 md:py-5"
          >
          {/* Navigation */}
          <div className="flex items-center gap-10">
            <button 
              onClick={onOpenMenu}
              onMouseEnter={closeShopMenu}
              className={`p-2 rounded-full transition-colors lg:hidden ${FOCUS_VISIBLE_CLASS} ${isConnected ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
              aria-label="Open menu"
            >
              <Menu size={20} className={isConnected ? 'text-white' : 'text-[var(--rb-primary-text)]'} />
            </button>
            <nav className="hidden lg:flex items-center gap-7">
              <button 
                ref={shopButtonRef}
                onMouseEnter={showShop}
                onFocus={showShop}
                onKeyDown={handleShopKeyDown}
                onClick={() => {
                  if (isShopHovered) {
                    closeShopMenu();
                    shopButtonRef.current?.focus();
                  } else {
                    onNavigate('shop');
                  }
                }}
                className={`rounded-full px-1 text-[13px] font-[800] uppercase tracking-normal transition-colors ${FOCUS_VISIBLE_CLASS} ${navTextClass}`}
                aria-haspopup="true"
                aria-expanded={isShopHovered}
                aria-controls={SHOP_MEGA_MENU_ID}
              >
                {t.shop}
              </button>
              <button 
                onClick={() => onNavigate('story')}
                onMouseEnter={closeShopMenu}
                className={`rounded-full px-1 text-[13px] font-[800] uppercase tracking-normal transition-colors ${FOCUS_VISIBLE_CLASS} ${navTextClass}`}
              >
                {t.story}
              </button>
              <button 
                onClick={onToggleLang}
                onMouseEnter={closeShopMenu}
                className={`text-[12px] font-bold flex items-center gap-2 border px-3 py-1.5 rounded-full transition-colors ${FOCUS_VISIBLE_CLASS} ${isConnected ? 'border-white/35 text-white hover:bg-white/10' : 'border-[var(--rb-border-light)] text-[var(--rb-primary-text)] hover:bg-black/5'}`}
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
              className={`h-full w-auto object-contain transition-all duration-300 ${logoToneClass}`}
            />
          </motion.button>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-6">
            <button 
                onClick={onOpenSearch}
                onMouseEnter={closeShopMenu}
                className={`rounded-full px-1 text-[13px] font-[800] uppercase tracking-normal transition-colors ${FOCUS_VISIBLE_CLASS} ${navTextClass}`}
                aria-label={t.search}
            >
              <span className="hidden md:inline">{t.search}</span>
              <Search size={20} className="md:hidden" />
            </button>
            <button 
              onClick={() => onNavigate('wishlist')}
              onMouseEnter={closeShopMenu}
              className={`rounded-full px-1 text-[13px] font-[800] uppercase tracking-normal transition-colors relative ${FOCUS_VISIBLE_CLASS} ${navTextClass}`}
              aria-label={t.wishlist}
            >
              <span className="hidden md:inline">{t.wishlist}</span>
              <div className="md:hidden relative">
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className={`absolute -top-2 -right-2 w-5 h-5 text-[10px] font-black rounded-full flex items-center justify-center ${isConnected ? 'bg-white text-[var(--rb-primary-text)]' : 'bg-[var(--rb-primary-text)] text-white'}`}>
                    {wishlistItems.length}
                  </span>
                )}
              </div>
            </button>
            <button 
              onClick={() => onNavigate('account')}
              onMouseEnter={closeShopMenu}
              className={`rounded-full px-1 text-[13px] font-[800] uppercase tracking-normal transition-colors hidden md:block ${FOCUS_VISIBLE_CLASS} ${navTextClass}`}
            >
              {t.account}
            </button>
            <button 
              onClick={onOpenCart}
              onMouseEnter={closeShopMenu}
              className={`rounded-full px-1 text-[13px] font-[800] uppercase tracking-normal transition-colors relative ${FOCUS_VISIBLE_CLASS} ${navTextClass}`}
              aria-label={t.cart}
            >
              <span className="hidden md:inline">{t.cart} ({cartCount})</span>
              <div className="md:hidden flex items-center gap-1 relative">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className={`absolute -top-2 -right-2 w-5 h-5 text-[10px] font-black rounded-full flex items-center justify-center ${isConnected ? 'bg-white text-[var(--rb-primary-text)]' : 'bg-black text-white'}`}>
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
              id={SHOP_MEGA_MENU_ID}
              ref={shopMenuRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden px-4 md:px-6 pb-4"
              onMouseEnter={showShop}
            >
              <div className="max-w-[1440px] mx-auto px-10">
                {megaMenuCategories.length > 0 && (
                  <div className="flex justify-end gap-6 mb-4 px-6">
                    {/* "All" button */}
                      <button
                      key={t.categories.all}
                      onMouseEnter={() => { setActiveCategory(t.categories.all); setActiveRootSlug(null); }}
                      onFocus={() => { setActiveCategory(t.categories.all); setActiveRootSlug(null); }}
                      onClick={() => { onNavigate('shop'); closeShopMenu(); }}
                      className={`rounded-full px-1 text-[14px] font-bold uppercase tracking-tight relative transition-colors duration-200 ${FOCUS_VISIBLE_CLASS} ${
                        activePreviewCategory.trim().toLowerCase() === t.categories.all.trim().toLowerCase() ? 'text-[var(--rb-near-black)]' : 'text-[var(--rb-primary-text)]'
                      }`}
                    >
                      {t.categories.all}
                      {activePreviewCategory.trim().toLowerCase() === t.categories.all.trim().toLowerCase() && (
                        <motion.div layoutId="activeCategoryUnderline" transition={calmTween} className="absolute -bottom-2 left-0 w-full h-[1px] bg-black" />
                      )}
                    </button>
                    {/* Root category buttons */}
                    {rootCategories.length > 0 ? rootCategories.map((cat) => (
                      <button
                        key={cat.slug}
                        onMouseEnter={() => { setActiveCategory(cat.name); setActiveRootSlug(cat.slug); }}
                        onFocus={() => { setActiveCategory(cat.name); setActiveRootSlug(cat.slug); }}
                        onClick={() => { onNavigate('shop'); closeShopMenu(); }}
                        className={`rounded-full px-1 text-[14px] font-bold uppercase tracking-tight relative transition-colors duration-200 ${FOCUS_VISIBLE_CLASS} ${
                          activePreviewCategory.trim().toLowerCase() === cat.name.trim().toLowerCase() ? 'text-[var(--rb-near-black)]' : 'text-[var(--rb-primary-text)]'
                        }`}
                      >
                        {cat.name}
                        {activePreviewCategory.trim().toLowerCase() === cat.name.trim().toLowerCase() && (
                          <motion.div layoutId="activeCategoryUnderline" transition={calmTween} className="absolute -bottom-2 left-0 w-full h-[1px] bg-[var(--rb-near-black)]" />
                        )}
                      </button>
                    )) : (
                      /* Fallback when no root categories: use derived names */
                      megaMenuCategories.filter(c => c !== t.categories.all).map((cat) => (
                        <button
                          key={cat}
                          onMouseEnter={() => setActiveCategory(cat)}
                          onFocus={() => setActiveCategory(cat)}
                          onClick={() => { onNavigate('shop'); closeShopMenu(); }}
                          className={`rounded-full px-1 text-[14px] font-bold uppercase tracking-tight relative transition-colors duration-200 ${FOCUS_VISIBLE_CLASS} ${
                            activePreviewCategory.trim().toLowerCase() === cat.trim().toLowerCase() ? 'text-[var(--rb-near-black)]' : 'text-[var(--rb-primary-text)]'
                          }`}
                        >
                          {cat}
                          {activePreviewCategory.trim().toLowerCase() === cat.trim().toLowerCase() && (
                            <motion.div layoutId="activeCategoryUnderline" transition={calmTween} className="absolute -bottom-2 left-0 w-full h-[1px] bg-[var(--rb-near-black)]" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Children subcategories row */}
                {activeRootSlug && categoryChildren[activeRootSlug]?.length > 0 && (
                  <div className="flex justify-center gap-4 mb-4 px-6">
                    {categoryChildren[activeRootSlug].map((child) => (
                      <button
                        key={child.slug}
                        onClick={() => { onNavigate('shop'); closeShopMenu(); }}
                        className={`rounded-full px-4 py-1.5 text-[12px] font-bold tracking-wide transition-colors duration-200 ${FOCUS_VISIBLE_CLASS} text-[var(--rb-primary-text)] hover:text-[var(--rb-near-black)] hover:bg-[var(--rb-bg-surface)]`}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                )}

                {visiblePreviewProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
                    {visiblePreviewProducts.map((product) => (
                    <motion.button
                      type="button"
                      key={product.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={calmTween}
                      className={`bg-[var(--rb-bg-surface)] rounded-[var(--rb-radius-card)] p-4 flex flex-col group cursor-pointer hover:bg-[var(--rb-bg-light)] transition-colors duration-200 text-left ${FOCUS_VISIBLE_CLASS}`}
                      onClick={() => { onProductSelect?.(product); setIsShopHovered(false); }}
                      aria-label={`${t.shopNow} ${product.title ?? product.name}`}
                    >
                      <div className="relative aspect-square mb-3 flex items-center justify-center p-4">
                        <ImageWithFallback 
                          src={product.image} 
                          alt={product.title ?? product.name}
                          className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-200"
                        />
                      </div>
                      <div className="mt-auto">
                        <h4 className="text-[14px] font-bold uppercase tracking-tight text-[var(--rb-near-black)] mb-1">
                          {product.title ?? product.name}
                        </h4>
                        <p className="text-[14px] text-[var(--rb-primary-text)] font-medium leading-tight mb-2">
                          {product.description ?? <>{product.originalPrice && <span className="line-through mr-1">{product.originalPrice}</span>}{product.price}</>}
                        </p>
                        <span className="text-[11px] font-black uppercase tracking-widest border-b border-[var(--rb-near-black)] pb-0.5 self-start group-hover:opacity-70 transition-opacity">
                          {t.shopNow}
                        </span>
                      </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="px-10 py-16 text-center text-[13px] font-bold uppercase tracking-[0.2em] text-[var(--rb-primary-text)]">
                    product previews unavailable
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </motion.div>
  );
};
