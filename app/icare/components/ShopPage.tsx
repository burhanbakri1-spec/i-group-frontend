import React, { useState, useMemo, useEffect } from 'react';
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

export const ShopPage: React.FC<ShopPageProps> = ({ lang, onProductSelect }) => {
  const { shopEmptyAll, shopEmptyFiltered, shopBackToAll, shopShowMore, shopActiveFilters, shopClearAll, shopSortLabel } = useSiteContent();
  const [catalogProducts, setCatalogProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingCategory, setFetchingCategory] = useState(false);
  const [rootCategories, setRootCategories] = useState<BackendCategory[]>([]);
  const [childCategories, setChildCategories] = useState<BackendCategory[]>([]);
  const [activeMain, setActiveMain] = useState<string | null>(null);
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [cols, setCols] = useState(3);
  const [activeSort, setActiveSort] = useState('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [data, roots] = await Promise.allSettled([
          fetchCatalogProducts(),
          fetchCategoryRoots(),
        ]);
        if (data.status === 'fulfilled') {
          setCatalogProducts(data.value ?? []);
        }
        if (roots.status === 'fulfilled') {
          setRootCategories(Array.isArray(roots.value) ? roots.value : []);
        }
      } catch (err) {
        console.error("Failed to load iCare products", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // When activeMain changes, fetch its children
  useEffect(() => {
    if (!activeMain) {
      setChildCategories([]);
      setActiveChild(null);
      setActiveCategoryId(null);
      return;
    }
    const root = rootCategories.find(c => c.slug === activeMain);
    if (!root) {
      setChildCategories([]);
      setActiveCategoryId(null);
      return;
    }
    setActiveCategoryId(root.id);
    fetchCategoryChildren(root.slug).then(children => {
      setChildCategories(Array.isArray(children) ? children : []);
    });
  }, [activeMain, rootCategories]);

  useEffect(() => {
    if (catalogProducts === null) return;

    const fetchForCategory = async () => {
      setFetchingCategory(true);
      try {
        const targetId = activeChild
          ? childCategories.find(c => c.slug === activeChild)?.id
          : activeCategoryId;
        const data = await fetchCatalogProducts(targetId ?? undefined);
        setCatalogProducts(data ?? []);
      } finally {
        setFetchingCategory(false);
      }
    };

    fetchForCategory();
  }, [activeCategoryId, activeChild, childCategories]);

  const allProducts = catalogProducts ?? [];

  const filteredProducts = useMemo(() => {
    let result: Product[] = [...allProducts];

    switch (activeSort) {
      case 'newest':
        result.sort((a, b) => new Date(b.date ?? '').getTime() - new Date(a.date ?? '').getTime());
        break;
      case 'price: low to high':
        result.sort((a, b) => (a.rawPrice || 0) - (b.rawPrice || 0));
        break;
      case 'price: high to low':
        result.sort((a, b) => (b.rawPrice || 0) - (a.rawPrice || 0));
        break;
      default:
        result.sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'));
        break;
    }

    return result;
  }, [allProducts, activeSort]);

  const resetFilters = () => {
    setActiveMain(null);
    setActiveChild(null);
    setActiveCategoryId(null);
    setChildCategories([]);
    setVisibleCount(12);
  };

  const removeFilter = (level: number) => {
    if (level === 1) resetFilters();
    if (level === 2) { setActiveChild(null); setVisibleCount(12); }
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

  if ((loading || fetchingCategory) && !catalogProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getSelectedCategoryName = () => {
    if (activeChild) {
      const child = childCategories.find(c => c.slug === activeChild);
      return child?.name;
    }
    if (activeMain) {
      const root = rootCategories.find(c => c.slug === activeMain);
      return root?.name;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
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
        <div className="overflow-x-auto no-scrollbar border-b border-black/5 pb-4">
          <div className="flex md:justify-center justify-start gap-4 px-4 min-w-max">
            <button
              onClick={() => selectRoot(null)}
              className={`px-8 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-all ${!activeMain ? 'bg-black text-white shadow-lg' : 'bg-white text-black/40 border border-black/5 hover:text-black'}`}
            >
              {lang === 'en' ? 'shop all' : 'تسوق الكل'}
            </button>
            {rootCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => selectRoot(cat.slug)}
                className={`px-8 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-all ${activeMain === cat.slug ? 'bg-black text-white shadow-lg' : 'bg-white text-black/40 border border-black/5 hover:text-black'}`}
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
              className="overflow-x-auto no-scrollbar border-b border-black/5 pb-4"
            >
              <div className="flex md:justify-center justify-start gap-3 px-4 min-w-max">
                <button
                  onClick={() => setActiveChild(null)}
                  className={`px-6 py-2 rounded-full text-[11px] font-bold uppercase transition-all ${!activeChild ? 'bg-black text-white shadow-sm' : 'bg-[#EFEEEC]/50 text-black/60 hover:bg-[#EFEEEC]'}`}
                >
                  {lang === 'en' ? 'all' : 'الكل'}
                </button>
                {childCategories.map((child) => (
                  <button
                    key={child.slug}
                    onClick={() => selectChild(child.slug)}
                    className={`px-6 py-2 rounded-full text-[11px] font-bold uppercase transition-all ${activeChild === child.slug ? 'bg-black text-white shadow-sm' : 'bg-[#EFEEEC]/50 text-black/60 hover:bg-[#EFEEEC]'}`}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filter Badges */}
        {activeMain && getSelectedCategoryName() && (
          <div className="flex flex-wrap items-center gap-3 px-4">
            <span className="text-[11px] font-bold text-black/40 uppercase tracking-widest">{shopActiveFilters}</span>
            {activeMain && (
              <div className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {getSelectedCategoryName()} <X size={12} className="cursor-pointer" onClick={() => removeFilter(1)} />
              </div>
            )}
            <button onClick={resetFilters} className="text-[10px] font-bold text-black/40 underline underline-offset-4 hover:text-black transition-colors uppercase">
              {shopClearAll}
            </button>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="max-w-[1600px] mx-auto px-6 py-6 flex justify-between items-center border-b border-black/5 mb-10 sticky top-0 bg-[#FFFFFF]/80 backdrop-blur-md z-40">
        <div className="relative">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsSortOpen(!isSortOpen)}>
            <span className="text-[14px] text-black/50 lowercase font-medium">{shopSortLabel}</span>
            <span className="text-[14px] text-black font-black lowercase">{activeSort}</span>
            <ChevronDown size={16} className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
          </div>
          <AnimatePresence>
            {isSortOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 mt-4 w-56 bg-white rounded-[16px] shadow-2xl z-50 py-3 border border-black/5"
              >
                {['featured', 'newest', 'price: low to high', 'price: high to low'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setActiveSort(opt); setIsSortOpen(false); }}
                    className="w-full text-left px-6 py-3 text-[13px] font-medium hover:bg-[#F2F1ED] transition-colors lowercase"
                  >
                    {opt}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => setCols(2)} className={`transition-colors ${cols === 2 ? 'text-black' : 'text-black/20 hover:text-black/40'}`}><LayoutGrid size={22} /></button>
          <button onClick={() => setCols(3)} className={`transition-colors hidden lg:block ${cols === 3 ? 'text-black' : 'text-black/20 hover:text-black/40'}`}><Grid2X2 size={22} /></button>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1600px] mx-auto px-3 md:px-6 pb-24">
        <div className={`grid grid-cols-2 ${cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-x-3 gap-y-3 md:gap-x-8 md:gap-y-16`}>
          {filteredProducts.slice(0, visibleCount).map((p) => (
            <ProductCard key={p.id} product={p} lang={lang} onSelect={() => onProductSelect(p)} />
          ))}
        </div>

        {visibleCount < filteredProducts.length && (
          <div className="mt-12 md:mt-20 flex justify-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="px-12 py-4 bg-black text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-black/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95"
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
              <button onClick={resetFilters} className="mt-6 text-[12px] font-black uppercase tracking-widest underline underline-offset-8">{shopBackToAll}</button>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
    </div>
  );
};
