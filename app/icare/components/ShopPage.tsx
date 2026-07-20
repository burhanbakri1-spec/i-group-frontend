import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from './ProductCard';
import { ChevronDown, Grid2X2, LayoutGrid } from 'lucide-react';
import { fetchCatalogProducts, fetchCategoryRoots, fetchCategoryChildren } from '../lib/catalog-client';
import { useSearchParams } from 'next/navigation';
import { Language, translations } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { Product, BackendCategory } from '../types';
import { ProductGridSkeleton } from './ui/skeletons';
import { PageHero } from './PageHero';
import { ScrollReveal } from './ui/ScrollReveal';
import { pickLocalized, pickLocalizedTrimmed } from '../lib/localized';

interface ShopPageProps {
  lang: Language;
  onProductSelect: (product: Product) => void;
}

const SORT_OPTIONS = ['all', 'newest', 'price: low to high', 'price: high to low'];
const CONTROL_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

// Offline-first default product list. Rendered when fetchCatalogProducts()
// returns null (BE unreachable / misconfigured) so the shop grid always shows
// at least 4 items. Product shape mirrors mapBackendProductToProduct output
// — only the fields ShopPage / ProductCard actually read are populated.
const getProductTimestamp = (product: Product) => {
  const timestamp = new Date(product.date ?? '').getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const ShopPage: React.FC<ShopPageProps> = ({ lang, onProductSelect }) => {
  const { shopEmptyAll, shopEmptyFiltered, shopBackToAll, shopShowMore, shopSortLabel } = useSiteContent(lang);
  const t = translations[lang];
  const [catalogProducts, setCatalogProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [rootCategories, setRootCategories] = useState<BackendCategory[]>([]);
  const [activeMain, setActiveMain] = useState<string | null>(null);
  const [cols, setCols] = useState(3);
  const [activeSort, setActiveSort] = useState('all');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const searchParams = useSearchParams();
  const [childrenByRoot, setChildrenByRoot] = useState<Record<string, BackendCategory[]>>({});
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [loadingChildren, setLoadingChildren] = useState(false);
  // Holds a slug from the URL that couldn't be resolved yet (children not loaded).
  const [pendingChildSlug, setPendingChildSlug] = useState<string | null>(null);

  const selectedRoot = useMemo(
    () => rootCategories.find((category) => category.slug === activeMain) ?? null,
    [activeMain, rootCategories]
  );

  // Build a flat set of ids covered by the selected root: the root itself
  // plus every child category id (children are auto-included under the
  // root pill unless the user has narrowed further via activeChild).
  const rootMatchedIds = useMemo(() => {
    if (!selectedRoot) return null;
    const ids = new Set<string | number>([selectedRoot.id]);
    const children = childrenByRoot[selectedRoot.slug] ?? [];
    for (const child of children) ids.add(child.id);
    return ids;
  }, [selectedRoot, childrenByRoot]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [roots, products] = await Promise.all([
          fetchCategoryRoots(),
          fetchCatalogProducts(undefined, lang),
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
  }, [lang]);

  // Load children for the currently selected root (lazy, cached in
  // childrenByRoot). Errored roots are stored as empty arrays so we
  // don't refetch on every render.
  useEffect(() => {
    if (!activeMain) return;
    if (childrenByRoot[activeMain]) return;
    let cancelled = false;
    setLoadingChildren(true);
    fetchCategoryChildren(activeMain)
      .then((children) => {
        if (cancelled) return;
        setChildrenByRoot((prev) => ({ ...prev, [activeMain]: children ?? [] }));
      })
      .catch(() => {
        if (cancelled) return;
        setChildrenByRoot((prev) => ({ ...prev, [activeMain]: [] }));
      })
      .finally(() => {
        if (!cancelled) setLoadingChildren(false);
      });
    return () => { cancelled = true; };
  }, [activeMain, childrenByRoot]);

  // Effect A: React to URL ?category= changes only.
  // Never depends on childrenByRoot — avoids the reset loop where a child-load
  // causes this effect to fire and then clears activeMain because the URL has
  // no ?category= param (the original bug).
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (!urlCategory) {
      setActiveMain(null);
      setActiveChild(null);
      setPendingChildSlug(null);
      return;
    }
    const root = rootCategories.find(c => c.slug === urlCategory);
    if (root) {
      setActiveMain(root.slug);
      setActiveChild(null);
      setPendingChildSlug(null);
      return;
    }
    // Unknown slug — could be a child category. Defer resolution to Effect B.
    setPendingChildSlug(urlCategory);
  }, [searchParams, rootCategories]);

  // Effect B: Resolve a pending child slug once children are available.
  // Separated from Effect A so child-loads don't re-trigger the URL reset path.
  useEffect(() => {
    if (!pendingChildSlug) return;
    for (const r of rootCategories) {
      const children = childrenByRoot[r.slug] ?? [];
      const child = children.find(c => c.slug === pendingChildSlug);
      if (child) {
        setActiveMain(r.slug);
        setActiveChild(child.slug);
        setPendingChildSlug(null);
        return;
      }
    }
    // Eagerly fetch children for any root not yet loaded so the next pass can resolve.
    const unloaded = rootCategories.filter(r => !childrenByRoot[r.slug]);
    if (unloaded.length === 0) return;
    let cancelled = false;
    Promise.all(unloaded.map(r => fetchCategoryChildren(r.slug).catch(() => [])))
      .then(results => {
        if (cancelled) return;
        setChildrenByRoot(prev => {
          const next = { ...prev };
          unloaded.forEach((r, i) => { next[r.slug] = results[i] ?? []; });
          return next;
        });
      });
    return () => { cancelled = true; };
  }, [pendingChildSlug, rootCategories, childrenByRoot]);

  const allProducts = useMemo(() => catalogProducts ?? [], [catalogProducts]);

  const filteredProducts = useMemo(() => {
    let result: Product[] = [...allProducts];

    // Client-side category filtering — no backend category filter is sent.
    if (activeMain && selectedRoot) {
      // Root selected: show products whose categoryId matches the root,
      // or whose category string matches the root's name.
      // Sub-categories are auto-included (products whose category string
      // matches a child name are still shown under the root pill).
      const selectedRootName = pickLocalizedTrimmed(selectedRoot.name, lang).toLowerCase();
      result = result.filter((p) => {
        if (p.categoryId !== undefined) return rootMatchedIds?.has(p.categoryId) ?? false;
        const cat = p.category?.trim().toLowerCase() ?? '';
        if (!cat) return false;
        return cat === selectedRootName;
      });
    }
    // Optional child narrowing: when activeChild is set, restrict the
    // already-root-filtered list to that specific child only.
    if (activeChild && selectedRoot) {
      const child = (childrenByRoot[selectedRoot.slug] ?? []).find(c => c.slug === activeChild);
      if (child) {
        const childName = pickLocalizedTrimmed(child.name, lang).toLowerCase();
        result = result.filter(p =>
          p.categoryId === child.id ||
          p.category?.trim().toLowerCase() === childName
        );
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
  }, [allProducts, activeSort, activeMain, selectedRoot, rootMatchedIds, activeChild, childrenByRoot, lang]);

  const resetFilters = () => {
    setActiveMain(null);
    setActiveChild(null);
    setPendingChildSlug(null);
    setVisibleCount(12);
  };

  const selectRoot = (slug: string | null) => {
    if (!slug) { resetFilters(); return; }
    // Clear child selection whenever the root changes.
    if (slug !== activeMain) setActiveChild(null);
    setActiveMain(slug);
  };

  useEffect(() => {
    setVisibleCount(12);
  }, [activeMain, activeSort]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const shouldCenterShopGridStart = cols === 3 && visibleProducts.length < 3;

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
    <div className="min-h-screen bg-white pb-32">
      <PageHero
        image=""
        fallbackImage=""
        alt="Shop iCare"
        title={t.pages.shop.title}
        subtitle={t.pages.shop.subtitle}
        priority
      />

      {/* Category Filter — single root layer */}
      <div className="max-w-[1600px] mx-auto pt-4 pb-10">
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
                {pickLocalized(cat.name, lang)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter — child layer (shown only when a root is selected) */}
      {selectedRoot && (
        <div className="max-w-[1600px] mx-auto pb-4 -mt-4">
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex justify-center gap-2 px-1 md:px-4 min-w-max">
              <button
                onClick={() => setActiveChild(null)}
                className={`px-4 md:px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${CONTROL_FOCUS_CLASS} ${!activeChild ? 'bg-[#67645E] text-white' : 'bg-white text-[#67645E] border border-[#DDDDDD]'}`}
              >
                {t.pages.shop.shopAll ?? 'All'} {pickLocalized(selectedRoot.name, lang)}
              </button>
              {loadingChildren ? (
                <span className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#84827E]">…</span>
              ) : (
                (childrenByRoot[selectedRoot.slug] ?? []).map((child) => (
                  <button
                    key={child.slug}
                    onClick={() => setActiveChild(child.slug)}
                    className={`px-4 md:px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${CONTROL_FOCUS_CLASS} ${activeChild === child.slug ? 'bg-[#67645E] text-white' : 'bg-white text-[#67645E] border border-[#DDDDDD]'}`}
                  >
                    {pickLocalized(child.name, lang)}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className={`max-w-[1600px] mx-auto mb-8 md:mb-10 md:sticky md:top-3 flex min-h-[3.25rem] items-center justify-between gap-4 border border-[#DDDDDD] bg-white rounded-[12px] px-4 md:px-6 py-3 md:py-4 ${isSortOpen ? 'z-[65]' : 'z-40'}`}>
        <div className="relative z-[66] flex min-w-0 items-center">
          <button type="button" className={`inline-flex min-h-9 items-center gap-2 cursor-pointer group ${CONTROL_FOCUS_CLASS}`} onClick={() => setIsSortOpen(!isSortOpen)} aria-expanded={isSortOpen}>
            <span className="text-[14px] font-medium lowercase leading-none text-[#84827E]">{shopSortLabel}</span>
            <span className="text-[14px] font-black lowercase leading-none text-[#67645E]">{activeSort}</span>
            <ChevronDown size={16} className={`shrink-0 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
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

        <div className="flex shrink-0 items-center gap-4 md:gap-5">
          <button onClick={() => setCols(2)} className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors ${CONTROL_FOCUS_CLASS} ${cols === 2 ? 'text-[#67645E]' : 'text-[#84827E] hover:text-[#67645E]'}`} aria-label="Use two column grid"><LayoutGrid size={20} strokeWidth={1.75} /></button>
          <button onClick={() => setCols(3)} className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hidden lg:inline-flex ${CONTROL_FOCUS_CLASS} ${cols === 3 ? 'text-[#67645E]' : 'text-[#84827E] hover:text-[#67645E]'}`} aria-label="Use three column grid"><Grid2X2 size={20} strokeWidth={1.75} /></button>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1600px] mx-auto pb-24">
        <ScrollReveal direction="bottom" delay={0.05} viewportMargin="-40px">
          <div className={`icare-shop-grid${cols === 3 ? ' icare-shop-grid--cols-3' : ''}${shouldCenterShopGridStart ? ' icare-shop-grid--center-start' : ''}`}>
            {visibleProducts.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} onSelect={() => onProductSelect(p)} />
            ))}
          </div>
        </ScrollReveal>

        {visibleCount < filteredProducts.length && (
          <div className="mt-12 md:mt-20 flex justify-center">
              <button
                onClick={() => setVisibleCount(prev => prev + 12)}
                className={`inline-flex min-h-12 items-center justify-center whitespace-nowrap px-12 py-4 bg-[#67645E] text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-[#67645E]/90 transition-colors active:scale-[0.99] ${CONTROL_FOCUS_CLASS}`}
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
