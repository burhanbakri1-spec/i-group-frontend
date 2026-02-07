import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const SearchDrawer: React.FC<SearchDrawerProps> = ({ isOpen, onClose, lang }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Define our dataset based on the site's groups and products
  const collections = [
    'shop all',
    'face care',
    'hair care',
    'body care',
    'makeup',
    'nails'
  ];

  const products = [
    { id: '1', name: 'BARRIER BUTTER', category: 'face care', image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=200' },
    { id: '2', name: 'THE WINTER KIT', category: 'shop all', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200' },
    { id: '3', name: 'PEPTIDE LIP TINT', category: 'makeup', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=200' },
    { id: '4', name: 'POCKET CLEANSER', category: 'face care', image: 'https://images.unsplash.com/photo-1594125355977-903e303f4435?q=80&w=200' },
    { id: '5', name: 'PEPTIDE GLAZE', category: 'face care', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=200' }
  ];

  const brands = ['icare', 'rhode aesthetics', 'minimal beauty'];

  // Filtering Logic
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    
    return {
      collections: collections.filter(c => c.toLowerCase().includes(query)),
      products: products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)),
      brands: brands.filter(b => b.toLowerCase().includes(query))
    };
  }, [searchQuery]);

  const hasResults = filteredResults && (
    filteredResults.collections.length > 0 || 
    filteredResults.products.length > 0 || 
    filteredResults.brands.length > 0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[250]"
          />
          
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
            className="fixed top-0 right-0 h-full w-full max-w-[500px] bg-[#F3F2EE] z-[300] shadow-2xl flex flex-col font-sans overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 flex items-center justify-center border-b border-black/5">
              <h2 className="text-[15px] font-black text-[#333] tracking-normal lowercase">search</h2>
              <button 
                onClick={onClose} 
                className="absolute right-6 p-1 text-[#706E6A] hover:text-black transition-colors"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8 no-scrollbar">
              {/* Search Input */}
              <div className="mb-10">
                <div className="relative bg-white rounded-[8px] border border-black/5 overflow-hidden shadow-sm">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type here"
                    className="w-full px-5 py-4 text-[16px] text-[#333] placeholder:text-[#9A9A9A] bg-transparent outline-none border-none font-medium"
                    autoFocus
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#9A9A9A] hover:text-black"
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
                          <h3 className="text-[12px] font-black text-[#9A9A9A] mb-4 uppercase tracking-[0.1em]">Collections</h3>
                          <div className="space-y-3">
                            {filteredResults.collections.map((item) => (
                              <button key={`collection-${item}`} className="flex items-center justify-between w-full group text-left">
                                <span className="text-[16px] font-medium text-[#333] lowercase">{item}</span>
                                <ArrowRight size={16} className="text-[#9A9A9A] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Products */}
                      {filteredResults.products.length > 0 && (
                        <div>
                          <h3 className="text-[12px] font-black text-[#9A9A9A] mb-6 uppercase tracking-[0.1em]">Products</h3>
                          <div className="space-y-6">
                            {filteredResults.products.map((product) => (
                              <div key={product.id} className="flex items-center gap-5 group cursor-pointer">
                                <div className="w-14 h-16 bg-white/40 rounded-[8px] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                  <ImageWithFallback 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-full h-full object-contain mix-blend-multiply p-1 group-hover:scale-110 transition-transform duration-500"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[14px] font-black text-[#333] tracking-widest uppercase">{product.name}</span>
                                  <span className="text-[12px] text-[#706E6A] lowercase">{product.category}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Brands */}
                      {filteredResults.brands.length > 0 && (
                        <div>
                          <h3 className="text-[12px] font-black text-[#9A9A9A] mb-4 uppercase tracking-[0.1em]">Brands</h3>
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
                      <p className="text-[16px] text-[#706E6A] font-medium italic">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Static Default Content (Old View) */
                <div className="space-y-12">
                  <div>
                    <h3 className="text-[14px] font-black text-[#333] mb-5 lowercase">collections:</h3>
                    <div className="flex flex-col gap-3">
                      {collections.map((item) => (
                        <button key={`default-collection-${item}`} className="text-left text-[15px] text-[#706E6A] font-medium hover:text-black transition-colors lowercase">{item}</button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-black/10 pt-8">
                    <h3 className="text-[14px] font-black text-[#333] mb-6 lowercase">recommended:</h3>
                    <div className="space-y-8">
                      {products.slice(0, 2).map((product) => (
                        <div key={product.id} className="flex items-center gap-6 group cursor-pointer">
                          <div className="w-16 h-20 bg-white/40 rounded-[8px] overflow-hidden flex items-center justify-center">
                            <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply p-2 group-hover:scale-105 transition-transform" />
                          </div>
                          <span className="text-[14px] font-black text-[#333] tracking-widest uppercase">{product.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </AnimatePresence>
  );
};
