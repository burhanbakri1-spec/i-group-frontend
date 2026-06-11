import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from './ProductCard';
import { ChevronDown, Grid2X2, LayoutGrid } from 'lucide-react';
import { fetchCatalogProducts, fetchCategoryRoots } from '../lib/catalog-client';
import { Language, translations } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { Product, BackendCategory } from '../types';
import { ProductGridSkeleton } from './ui/skeletons';
import { PageHero } from './PageHero';
import { ScrollReveal } from './ui/ScrollReveal';

interface ShopPageProps {
  lang: Language;
  onProductSelect: (product: Product) => void;
}

const SORT_OPTIONS = ['all', 'newest', 'price: low to high', 'price: high to low'];
const CONTROL_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const getProductTimestamp = (product: Product) => {
  const timestamp = new Date(product.date ?? '').getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const ShopPage: React.FC<ShopPageProps> = ({ lang, onProductSelect }) => {
  const { shopEmptyAll, shopEmptyFiltered, shopBackToAll, shopShowMore, shopSortLabel } = useSiteContent();
  const t = translations[lang];
  const [catalogProducts, setCatalogProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [rootCategories, setRootCategories] = useState<BackendCategory[]>([]);
  const [activeMain, setActiveMain] = useState<string | null>(null);
  const [cols, setCols] = useState(3);
  const [activeSort, setActiveSort] = useState('all');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  const selectedRoot = useMemo(
    () => rootCategories.find((category) => category.slug === activeMain) ?? null,
    [activeMain, rootCategories]
  );

  // Build a flat set of ids covered by the selected root: the root itself,
  // plus any product whose category string matches the root's name.
  // Products whose categoryId is the root id (or whose category name matches)
  // are shown — sub-categories are auto-included under their root pill.
  const rootMatchedIds = useMemo(() => {
    if (!selectedRoot) return null;
    const ids = new Set<number>([selectedRoot.id]);
    return ids;
  }, [selectedRoot]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [roots, products] = await Promise.all([
          fetchCategoryRoots(),
          fetchCatalogProducts(),
        ]);
        setRootCategories(Array.isArray(roots) ? roots : []);
        setCatalogProducts(products ?? []);
      } catch (err) {
        console.error("Failed to load iCare shop data", err);
        setCatalogProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const allProducts = useMemo(() => catalogProducts ?? [], [catalogProducts]);

  const filteredProducts = useMemo(() => {
    let result: Product[] = [...allProducts];

    // Client-side category filtering — no backend category filter is sent.
    if (activeMain && selectedRoot) {
      // Root selected: show products whose categoryId matches the root,
      // or whose category string matches the root's name.
      // Sub-categories are auto-included (products whose category string
      // matches a child name are still shown under the root pill).
      result = result.filter((p) => {
        if (p.categoryId !== undefined) return rootMatchedIds?.has(p.categoryId) ?? false;
        const cat = p.category?.trim().toLowerCase() ?? '';
        if (!cat) return false;
        return cat === selectedRoot.name.trim().toLowerCase();
      });
    }
    // No activeMain → Shop All: show all products (no filter applied).

    switch (activeSort) {
      case 'newest':
        result.sort((a, b) => getProductTimestamp(b) - getProductTimestamp(a));
        break;
      case 'price: low to high':
        result.sort((a, b) => (a.rawPrice ?? 0) - (b.rawPrice ?? 0));
        break;
      case 'price: high to low':
        result.sort((a, b) => (b.rawPrice ?? 0) - (a.rawPrice ?? 0));
        break;
      default:
        break;
    }

    return result;
  }, [allProducts, activeSort, activeMain, selectedRoot, rootMatchedIds]);

  const resetFilters = () => {
    setActiveMain(null);
    setVisibleCount(12);
  };

  const selectRoot = (slug: string | null) => {
    if (!slug) { resetFilters(); return; }
    setActiveMain(slug);
  };

  useEffect(() => {
    setVisibleCount(12);
  }, [activeMain, activeSort]);

  if (loading && !catalogProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-screen-xl">
          <ProductGridSkeleton count={12} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <PageHero
        image="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1920"
        fallbackImage="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1920"
        alt="Shop iCare"
        title={t.pages.shop.title}
        subtitle={t.pages.shop.subtitle}
        priority
      />

      {/* Category Filter — single root layer */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10">
        <div className="overflow-x-auto no-scrollbar border-b border-black/10 pb-4">
          <div className="flex justify-center gap-3 px-1 md:px-4 min-w-max">
            <button
              onClick={() => selectRoot(null)}
              className={`px-6 md:px-8 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-colors ${CONTROL_FOCUS_CLASS} ${!activeMain ? 'bg-[#67645E] text-white' : 'bg-white text-[#67645E] border border-[#DDDDDD]'}`}
            >
              {t.pages.shop.shopAll}
            </button>
            {rootCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => selectRoot(cat.slug)}
                className={`px-6 md:px-8 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-colors ${CONTROL_FOCUS_CLASS} ${activeMain === cat.slug ? 'bg-[#67645E] text-white' : 'bg-white text-[#67645E] border border-[#DDDDDD]'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={`max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5 flex justify-between items-center border border-[#DDDDDD] mb-8 md:mb-10 md:sticky md:top-3 bg-white rounded-[12px] ${isSortOpen ? 'z-[65]' : 'z-40'}`}>
        <div className="relative z-[66]">
          <button type="button" className={`flex items-center gap-2 cursor-pointer group ${CONTROL_FOCUS_CLASS}`} onClick={() => setIsSortOpen(!isSortOpen)} aria-expanded={isSortOpen}>
            <span className="text-[14px] text-[#84827E] lowercase font-medium">{shopSortLabel}</span>
            <span className="text-[14px] text-[#67645E] font-black lowercase">{activeSort}</span>
            <ChevronDown size={16} className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isSortOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 mt-4 w-56 bg-white rounded-[12px] z-[66] py-3 border border-[#DDDDDD]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setActiveSort(opt); setIsSortOpen(false); }}
                    className={`w-full text-left px-6 py-3 text-[13px] font-medium hover:bg-[#F1F0ED] transition-colors lowercase ${CONTROL_FOCUS_CLASS}`}
                  >
                    {opt}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => setCols(2)} className={`rounded-md transition-colors ${CONTROL_FOCUS_CLASS} ${cols === 2 ? 'text-[#67645E]' : 'text-[#84827E] hover:text-[#67645E]'}`} aria-label="Use two column grid"><LayoutGrid size={22} /></button>
          <button onClick={() => setCols(3)} className={`rounded-md transition-colors hidden lg:block ${CONTROL_FOCUS_CLASS} ${cols === 3 ? 'text-[#67645E]' : 'text-[#84827E] hover:text-[#67645E]'}`} aria-label="Use three column grid"><Grid2X2 size={22} /></button>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <ScrollReveal direction="bottom" delay={0.05} viewportMargin="-40px">
          <div className={`grid grid-cols-1 min-[375px]:grid-cols-2 ${cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-10 lg:gap-x-8 lg:gap-y-14`}>
            {filteredProducts.slice(0, visibleCount).map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} onSelect={() => onProductSelect(p)} />
            ))}
          </div>
        </ScrollReveal>

        {visibleCount < filteredProducts.length && (
          <div className="mt-12 md:mt-20 flex justify-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 12)}
              className={`px-12 py-4 min-h-[44px] bg-[#67645E] text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-[#67645E]/90 transition-colors active:scale-[0.99] ${CONTROL_FOCUS_CLASS}`}
            >
              {shopShowMore}
            </button>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center">
            <h3 className="text-[24px] font-brand lowercase italic text-[#84827E]">
              {allProducts.length === 0 && !activeMain
                ? shopEmptyAll
                : shopEmptyFiltered}
            </h3>
            {(activeMain) && (
              <button onClick={resetFilters} className={`mt-6 text-[12px] font-black uppercase tracking-widest underline underline-offset-8 text-[#67645E] ${CONTROL_FOCUS_CLASS}`}>{shopBackToAll}</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
