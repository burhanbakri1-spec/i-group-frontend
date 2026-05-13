import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProductCard } from './ProductCard';
import { ChevronDown, Grid2X2, LayoutGrid, X } from 'lucide-react';
import { fetchCatalogProducts, fetchCategoryRoots, fetchCategoryChildren } from '../lib/catalog-client';
import { Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { Product, BackendCategory } from '../types';

interface ShopPageProps {
  lang: Language;
  onProductSelect: (product: Product) => void;
}

const SORT_OPTIONS = ['all', 'newest', 'price: low to high', 'price: high to low'];
const CONTROL_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const getProductTimestamp = (product: Product) => {
  const timestamp = new Date(product.date ?? '').getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const ShopPage: React.FC<ShopPageProps> = ({ lang, onProductSelect }) => {
  const { shopEmptyAll, shopEmptyFiltered, shopBackToAll, shopShowMore, shopActiveFilters, shopClearAll, shopSortLabel } = useSiteContent();
  const [catalogProducts, setCatalogProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [rootCategories, setRootCategories] = useState<BackendCategory[]>([]);
  const [childCategories, setChildCategories] = useState<BackendCategory[]>([]);
  const [activeMain, setActiveMain] = useState<string | null>(null);
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [cols, setCols] = useState(3);
  const [activeSort, setActiveSort] = useState('all');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const childFetchSequence = useRef(0);

  const selectedRoot = useMemo(
    () => rootCategories.find((category) => category.slug === activeMain) ?? null,
    [activeMain, rootCategories]
  );

  const selectedChild = useMemo(
    () => childCategories.find((category) => category.slug === activeChild) ?? null,
    [activeChild, childCategories]
  );

  // Build a flat set of descendant IDs for the selected root category.
  // Used for client-side filtering: when a root is selected without a child,
  // products whose categoryId is the root's own id OR any descendant id are shown.
  // Filter childCategories by parentId so stale children from a previous root
  // do not temporarily pollute the descendant set during root transitions.
  const descendantIds = useMemo(() => {
    if (!selectedRoot) return new Set<number>();
    const ids = new Set<number>();
    ids.add(selectedRoot.id);
    for (const child of childCategories) {
      if (child.parentId === selectedRoot.id) {
        ids.add(child.id);
      }
    }
    return ids;
  }, [selectedRoot, childCategories]);

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

  // When activeMain changes, fetch its children.
  // Do NOT clear childCategories early — keep stale row visible until new children arrive
  // to prevent the row from blinking out during root-category transitions.
  useEffect(() => {
    childFetchSequence.current += 1;
    const requestId = childFetchSequence.current;

    if (!activeMain) {
      setChildCategories([]);
      setActiveChild(null);
      return;
    }

    if (!selectedRoot) {
      // selectedRoot is still building — do nothing, children stay stale
      return;
    }

    fetchCategoryChildren(selectedRoot.slug).then(children => {
      if (requestId !== childFetchSequence.current) return;
      setChildCategories(Array.isArray(children) ? children : []);
    });
  }, [activeMain, selectedRoot]);

  const allProducts = useMemo(() => catalogProducts ?? [], [catalogProducts]);

  const filteredProducts = useMemo(() => {
    let result: Product[] = [...allProducts];

    // Client-side category filtering — no backend category filter is sent.
    if (activeMain) {
      if (activeChild && selectedChild) {
        // Child category selected: show only products with matching categoryId.
        result = result.filter((p) =>
          p.categoryId === selectedChild.id ||
          (p.categoryId === undefined && p.category?.trim().toLowerCase() === selectedChild.name.trim().toLowerCase())
        );
      } else {
        // Root selected (no child picked): show products whose categoryId
        // is the root id or any descendant (children) id.
        result = result.filter((p) => {
          if (p.categoryId !== undefined) return descendantIds.has(p.categoryId);
          // Fallback: string match on category name against root or any child.
          const cat = p.category?.trim().toLowerCase() ?? '';
          if (!cat) return false;
          if (selectedRoot && cat === selectedRoot.name.trim().toLowerCase()) return true;
          return childCategories.some((c) => c.name.trim().toLowerCase() === cat);
        });
      }
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
  }, [allProducts, activeSort, activeMain, activeChild, selectedRoot, selectedChild, descendantIds, childCategories]);

  const resetFilters = () => {
    setActiveMain(null);
    setActiveChild(null);
    setChildCategories([]);
    setVisibleCount(12);
  };

  const selectRoot = (slug: string | null) => {
    if (!slug) { resetFilters(); return; }
    setActiveMain(slug);
    setActiveChild(null);
  };

  const selectChild = (slug: string) => {
    setActiveChild(slug);
  };

  useEffect(() => {
    setVisibleCount(12);
  }, [activeMain, activeChild, activeSort]);

  if (loading && !catalogProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FFFFFF]">
      {/* Banner */}
      <section className="relative w-full h-[30vh] md:h-[40vh] overflow-hidden rounded-b-[24px]">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1920"
          alt="Shop Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/15 flex flex-col items-center justify-center text-white text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="text-[42px] md:text-[68px] font-brand lowercase italic leading-tight"
          >
            {lang === 'en' ? 'curated care' : 'عناية مختارة'}
          </motion.h1>
          <p className="text-[12px] font-bold uppercase tracking-[0.3em] mt-4 opacity-80">
            {lang === 'en' ? 'exploration of beauty' : 'استكشاف الجمال'}
          </p>
        </div>
      </section>

      {/* Navigation & Hierarchy */}
      <div className="max-w-[1600px] mx-auto px-6 py-10 flex flex-col gap-8">

        {/* Level 1: Root Categories */}
        <div className="overflow-x-auto no-scrollbar border-b border-black/10 pb-4">
          <div className="flex md:justify-center justify-start gap-3 px-1 md:px-4 min-w-max">
            <button
              onClick={() => selectRoot(null)}
              className={`px-6 md:px-8 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-colors ${CONTROL_FOCUS_CLASS} ${!activeMain ? 'bg-black text-white shadow-md' : 'bg-white text-black/65 border border-black/10 hover:text-black hover:border-black/20'}`}
            >
              {lang === 'en' ? 'shop all' : 'تسوق الكل'}
            </button>
            {rootCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => selectRoot(cat.slug)}
                className={`px-6 md:px-8 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-colors ${CONTROL_FOCUS_CLASS} ${activeMain === cat.slug ? 'bg-black text-white shadow-md' : 'bg-white text-black/65 border border-black/10 hover:text-black hover:border-black/20'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Level 2: Child Categories */}
        <AnimatePresence mode="wait">
          {activeMain && childCategories.length > 0 && (
            <motion.div
              key={activeMain}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-x-auto no-scrollbar border-b border-black/10 pb-4 motion-reduce:transition-none"
            >
              <div className="flex md:justify-center justify-start gap-3 px-1 md:px-4 min-w-max">
                <button
                  onClick={() => setActiveChild(null)}
                  className={`px-6 py-2 rounded-full text-[11px] font-bold uppercase transition-colors ${CONTROL_FOCUS_CLASS} ${!activeChild ? 'bg-black text-white shadow-sm' : 'bg-[#EFEEEC] text-black/70 hover:bg-[#E4E2DD] hover:text-black'}`}
                >
                  {lang === 'en' ? 'all' : 'الكل'}
                </button>
                {childCategories.map((child) => (
                  <button
                    key={child.slug}
                    onClick={() => selectChild(child.slug)}
                    className={`px-6 py-2 rounded-full text-[11px] font-bold uppercase transition-colors ${CONTROL_FOCUS_CLASS} ${activeChild === child.slug ? 'bg-black text-white shadow-sm' : 'bg-[#EFEEEC] text-black/70 hover:bg-[#E4E2DD] hover:text-black'}`}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filter Badges — multi-level with per-level dismiss */}
        {activeMain && (
          <div className="flex flex-wrap items-center gap-3 px-4">
            <span className="text-[11px] font-bold text-black/60 uppercase tracking-widest">{shopActiveFilters}</span>

            {/* Root badge — X dismisses to Shop All */}
              <div className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {selectedRoot?.name}
                <button type="button" onClick={resetFilters} className={`rounded-full ${CONTROL_FOCUS_CLASS}`} aria-label="Remove root filter">
                  <X size={12} />
                </button>
              </div>

            {/* Child badge — X dismisses only child level, keeping root active (drill-up) */}
            {activeChild && (
                <div className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  {selectedChild?.name}
                  <button type="button" onClick={() => { setActiveChild(null); setVisibleCount(12); }} className={`rounded-full ${CONTROL_FOCUS_CLASS}`} aria-label="Remove child filter">
                    <X size={12} />
                  </button>
                </div>
            )}

            <button onClick={resetFilters} className={`text-[10px] font-bold text-black/60 underline underline-offset-4 hover:text-black transition-colors uppercase ${CONTROL_FOCUS_CLASS}`}>
              {shopClearAll}
            </button>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4 md:py-5 flex justify-between items-center border border-black/10 mb-8 md:mb-10 md:sticky md:top-3 bg-[#FFFFFF]/90 backdrop-blur-md z-40 rounded-2xl shadow-sm shadow-black/5">
        <div className="relative">
          <button type="button" className={`flex items-center gap-2 cursor-pointer group ${CONTROL_FOCUS_CLASS}`} onClick={() => setIsSortOpen(!isSortOpen)} aria-expanded={isSortOpen}>
            <span className="text-[14px] text-black/65 lowercase font-medium">{shopSortLabel}</span>
            <span className="text-[14px] text-black font-black lowercase">{activeSort}</span>
            <ChevronDown size={16} className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isSortOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 mt-4 w-56 bg-white rounded-[16px] shadow-2xl z-50 py-3 border border-black/5"
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setActiveSort(opt); setIsSortOpen(false); }}
                    className={`w-full text-left px-6 py-3 text-[13px] font-medium hover:bg-[#F2F1ED] transition-colors lowercase ${CONTROL_FOCUS_CLASS}`}
                  >
                    {opt}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => setCols(2)} className={`rounded-md transition-colors ${CONTROL_FOCUS_CLASS} ${cols === 2 ? 'text-black' : 'text-black/45 hover:text-black/70'}`} aria-label="Use two column grid"><LayoutGrid size={22} /></button>
          <button onClick={() => setCols(3)} className={`rounded-md transition-colors hidden lg:block ${CONTROL_FOCUS_CLASS} ${cols === 3 ? 'text-black' : 'text-black/45 hover:text-black/70'}`} aria-label="Use three column grid"><Grid2X2 size={22} /></button>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1600px] mx-auto px-3 md:px-6 pb-24">
        <div className={`grid grid-cols-2 ${cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-x-3 gap-y-6 md:gap-x-8 md:gap-y-14`}>
          {filteredProducts.slice(0, visibleCount).map((p) => (
            <ProductCard key={p.id} product={p} lang={lang} onSelect={() => onProductSelect(p)} />
          ))}
        </div>

        {visibleCount < filteredProducts.length && (
          <div className="mt-12 md:mt-20 flex justify-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 12)}
              className={`px-12 py-4 bg-black text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-black/90 transition-colors shadow-lg active:scale-[0.99] ${CONTROL_FOCUS_CLASS}`}
            >
              {shopShowMore}
            </button>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center">
            <h3 className="text-[24px] font-brand lowercase italic text-black/40">
              {allProducts.length === 0 && !activeMain
                ? shopEmptyAll
                : shopEmptyFiltered}
            </h3>
            {(activeMain) && (
              <button onClick={resetFilters} className={`mt-6 text-[12px] font-black uppercase tracking-widest underline underline-offset-8 ${CONTROL_FOCUS_CLASS}`}>{shopBackToAll}</button>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
    </div>
  );
};
