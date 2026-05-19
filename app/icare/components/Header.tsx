import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { Menu, Search, ShoppingBag, Globe, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { translations, Language } from '../translations';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { BackendCategory, Product } from '../types';
import { fetchCatalogProducts, fetchCategoryRoots, fetchCategoryChildren } from '../lib/catalog-client';

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
const SHOP_MEGA_MENU_ID = 'icare-shop-mega-menu';

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenSearch, onNavigate, onProductSelect, onOpenMenu, isDrawerOpen, lang, onToggleLang }) => {
  const t = translations[lang];
  const { cartCount, wishlistItems } = useShop();
  const { announcementText, shopEmptyAll } = useSiteContent();
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState(t.categories.all);
  const [isVisible, setIsVisible] = useState(true);
  const [isPinkTheme, setIsPinkTheme] = useState(false);
  const [previewProducts, setPreviewProducts] = useState<Product[]>([]);
  const [rootCategories, setRootCategories] = useState<BackendCategory[]>([]);
  const [categoryChildren, setCategoryChildren] = useState<Record<string, BackendCategory[]>>({});
  const [activeRootSlug, setActiveRootSlug] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shopButtonRef = useRef<HTMLButtonElement | null>(null);
  const shopMenuRef = useRef<HTMLDivElement | null>(null);
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
      ref={headerRef}
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: headerY, opacity: headerOpacity }}
      transition={calmTween}
      onMouseLeave={hideShop}
      onBlur={handleHeaderBlur}
      onKeyDown={handleHeaderKeyDown}
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
              onMouseEnter={closeShopMenu}
              className={`p-2 hover:bg-black/5 rounded-full transition-colors lg:hidden ${FOCUS_VISIBLE_CLASS}`}
              aria-label="Open menu"
            >
              <Menu size={20} className={isPinkTheme ? 'text-[#E11D48]' : 'text-[#706E6A]'} />
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
                className={`rounded-full px-1 text-[13px] font-[800] uppercase tracking-normal transition-colors ${FOCUS_VISIBLE_CLASS} ${
                  isPinkTheme ? 'text-[#E11D48] hover:text-black' : MUTED_TEXT_CLASS
                }`}
                aria-haspopup="true"
                aria-expanded={isShopHovered}
                aria-controls={SHOP_MEGA_MENU_ID}
              >
                {t.shop}
              </button>
              <button 
                onClick={() => onNavigate('story')}
                onMouseEnter={closeShopMenu}
                className={`rounded-full px-1 text-[13px] font-[800] uppercase tracking-normal transition-colors ${FOCUS_VISIBLE_CLASS} ${
                  isPinkTheme ? 'text-[#E11D48] hover:text-black' : MUTED_TEXT_CLASS
                }`}
              >
                {t.story}
              </button>
              <button 
                onClick={onToggleLang}
                onMouseEnter={closeShopMenu}
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
                onMouseEnter={closeShopMenu}
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
              onMouseEnter={closeShopMenu}
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
              onMouseEnter={closeShopMenu}
              className={`rounded-full px-1 text-[13px] font-[800] uppercase tracking-normal transition-colors hidden md:block ${FOCUS_VISIBLE_CLASS} ${
                isPinkTheme ? 'text-[#E11D48] hover:text-black' : MUTED_TEXT_CLASS
              }`}
            >
              {t.account}
            </button>
            <button 
              onClick={onOpenCart}
              onMouseEnter={closeShopMenu}
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
              id={SHOP_MEGA_MENU_ID}
              ref={shopMenuRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={calmTween}
              className="absolute top-[calc(100%-8px)] left-0 z-[55] w-full bg-[#FAF9F6]/90 backdrop-blur-3xl rounded-[16px] pt-5 pb-6 shadow-xl overflow-hidden border border-white/40"
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
                        activePreviewCategory.trim().toLowerCase() === t.categories.all.trim().toLowerCase() ? 'text-black' : 'text-[#5C5A56]'
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
                          activePreviewCategory.trim().toLowerCase() === cat.name.trim().toLowerCase() ? 'text-black' : 'text-[#5C5A56]'
                        }`}
                      >
                        {cat.name}
                        {activePreviewCategory.trim().toLowerCase() === cat.name.trim().toLowerCase() && (
                          <motion.div layoutId="activeCategoryUnderline" transition={calmTween} className="absolute -bottom-2 left-0 w-full h-[1px] bg-black" />
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
                            activePreviewCategory.trim().toLowerCase() === cat.trim().toLowerCase() ? 'text-black' : 'text-[#5C5A56]'
                          }`}
                        >
                          {cat}
                          {activePreviewCategory.trim().toLowerCase() === cat.trim().toLowerCase() && (
                            <motion.div layoutId="activeCategoryUnderline" transition={calmTween} className="absolute -bottom-2 left-0 w-full h-[1px] bg-black" />
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
                        className={`rounded-full px-4 py-1.5 text-[12px] font-bold tracking-wide transition-colors duration-200 ${FOCUS_VISIBLE_CLASS} text-[#5C5A56] hover:text-black hover:bg-black/5`}
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
                      className={`bg-white/60 backdrop-blur-md rounded-[12px] p-4 flex flex-col group cursor-pointer hover:bg-white/85 transition-colors duration-200 text-left ${FOCUS_VISIBLE_CLASS}`}
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
                        <h4 className="text-[14px] font-bold uppercase tracking-tight text-black mb-1 italic">
                          {product.title ?? product.name}
                        </h4>
                        <p className="text-[14px] text-[#5C5A56] font-medium leading-tight mb-2">
                          {product.description ?? <>{product.originalPrice && <span className="line-through mr-1">{product.originalPrice}</span>}{product.price}</>}
                        </p>
                        <span className="text-[11px] font-black uppercase tracking-widest border-b border-black pb-0.5 self-start group-hover:opacity-70 transition-opacity">
                          {t.shopNow}
                        </span>
                      </div>
                      </motion.button>
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
