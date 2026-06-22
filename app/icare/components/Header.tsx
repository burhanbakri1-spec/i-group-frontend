import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Menu, Search, ShoppingBag, Globe } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { translations, Language } from '../translations';
import { useShop } from '../context/ShopContext';
import { usePathname } from 'next/navigation';
import { BackendCategory, Product } from '../types';
import { fetchCatalogProducts, fetchCategoryRoots } from '../lib/catalog-client';
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
const HEADER_HIDE_SCROLL_THRESHOLD = 220;
const HEADER_SHOW_SCROLL_THRESHOLD = 32;
const HEADER_SCROLL_DELTA = 4;
const HEADER_HIDE_DELAY_MS = 200;
const HEADER_MOTION_EASE = [0.76, 0, 0.24, 1] as const;
const PREVIEW_LIMIT = 8;
const PREVIEW_SLIDE_DISTANCE = 60;

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenSearch, onNavigate, onProductSelect, onOpenMenu, isDrawerOpen, lang, onToggleLang }) => {
  const t = translations[lang];
  const { cartCount } = useShop();
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [previewDirection, setPreviewDirection] = useState<'left' | 'right'>('right');
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [hasScrolledPastHero, setHasScrolledPastHero] = useState(false);
  const [previewProducts, setPreviewProducts] = useState<Product[]>([]);
  const [rootCategories, setRootCategories] = useState<BackendCategory[]>([]);
  const shouldReduceMotion = useReducedMotion();
  const pathname = usePathname();
  const headerRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shopButtonRef = useRef<HTMLButtonElement | null>(null);
  const shopMenuRef = useRef<HTMLDivElement | null>(null);
  const lastScrollYRef = useRef(0);
  const scrollIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isShopHoveredRef = useRef(false);
  useEffect(() => { isShopHoveredRef.current = isShopHovered; }, [isShopHovered]);
  const calmTween = shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' as const };
  const headerMotion = shouldReduceMotion ? { duration: 0 } : { duration: 0.42, ease: HEADER_MOTION_EASE };
  const previewVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? PREVIEW_SLIDE_DISTANCE : -PREVIEW_SLIDE_DISTANCE,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? -PREVIEW_SLIDE_DISTANCE : PREVIEW_SLIDE_DISTANCE,
      opacity: 0,
    }),
  } as const;

  const cancelHideTimer = () => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const cancelHeaderHideTimer = () => {
    if (headerHideTimerRef.current !== null) {
      clearTimeout(headerHideTimerRef.current);
      headerHideTimerRef.current = null;
    }
  };

  const scheduleHeaderHide = () => {
    if (headerHideTimerRef.current !== null) return;
    headerHideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      headerHideTimerRef.current = null;
    }, HEADER_HIDE_DELAY_MS);
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

  useEffect(() => () => {
    cancelHideTimer();
    cancelHeaderHideTimer();
  }, []);

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

  const clampedActivePreviewIndex = megaMenuCategories.length > 0
    ? Math.min(activePreviewIndex, megaMenuCategories.length - 1)
    : 0;

  const visiblePreviewProducts = useMemo(() => {
    if (previewProducts.length === 0) return [];

    // "All" pill → show top N previews (no filter).
    if (clampedActivePreviewIndex === 0) {
      return previewProducts.slice(0, PREVIEW_LIMIT);
    }

    const activeName = megaMenuCategories[clampedActivePreviewIndex]?.trim().toLowerCase();
    if (!activeName) {
      return previewProducts.slice(0, PREVIEW_LIMIT);
    }

    // If we can find the matching root category, prefer matching by categoryId.
    // Otherwise (fallback path with derived names), fall back to a string match
    // on the product's `category` field — same approach the Shop filter uses.
    const activeRoot = rootCategories.find(
      (c) => c.name.trim().toLowerCase() === activeName
    );

    return previewProducts
      .filter((p) => {
        if (p.categoryId !== undefined && activeRoot) {
          return p.categoryId === activeRoot.id;
        }
        const cat = p.category?.trim().toLowerCase() ?? '';
        if (!cat) return false;
        return cat === activeName;
      })
      .slice(0, PREVIEW_LIMIT);
  }, [previewProducts, clampedActivePreviewIndex, megaMenuCategories, rootCategories]);

  const setPreviewByIndex = (nextIndex: number) => {
    if (nextIndex === clampedActivePreviewIndex) return;
    // Cards sweep in the direction the user moves their mouse:
    //   old on left, new on right (nextIndex > current) → sweep right (mouse moved right)
    //   old on right, new on left (nextIndex < current) → sweep left (mouse moved left)
    setPreviewDirection(nextIndex > clampedActivePreviewIndex ? 'right' : 'left');
    setActivePreviewIndex(nextIndex);
  };

  useEffect(() => {
    const updateHeaderState = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;
      const isStandardHeroRoute = hasIcareStandardHero(pathname);

      setIsScrolled(currentScrollY > 40 || !isStandardHeroRoute);

      if (isStandardHeroRoute && currentScrollY > 40) {
        setHasScrolledPastHero(true);
      }

      // While the shop mega menu is open, freeze the header in place.
      if (isShopHoveredRef.current) {
        cancelHeaderHideTimer();
        setIsVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      // Two-zone scroll model: always show near the top, always hide after
      // sustained scroll-down past a generous threshold, no-op in between.
      // Eliminates the hide/show flicker on small scroll deltas.
      if (currentScrollY <= HEADER_SHOW_SCROLL_THRESHOLD) {
        cancelHeaderHideTimer();
        setIsVisible(true);
        setIsScrollingUp(false);
        if (scrollIdleTimerRef.current !== null) {
          clearTimeout(scrollIdleTimerRef.current);
          scrollIdleTimerRef.current = null;
        }
      } else if (currentScrollY > HEADER_HIDE_SCROLL_THRESHOLD && delta > HEADER_SCROLL_DELTA) {
        setIsScrollingUp(false);
        scheduleHeaderHide();
      } else if (delta < -HEADER_SCROLL_DELTA) {
        cancelHeaderHideTimer();
        setIsVisible(true);
        setIsScrollingUp(true);
      }

      if (scrollIdleTimerRef.current !== null) {
        clearTimeout(scrollIdleTimerRef.current);
      }
      scrollIdleTimerRef.current = setTimeout(() => {
        setIsScrollingUp(false);
        scrollIdleTimerRef.current = null;
      }, 600);

      lastScrollYRef.current = currentScrollY;
    };

    lastScrollYRef.current = window.scrollY;
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
    window.addEventListener('resize', updateHeaderState);

    return () => {
      cancelHeaderHideTimer();
      window.removeEventListener('scroll', updateHeaderState);
      window.removeEventListener('resize', updateHeaderState);
    };
  }, [pathname]);

  const isStandardHero = hasIcareStandardHero(pathname);
  // Subset of standard hero routes whose hero image is dark enough that the
  // transparent pill + white logo are visible on top of it. The broader
  // isStandardHero set still drives the scroll/condensed behaviour for every
  // standard hero route, but only confirmed dark-hero routes flip the
  // header pill transparent, the nav text white, and the logo to its
  // inverted (white) tone. Lighter hero routes keep the warm-gray pill and
  // the logo in its native dark tone so it remains visible.
  const DARK_HERO_PATHS = new Set(['/icare', '/icare/shop']);
  const isDarkHeroRoute = (() => {
    if (!pathname) return false;
    const normalized = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
    return DARK_HERO_PATHS.has(normalized);
  })();
  const isConnected =
    isStandardHero
    && isDarkHeroRoute
    && !isScrolled
    && !isShopHovered
    && !hasScrolledPastHero;
  // Condensed mode: header sits above the hero with a solid white pill and a tighter top gap.
  // Activates as soon as the user has scrolled past the hero height (or on non-standard routes).
  const isCondensed = !isConnected && isScrolled;
  const radiusClass = isShopHovered
    ? 'rounded-[var(--rb-radius-card)]'
    : 'rounded-t-[var(--rb-radius-card)] rounded-b-none';
  const wrapperBg = isConnected
    ? 'bg-transparent'
    : 'bg-[var(--rb-bg-warm-gray)] shadow-[0_1rem_2rem_rgba(103,100,94,0.06)]';
  const navTextClass = isConnected ? 'text-white hover:text-white/75' : MUTED_TEXT_CLASS;
  const logoToneClass = isConnected ? 'brightness-0 invert' : '';

  // When condensed, lift the header up so the white plate shows as a gap above it.
  // Left/right positions stay tied to --icare-header-inset (no horizontal shift).
  const condensedLift = -32;

  return (
    <>
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          y: !isVisible || isDrawerOpen
            ? '-200%'
            : 0,
        }}
        transition={headerMotion}
        className="fixed left-0 right-0 top-0 bg-white pointer-events-none rounded-b-[var(--rb-radius-card)]"
        style={{
          height: `calc(var(--icare-header-top) - ${Math.abs(condensedLift)}px + 2rem)`,
          opacity: isCondensed ? 1 : 0,
          transition: shouldReduceMotion ? 'none' : 'opacity 0.2s linear',
          zIndex: 55,
        }}
      />
      <motion.div
        ref={headerRef}
        initial={shouldReduceMotion ? { y: 0 } : { y: -6 }}
        animate={{
          y: !isVisible || isDrawerOpen
            ? '-200%'
            : (isCondensed ? condensedLift : 0),
        }}
        transition={headerMotion}
        onMouseLeave={hideShop}
        onBlur={handleHeaderBlur}
        onKeyDown={handleHeaderKeyDown}
        data-icare-header
        className={`icare-header-shell ${isDrawerOpen ? 'pointer-events-none' : ''}`}
      >
      <div>
        <div
          className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] border ${isConnected ? 'border-transparent' : 'border-[var(--rb-border-light)]'} ${radiusClass} ${wrapperBg}`}
        >
          <header
            className="flex min-h-[64px] items-center justify-between px-4 py-4 md:px-8 md:py-5"
          >
          {/* Navigation */}
          <div className="flex items-center gap-10">
            <button 
              onClick={onOpenMenu}
              onMouseEnter={closeShopMenu}
              className={`p-2 rounded-full transition-colors lg:hidden ${FOCUS_VISIBLE_CLASS} ${isConnected ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
               aria-label={t.openMenu}
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
                /* Match system header nav links: 12.8px / 700 / 19.2px / 0.256px ls / uppercase. */
                className={`rounded-full px-1 text-[clamp(0.875rem,0.6vw+0.75rem,1rem)] font-bold uppercase leading-[1.5] tracking-[0.02em] transition-colors ${FOCUS_VISIBLE_CLASS} ${navTextClass}`}
                aria-haspopup="true"
                aria-expanded={isShopHovered}
                aria-controls={SHOP_MEGA_MENU_ID}
              >
                {t.shop}
              </button>
              <button
                onClick={() => onNavigate('story')}
                onMouseEnter={closeShopMenu}
                className={`rounded-full px-1 text-[clamp(0.875rem,0.6vw+0.75rem,1rem)] font-bold uppercase leading-[1.5] tracking-[0.02em] transition-colors ${FOCUS_VISIBLE_CLASS} ${navTextClass}`}
              >
                {t.story}
              </button>
              <button
                onClick={onToggleLang}
                onMouseEnter={closeShopMenu}
                className={`text-[clamp(0.875rem,0.6vw+0.75rem,1rem)] font-bold flex items-center gap-2 border px-3 py-1.5 rounded-full transition-colors ${FOCUS_VISIBLE_CLASS} ${isConnected ? 'border-white/35 text-white hover:bg-white/10' : 'border-[var(--rb-border-light)] text-[var(--rb-primary-text)] hover:bg-black/5'}`}
              >
                <Globe size={14} />
                 {lang === 'en' ? t.langToggleAr : t.langToggleEn}
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
              aria-label={t.goToHome}
          >
            <img
              src="/icare-logo.png"
                alt={t.aboutAltBrand}
              className={`h-full w-auto object-contain transition-all duration-300 ${logoToneClass}`}
            />
          </motion.button>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-6">
            <button
                onClick={onOpenSearch}
                onMouseEnter={closeShopMenu}
                className={`rounded-full px-1 text-[clamp(0.875rem,0.6vw+0.75rem,1rem)] font-bold uppercase leading-[1.5] tracking-[0.02em] transition-colors ${FOCUS_VISIBLE_CLASS} ${navTextClass}`}
                aria-label={t.search}
            >
              <span className="hidden md:inline">{t.search}</span>
              <Search size={20} className="md:hidden" />
            </button>
            <button
              onClick={() => onNavigate('account')}
              onMouseEnter={closeShopMenu}
              className={`rounded-full px-1 text-[clamp(0.875rem,0.6vw+0.75rem,1rem)] font-bold uppercase leading-[1.5] tracking-[0.02em] transition-colors hidden md:block ${FOCUS_VISIBLE_CLASS} ${navTextClass}`}
            >
              {t.account}
            </button>
            <button
              onClick={onOpenCart}
              onMouseEnter={closeShopMenu}
              className={`rounded-full px-1 text-[clamp(0.875rem,0.6vw+0.75rem,1rem)] font-bold uppercase leading-[1.5] tracking-[0.02em] transition-colors relative ${FOCUS_VISIBLE_CLASS} ${navTextClass}`}
              aria-label={t.cart}
            >
              <span className="hidden md:inline">{t.cart} ({cartCount})</span>
              <div className="md:hidden flex items-center gap-1 relative">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className={`absolute -top-2 ${lang === 'ar' ? '-left-2' : '-right-2'} w-5 h-5 text-[10px] font-black rounded-full flex items-center justify-center ${isConnected ? 'bg-white text-[var(--rb-primary-text)]' : 'bg-black text-white'}`}>
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
                  <div className="flex justify-center gap-6 mb-4 px-6">
                    {/* "All" button */}
                      <button
                      key={t.categories.all}
                      onMouseEnter={() => setPreviewByIndex(0)}
                      onFocus={() => setPreviewByIndex(0)}
                      onClick={() => { onNavigate('shop'); closeShopMenu(); }}
                      className={`rounded-full px-1 text-[12.8px] font-bold uppercase tracking-[0.02em] leading-[1.5] relative transition-colors duration-200 ${FOCUS_VISIBLE_CLASS} ${
                        clampedActivePreviewIndex === 0 ? 'text-[var(--rb-near-black)]' : 'text-[var(--rb-primary-text)]'
                      }`}
                    >
                      {t.categories.all}
                      {clampedActivePreviewIndex === 0 && (
                        <motion.div layoutId="activeCategoryUnderline" transition={calmTween} className="absolute -bottom-2 start-0 w-full h-[1px] bg-black" />
                      )}
                    </button>
                    {/* Root category buttons */}
                    {rootCategories.length > 0 ? rootCategories.map((cat, index) => (
                      <button
                        key={cat.slug}
                        onMouseEnter={() => setPreviewByIndex(index + 1)}
                        onFocus={() => setPreviewByIndex(index + 1)}
                        onClick={() => { onNavigate('shop'); closeShopMenu(); }}
                        /* Match system 12.8px / 700 / 0.256px rhythm for secondary nav pills. */
                        className={`rounded-full px-1 text-[12.8px] font-bold uppercase tracking-[0.02em] leading-[1.5] relative transition-colors duration-200 ${FOCUS_VISIBLE_CLASS} ${
                          clampedActivePreviewIndex === index + 1 ? 'text-[var(--rb-near-black)]' : 'text-[var(--rb-primary-text)]'
                        }`}
                      >
                        {cat.name}
                        {clampedActivePreviewIndex === index + 1 && (
                          <motion.div layoutId="activeCategoryUnderline" transition={calmTween} className="absolute -bottom-2 start-0 w-full h-[1px] bg-[var(--rb-near-black)]" />
                        )}
                      </button>
                    )) : (
                      /* Fallback when no root categories: use derived names */
                      megaMenuCategories.filter(c => c !== t.categories.all).map((cat, index) => (
                        <button
                          key={cat}
                          onMouseEnter={() => setPreviewByIndex(index + 1)}
                          onFocus={() => setPreviewByIndex(index + 1)}
                          onClick={() => { onNavigate('shop'); closeShopMenu(); }}
                          className={`rounded-full px-1 text-[12.8px] font-bold uppercase tracking-[0.02em] leading-[1.5] relative transition-colors duration-200 ${FOCUS_VISIBLE_CLASS} ${
                            clampedActivePreviewIndex === index + 1 ? 'text-[var(--rb-near-black)]' : 'text-[var(--rb-primary-text)]'
                          }`}
                        >
                          {cat}
                          {clampedActivePreviewIndex === index + 1 && (
                            <motion.div layoutId="activeCategoryUnderline" transition={calmTween} className="absolute -bottom-2 left-0 w-full h-[1px] bg-[var(--rb-near-black)]" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {visiblePreviewProducts.length > 0 ? (
                  <AnimatePresence mode="wait" initial={false} custom={previewDirection}>
                    <motion.div
                      key={clampedActivePreviewIndex}
                      custom={previewDirection}
                      variants={previewVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={calmTween}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6"
                    >
                      {visiblePreviewProducts.map((product) => (
                        <button
                          type="button"
                          key={product.id}
                          className={`bg-[var(--rb-bg-surface)] rounded-[var(--rb-radius-card)] p-4 flex flex-col group cursor-pointer hover:bg-[var(--rb-bg-light)] transition-colors duration-200 text-left ${FOCUS_VISIBLE_CLASS}`}
                          onClick={() => { onProductSelect?.(product); setIsShopHovered(false); }}
                          aria-label={`${t.shopNow} ${product.title ?? product.name}`}
                        >
                          <div className="relative aspect-square mb-3 flex items-center justify-center p-4">
                            <ImageWithFallback
                              src={product.primaryImage}
                              alt={product.title ?? product.name}
                              className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-200"
                            />
                          </div>
                          <div className="mt-auto">
                            <h4 className="text-[14px] font-bold uppercase tracking-[0.02em] text-[var(--rb-near-black)] mb-1">
                              {product.title ?? product.name}
                            </h4>
                            <p className="text-[14px] text-[var(--rb-primary-text)] font-normal tracking-[0.02em] leading-[1.5] mb-2">
                              {product.description ?? <>{product.originalPrice && <span className="line-through mr-1">{product.originalPrice}</span>}{product.price}</>}
                            </p>
                            <span className="text-[12.8px] font-normal uppercase tracking-[0.02em] border-b border-[var(--rb-near-black)] pb-0.5 self-start group-hover:opacity-70 transition-opacity">
                              {t.shopNow}
                            </span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="px-10 py-16 text-center text-[13px] font-bold uppercase tracking-[0.2em] text-[var(--rb-primary-text)]">
                     {t.productPreviewsUnavailable}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </motion.div>
    </>
  );
};
