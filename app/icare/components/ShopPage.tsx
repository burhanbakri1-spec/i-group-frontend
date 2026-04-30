import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProductCard } from './ProductCard';
import { ChevronDown, Grid2X2, LayoutGrid, X } from 'lucide-react';
import { fetchCatalogProducts } from '../lib/catalog-client';
import { Language } from '../translations';
import { Product, BackendBrand } from '../types';
import { icareApi } from '../lib/api-client';
import { unwrapListData } from '../lib/mappers';

interface ShopPageProps {
  lang: Language;
  onProductSelect: (product: Product) => void;
}

type CategoryFilterHierarchy = Record<string, Record<string, string[]>>;

const normalizeFilterValue = (value?: string | null) => value?.trim().toLowerCase() ?? '';

const uniqueValues = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const EMPTY_PRODUCTS: Product[] = [];

export const ShopPage: React.FC<ShopPageProps> = ({ lang, onProductSelect }) => {
  const [catalogProducts, setCatalogProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMain, setActiveMain] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [cols, setCols] = useState(3);
  const [activeSort, setActiveSort] = useState('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [remoteBrands, setRemoteBrands] = useState<BackendBrand[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [data, brandsPayload] = await Promise.allSettled([
          fetchCatalogProducts(),
          icareApi.brands.list({ page: 1, limit: 100, isActive: true }),
        ]);
        if (data.status === 'fulfilled') {
          setCatalogProducts(data.value ?? []);
        }
        if (brandsPayload.status === 'fulfilled') {
          const brands = unwrapListData(brandsPayload.value);
          setRemoteBrands(Array.isArray(brands) ? brands : []);
        }
      } catch (err) {
          console.error("Failed to load iCare products", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const allProducts = catalogProducts ?? EMPTY_PRODUCTS;
  const backendCategoryHierarchy = useMemo<CategoryFilterHierarchy>(() => {
    const hierarchy: CategoryFilterHierarchy = {};
    const remoteBrandCountryByName = new Map(
      remoteBrands.map((brand) => [normalizeFilterValue(brand.name), normalizeFilterValue(brand.country) || 'all brands'])
    );

    uniqueValues(allProducts.map((product) => normalizeFilterValue(product.category ?? product.main))).forEach((categoryName) => {
      if (!categoryName) return;
      const categoryProducts = allProducts.filter((product) => normalizeFilterValue(product.category ?? product.main) === categoryName);
      const subFilters = uniqueValues(categoryProducts.map((product) => normalizeFilterValue(product.sub ?? product.brand ?? categoryName)));
      hierarchy[categoryName] = Object.fromEntries(
        (subFilters.length > 0 ? subFilters : [categoryName]).map((subFilter) => {
          const typeFilters = uniqueValues(categoryProducts
            .filter((product) => normalizeFilterValue(product.sub ?? product.brand ?? categoryName) === subFilter)
            .map((product) => normalizeFilterValue(product.type ?? product.name)));
          return [subFilter, typeFilters.length > 0 ? typeFilters : [subFilter]];
        })
      );
    });

    const productsWithBrands = allProducts.filter((product) => normalizeFilterValue(product.brand));
    if (productsWithBrands.length > 0) {
      hierarchy.brands = productsWithBrands.reduce<Record<string, string[]>>((groups, product) => {
        const brandName = normalizeFilterValue(product.brand);
        if (!brandName) return groups;
        const country = remoteBrandCountryByName.get(brandName) ?? 'all brands';
        groups[country] = uniqueValues([...(groups[country] ?? []), brandName]);
        return groups;
      }, {});
    }

    return hierarchy;
  }, [allProducts, remoteBrands]);

  const filteredProducts = useMemo(() => {
    let result: Product[] = [...allProducts];

    if (activeMain) {
      if (activeMain === 'brands') {
        if (activeSub) {
          const activeBrandNames = backendCategoryHierarchy.brands?.[activeSub] ?? [];
            result = result.filter(p => activeBrandNames.includes(normalizeFilterValue(p.brand)));
            if (activeType) {
              result = result.filter(p => normalizeFilterValue(p.brand) === normalizeFilterValue(activeType));
            }
        } else {
          const backendBrandNames = Object.values(backendCategoryHierarchy.brands ?? {}).flat();
          result = result.filter(p => backendBrandNames.includes(normalizeFilterValue(p.brand)));
        }
      } else {
        result = result.filter(p => normalizeFilterValue(p.main ?? p.category) === normalizeFilterValue(activeMain));
        if (activeSub) {
          result = result.filter(p => normalizeFilterValue(p.sub ?? p.brand) === normalizeFilterValue(activeSub));
        }
        if (activeType) {
          result = result.filter(p => normalizeFilterValue(p.type) === normalizeFilterValue(activeType));
        }
      }
    }

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
  }, [allProducts, backendCategoryHierarchy, activeMain, activeSub, activeType, activeSort]);

  const resetFilters = () => {
    setActiveMain(null);
    setActiveSub(null);
    setActiveType(null);
    setVisibleCount(12);
  };

  const removeFilter = (level: number) => {
    if (level === 1) resetFilters();
    if (level === 2) { setActiveSub(null); setActiveType(null); setVisibleCount(12); }
    if (level === 3) { setActiveType(null); setVisibleCount(12); }
  };

  useEffect(() => {
    setVisibleCount(12);
  }, [activeMain, activeSub, activeType, activeSort]);

  useEffect(() => {
    if (!activeMain) return;

    const mainFilters = Object.keys(backendCategoryHierarchy);
    if (!mainFilters.includes(activeMain)) {
      resetFilters();
      return;
    }

    const subFilters = Object.keys(backendCategoryHierarchy[activeMain] ?? {});
    if (activeSub && !subFilters.includes(activeSub)) {
      setActiveSub(null);
      setActiveType(null);
      return;
    }

    const typeFilters = activeSub ? backendCategoryHierarchy[activeMain]?.[activeSub] ?? [] : [];
    if (activeType && !typeFilters.includes(activeType)) {
      setActiveType(null);
    }
  }, [activeMain, activeSub, activeType, backendCategoryHierarchy]);

  const activeHierarchy = activeMain ? backendCategoryHierarchy[activeMain] : undefined;

  if (loading && !catalogProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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

        {/* Level 1: Main */}
        <div className="overflow-x-auto no-scrollbar border-b border-black/5 pb-4">
          <div className="flex md:justify-center justify-start gap-4 px-4 min-w-max">
            <button
              onClick={resetFilters}
              className={`px-8 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-all ${!activeMain ? 'bg-black text-white shadow-lg' : 'bg-white text-black/40 border border-black/5 hover:text-black'
                }`}
            >
              {lang === 'en' ? 'shop all' : 'تسوق الكل'}
            </button>
            {Object.keys(backendCategoryHierarchy).map((main) => (
              <button
                key={main}
                onClick={() => { setActiveMain(main); setActiveSub(null); setActiveType(null); }}
                className={`px-8 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-all ${activeMain === main ? 'bg-black text-white shadow-lg' : 'bg-white text-black/40 border border-black/5 hover:text-black'
                  }`}
              >
                {main}
              </button>
            ))}
          </div>
        </div>

        {/* Level 2: Sub / Country */}
        <AnimatePresence mode="wait">
          {activeMain && activeHierarchy && (
            <motion.div
              key={activeMain}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="overflow-x-auto no-scrollbar border-b border-black/5 pb-4"
            >
              <div className="flex md:justify-center justify-start gap-3 px-4 min-w-max">
                {Object.keys(activeHierarchy).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => { setActiveSub(sub); setActiveType(null); }}
                    className={`px-6 py-2 rounded-full text-[11px] font-bold uppercase transition-all ${activeSub === sub ? 'bg-white text-black border border-black shadow-sm' : 'bg-[#EFEEEC]/50 text-black/60 hover:bg-[#EFEEEC]'
                      }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level 3: Types / Brands (Logo Circles) */}
        <AnimatePresence mode="wait">
          {activeMain && activeSub && activeHierarchy?.[activeSub] && (
            <motion.div
              key={`${activeMain}-${activeSub}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white/40 rounded-[24px] p-6"
            >
              <div className="overflow-x-auto no-scrollbar">
                <div className={`flex ${activeMain === 'brands' ? 'gap-8' : 'gap-3 flex-wrap justify-center'} min-w-max`}>
                  {activeHierarchy[activeSub].map((item: string) => (
                    <button
                      key={item}
                      onClick={() => setActiveType(item)}
                      className="group flex flex-col items-center gap-3 transition-all"
                    >
                      {activeMain === 'brands' ? (
                        <div className={`w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center transition-all ${activeType === item ? 'ring-2 ring-black ring-offset-4 bg-black text-white' : 'bg-white border border-black/5 shadow-sm group-hover:shadow-md'
                          }`}>
                          <span className="text-[10px] font-black uppercase text-center px-2 leading-tight">
                            {item}
                          </span>
                        </div>
                      ) : (
                        <span className={`px-5 py-2 text-[11px] font-bold lowercase border rounded-full transition-all ${activeType === item ? 'bg-black text-white border-black' : 'bg-white/50 text-black/70 border-black/10 hover:border-black/30'
                          }`}>
                          {item}
                        </span>
                      )}
                      {activeMain === 'brands' && (
                        <span className={`text-[10px] font-bold lowercase ${activeType === item ? 'text-black' : 'text-black/50'}`}>
                          {item}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filter Badges */}
        {(activeMain || activeSub || activeType) && (
          <div className="flex flex-wrap items-center gap-3 px-4">
            <span className="text-[11px] font-bold text-black/40 uppercase tracking-widest">{lang === 'en' ? 'active filters:' : 'الفلاتر النشطة:'}</span>
            {activeMain && (
              <div className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {activeMain} <X size={12} className="cursor-pointer" onClick={() => removeFilter(1)} />
              </div>
            )}
            {activeSub && (
              <div className="flex items-center gap-2 bg-white border border-black px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {activeSub} <X size={12} className="cursor-pointer" onClick={() => removeFilter(2)} />
              </div>
            )}
            {activeType && (
              <div className="flex items-center gap-2 bg-[#EFEEEC] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {activeType} <X size={12} className="cursor-pointer" onClick={() => removeFilter(3)} />
              </div>
            )}
            <button onClick={resetFilters} className="text-[10px] font-bold text-black/40 underline underline-offset-4 hover:text-black transition-colors uppercase">
              {lang === 'en' ? 'clear all' : 'مسح الكل'}
            </button>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="max-w-[1600px] mx-auto px-6 py-6 flex justify-between items-center border-b border-black/5 mb-10 sticky top-0 bg-[#FFFFFF]/80 backdrop-blur-md z-40">
        <div className="relative">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsSortOpen(!isSortOpen)}>
            <span className="text-[14px] text-black/50 lowercase font-medium">sort:</span>
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
              {lang === 'en' ? 'show more' : 'عرض المزيد'}
            </button>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center">
            <h3 className="text-[24px] font-brand lowercase italic text-black/40">
              {allProducts.length === 0 && !activeMain && !activeSub && !activeType
                ? 'No products are available yet.'
                : 'No products found in this selection.'}
            </h3>
            {(activeMain || activeSub || activeType) && (
              <button onClick={resetFilters} className="mt-6 text-[12px] font-black uppercase tracking-widest underline underline-offset-8">back to all products</button>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
    </div>
  );
};
