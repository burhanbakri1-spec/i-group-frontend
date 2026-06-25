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
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'fallback-glazing-milk',
    name: 'Glazing Milk',
    title: 'Glazing Milk',
    description: 'Facial treatment essence',
    price: '$29',
    rawPrice: 29,
    image: 'https://images.unsplash.com/photo-1616683693504-3ce769069d67?q=80&w=800',
    primaryImage: 'https://images.unsplash.com/photo-1616683693504-3ce769069d67?q=80&w=800',
    secondaryImage: 'https://images.unsplash.com/photo-1666025062728-c33a25e8ee3f?q=80&w=800',
    category: 'Skincare',
    reviews: '12847',
    stockStatus: 'in_stock',
    stock: 100,
  },
  {
    id: 'fallback-barrier-cream',
    name: 'Barrier Restore Cream',
    title: 'Barrier Restore Cream',
    description: 'Rich barrier moisturizer',
    price: '$38',
    rawPrice: 38,
    image: 'https://images.unsplash.com/photo-1670201203150-bf8771401590?q=80&w=800',
    primaryImage: 'https://images.unsplash.com/photo-1670201203150-bf8771401590?q=80&w=800',
    secondaryImage: 'https://images.unsplash.com/photo-1635870224943-26189bd9e527?q=80&w=800',
    category: 'Skincare',
    reviews: '8203',
    stockStatus: 'in_stock',
    stock: 100,
  },
  {
    id: 'fallback-pocket-blush',
    name: 'Pocket Blush',
    title: 'Pocket Blush',
    description: 'Creamy long-wearing tint',
    price: '$22',
    rawPrice: 22,
    image: 'https://images.unsplash.com/photo-1611960555774-35f9d21c7e25?q=80&w=800',
    primaryImage: 'https://images.unsplash.com/photo-1611960555774-35f9d21c7e25?q=80&w=800',
    secondaryImage: 'https://images.unsplash.com/photo-1728994062543-74a1dc2c9392?q=80&w=800',
    category: 'Makeup',
    reviews: '15892',
    stockStatus: 'in_stock',
    stock: 100,
  },
  {
    id: 'fallback-peptide-lip',
    name: 'Peptide Lip Tint',
    title: 'Peptide Lip Tint',
    description: 'Nourishing color treatment',
    price: '$22',
    rawPrice: 22,
    image: 'https://images.unsplash.com/photo-1589221134210-f010476445e2?q=80&w=800',
    primaryImage: 'https://images.unsplash.com/photo-1589221134210-f010476445e2?q=80&w=800',
    secondaryImage: 'https://images.unsplash.com/photo-1710580889701-9fa8f2cd5927?q=80&w=800',
    category: 'Makeup',
    reviews: '21506',
    stockStatus: 'in_stock',
    stock: 100,
  },
  {
    id: 'fallback-eye-treatment',
    name: 'Peptide Eye Treatment',
    title: 'Peptide Eye Treatment',
    description: 'Brightening eye complex',
    price: '$34',
    rawPrice: 34,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800',
    primaryImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800',
    secondaryImage: 'https://images.unsplash.com/photo-1635631414456-6a9dc5051a3d?q=80&w=800',
    category: 'Skincare',
    reviews: '5129',
    stockStatus: 'in_stock',
    stock: 100,
  },
  {
    id: 'fallback-glazing-fluid',
    name: 'Peptide Glazing Fluid',
    title: 'Peptide Glazing Fluid',
    description: 'Dewy hydration serum',
    price: '$32',
    rawPrice: 32,
    image: 'https://images.unsplash.com/photo-1638609927040-8a7e97cd9d6a?q=80&w=800',
    primaryImage: 'https://images.unsplash.com/photo-1638609927040-8a7e97cd9d6a?q=80&w=800',
    secondaryImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800',
    category: 'Skincare',
    reviews: '9342',
    stockStatus: 'in_stock',
    stock: 100,
  },
];

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

  const selectedRoot = useMemo(
    () => rootCategories.find((category) => category.slug === activeMain) ?? null,
    [activeMain, rootCategories]
  );

  // Build a flat set of ids covered by the selected root: the root itself
  // plus every child category id (children are auto-included under the
  // root pill unless the user has narrowed further via activeChild).
  const rootMatchedIds = useMemo(() => {
    if (!selectedRoot) return null;
    const ids = new Set<number>([selectedRoot.id]);
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

  // React to ?category=<slug> in the URL. Root slugs auto-select the root;
  // child slugs auto-select the owning root and the child. If neither
  // rootCategories nor the relevant children have loaded yet we wait and
  // re-run when they arrive. To make deep-links to child slugs work
  // without a prior root click, lazily load children for any unloaded
  // roots on first miss so the next pass can resolve the child.
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (!urlCategory) {
      setActiveMain(null);
      setActiveChild(null);
      return;
    }
    const root = rootCategories.find(c => c.slug === urlCategory);
    if (root) {
      setActiveMain(root.slug);
      setActiveChild(null);
      return;
    }
    for (const r of rootCategories) {
      const children = childrenByRoot[r.slug] ?? [];
      const child = children.find(c => c.slug === urlCategory);
      if (child) {
        setActiveMain(r.slug);
        setActiveChild(child.slug);
        return;
      }
    }
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
  }, [searchParams, rootCategories, childrenByRoot]);

  const allProducts = useMemo(
    () => (catalogProducts && catalogProducts.length > 0 ? catalogProducts : DEFAULT_PRODUCTS),
    [catalogProducts]
  );

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
    <div className="min-h-screen bg-white pb-32">
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
                {pickLocalized(cat.name, lang)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter — child layer (shown only when a root is selected) */}
      {selectedRoot && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-4 -mt-4">
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
