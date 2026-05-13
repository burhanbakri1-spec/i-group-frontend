import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { Product } from '../types';
import { icareApi } from '../lib/api-client';
import { mapBackendProductToProduct, mapBrandNames, mapCategoryNames, unwrapListData } from '../lib/mappers';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  onProductSelect?: (product: Product) => void;
}

const DRAWER_BACKDROP_Z_CLASS = 'z-[70]';
const DRAWER_PANEL_Z_CLASS = 'z-[75]';
const CONTROL_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3F2EE]';
const INPUT_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const DRAWER_TRANSITION = { duration: 0.18, ease: 'easeOut' as const };

export const SearchDrawer: React.FC<SearchDrawerProps> = ({ isOpen, onClose, onProductSelect }) => {
  const shouldReduceMotion = useReducedMotion();
  const {
    searchDrawerTitle,
    searchPlaceholder,
    searchNoResults,
    searchCollectionsHeading,
    searchProductsHeading,
    searchBrandsHeading,
    searchCollectionsUnavailable,
  } = useSiteContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [remoteCollections, setRemoteCollections] = useState<string[]>([]);
  const [remoteProducts, setRemoteProducts] = useState<Product[]>([]);
  const [remoteBrands, setRemoteBrands] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    if (!icareApi.isConfigured()) {
      const clearTimer = window.setTimeout(() => {
        setRemoteProducts([]);
        setRemoteCollections([]);
        setRemoteBrands([]);
      }, 0);
      return () => window.clearTimeout(clearTimer);
    }

    const loadSearchData = async () => {
      try {
        const [productPayload, categoriesPayload, brandPayload] = await Promise.allSettled([
          icareApi.products.list({ search: searchQuery || undefined, page: 1, limit: 8, active: true }),
          searchQuery ? icareApi.categories.search(searchQuery) : icareApi.categories.roots(),
          icareApi.brands.list({ search: searchQuery || undefined, page: 1, limit: 12, isActive: true }),
        ]);
        if (productPayload.status === 'fulfilled') {
          setRemoteProducts(unwrapListData(productPayload.value).map((product) => mapBackendProductToProduct(product)));
        } else {
          setRemoteProducts([]);
        }
        if (categoriesPayload.status === 'fulfilled') {
          setRemoteCollections(mapCategoryNames(unwrapListData(categoriesPayload.value)));
        } else {
          setRemoteCollections([]);
        }
        if (brandPayload.status === 'fulfilled') {
          setRemoteBrands(mapBrandNames(unwrapListData(brandPayload.value)));
        } else {
          setRemoteBrands([]);
        }
      } catch (error) {
        console.error('Failed to load search data', error);
        setRemoteProducts([]);
        setRemoteCollections([]);
        setRemoteBrands([]);
      }
    };

    const searchTimer = window.setTimeout(loadSearchData, 250);
    return () => window.clearTimeout(searchTimer);
  }, [isOpen, searchQuery]);

  const searchableCollections = remoteCollections;
  const searchableProducts = remoteProducts;
  const searchableBrands = remoteBrands;

  // Filtering Logic
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();

    return {
      collections: searchableCollections.filter(c => c.toLowerCase().includes(query)),
      products: searchableProducts.filter(p => p.name.toLowerCase().includes(query) || (p.category ?? '').toLowerCase().includes(query)),
      brands: searchableBrands.filter(b => b.toLowerCase().includes(query))
    };
  }, [searchQuery, searchableCollections, searchableProducts, searchableBrands]);

  const hasResults = filteredResults && (
    filteredResults.collections.length > 0 || 
    filteredResults.products.length > 0 || 
    filteredResults.brands.length > 0
  );

  const handleProductSelect = (product: Product) => {
    onProductSelect?.(product);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment key="search-drawer">
          <motion.div 
            key="search-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={DRAWER_TRANSITION}
            className={`fixed inset-0 bg-black/35 backdrop-blur-[2px] ${DRAWER_BACKDROP_Z_CLASS}`}
          />
          
          <motion.div 
            key="search-drawer-content"
            initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            transition={DRAWER_TRANSITION}
            className={`fixed top-0 right-0 h-full w-full max-w-[500px] bg-[#F3F2EE] ${DRAWER_PANEL_Z_CLASS} shadow-2xl flex flex-col font-sans overflow-hidden`}
          >
            {/* Header */}
            <div className="relative p-6 flex items-center justify-center border-b border-black/5">
              <h2 className="text-[15px] font-black text-[#333] tracking-normal lowercase">{searchDrawerTitle}</h2>
              <button 
                onClick={onClose} 
                className={`absolute right-6 p-1 text-[#5F5D59] hover:text-black transition-colors ${CONTROL_FOCUS_CLASS}`}
                aria-label="Close search"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8 no-scrollbar">
              {/* Search Input */}
              <div className="mb-10">
                <div className="relative bg-white rounded-[8px] border border-black/10 overflow-hidden shadow-sm focus-within:border-black/30 focus-within:ring-2 focus-within:ring-[#E11D48]/70 focus-within:ring-offset-2 focus-within:ring-offset-[#F3F2EE]">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full px-5 py-4 text-[16px] text-[#333] placeholder:text-[#666] bg-transparent outline-none border-none font-medium"
                    autoFocus
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#5F5D59] hover:text-black ${INPUT_FOCUS_CLASS}`}
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Search Results */}
              {searchQuery.trim() !== '' ? (
                <div className="space-y-12 pb-20">
                  {hasResults ? (
                    <>
                      {/* Matching Collections */}
                      {filteredResults.collections.length > 0 && (
                        <div>
                          <h3 className="text-[12px] font-black text-[#666] mb-4 uppercase tracking-[0.1em]">{searchCollectionsHeading}</h3>
                          <div className="space-y-3">
                            {filteredResults.collections.map((item) => (
                              <button key={`collection-${item}`} className={`flex items-center justify-between w-full group text-left rounded-[8px] ${CONTROL_FOCUS_CLASS}`}>
                                <span className="text-[16px] font-medium text-[#333] lowercase">{item}</span>
                                <ArrowRight size={16} className="text-[#666] opacity-0 group-hover:opacity-100 transition-all duration-200 motion-reduce:transition-none motion-reduce:translate-x-0 -translate-x-2 group-hover:translate-x-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Products */}
                      {filteredResults.products.length > 0 && (
                        <div>
                          <h3 className="text-[12px] font-black text-[#666] mb-6 uppercase tracking-[0.1em]">{searchProductsHeading}</h3>
                          <div className="space-y-6">
                            {filteredResults.products.map((product) => (
                              <button key={product.id} onClick={() => handleProductSelect(product)} className={`flex items-center gap-5 group cursor-pointer text-left w-full rounded-[8px] ${CONTROL_FOCUS_CLASS}`}>
                                <div className="w-14 h-16 bg-white/40 rounded-[8px] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                  <ImageWithFallback 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-full h-full object-contain mix-blend-multiply p-1 group-hover:scale-[1.03] transition-transform duration-200 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[14px] font-black text-[#333] tracking-widest uppercase">{product.name}</span>
                                  <span className="text-[12px] text-[#5F5D59] lowercase">{product.category ?? product.price}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Brands */}
                      {filteredResults.brands.length > 0 && (
                        <div>
                          <h3 className="text-[12px] font-black text-[#666] mb-4 uppercase tracking-[0.1em]">{searchBrandsHeading}</h3>
                          <div className="flex flex-wrap gap-2">
                            {filteredResults.brands.map((brand) => (
                              <span key={`brand-${brand}`} className="px-4 py-2 bg-white/60 border border-black/5 rounded-full text-[13px] font-medium text-[#333] lowercase">
                                {brand}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-[16px] text-[#5F5D59] font-medium italic">{searchNoResults} &quot;{searchQuery}&quot;</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-12">
                  <div>
                    <h3 className="text-[14px] font-black text-[#333] mb-5 lowercase">collections:</h3>
                    {searchableCollections.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {searchableCollections.map((item) => (
                          <button key={`default-collection-${item}`} className={`text-left text-[15px] text-[#5F5D59] font-medium hover:text-black transition-colors lowercase rounded-[8px] ${CONTROL_FOCUS_CLASS}`}>{item}</button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-[#5F5D59] font-medium italic">{searchCollectionsUnavailable}</p>
                    )}
                  </div>

                  <div className="border-t border-black/10 pt-8">
                    <h3 className="text-[14px] font-black text-[#333] mb-6 lowercase">recommended:</h3>
                    {searchableProducts.length > 0 ? (
                      <div className="space-y-8">
                        {searchableProducts.slice(0, 2).map((product) => (
                          <button key={product.id} onClick={() => handleProductSelect(product)} className={`flex items-center gap-6 group cursor-pointer text-left w-full rounded-[8px] ${CONTROL_FOCUS_CLASS}`}>
                            <div className="w-16 h-20 bg-white/40 rounded-[8px] overflow-hidden flex items-center justify-center">
                              <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply p-2 group-hover:scale-[1.03] transition-transform duration-200 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                            </div>
                            <span className="text-[14px] font-black text-[#333] tracking-widest uppercase">{product.name}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-[#5F5D59] font-medium italic">recommendations unavailable</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
