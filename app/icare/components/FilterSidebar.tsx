import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../translations';

interface FilterSidebarProps {
  lang: Language;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  productCount: number;
}

export function FilterSidebar({ lang, selectedCategory, onCategoryChange, selectedSort, onSortChange, productCount }: FilterSidebarProps) {
  const t = translations[lang];
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [sortOpen, setSortOpen] = useState(true);

  const categories = [
    { id: 'all', name: t.ui.filterSidebar.shopAll },
    { id: 'skin', name: t.ui.filterSidebar.skin },
    { id: 'lip', name: t.ui.filterSidebar.lip },
    { id: 'kits', name: t.ui.filterSidebar.kits },
  ];

  const sortOptions = [
    { id: 'featured', name: t.ui.filterSidebar.featured },
    { id: 'price-low', name: t.ui.filterSidebar.priceLowHigh },
    { id: 'price-high', name: t.ui.filterSidebar.priceHighLow },
    { id: 'name-az', name: t.ui.filterSidebar.alphaAZ },
    { id: 'name-za', name: t.ui.filterSidebar.alphaZA },
  ];

  return (
    <div className="w-full space-y-12 bg-[#F1F0ED] p-6 rounded-[12px]">
      {/* Category Filter */}
      <div>
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="flex items-center justify-between w-full mb-8 group"
        >
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#84827E]">{t.ui.filterSidebar.shopBy}</h3>
          <div className="h-[1px] flex-1 bg-[#DDDDDD] mx-4 group-hover:bg-[#67645E] transition-colors" />
          {categoryOpen ? <ChevronUp className="w-3 h-3 text-[#84827E]" /> : <ChevronDown className="w-3 h-3 text-[#84827E]" />}
        </button>
        <AnimatePresence initial={false}>
          {categoryOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-5">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`text-[13px] text-left tracking-wide transition-all uppercase font-medium ${
                      selectedCategory === category.id 
                        ? 'text-[#67645E] translate-x-1' 
                        : 'text-[#84827E] hover:text-[#67645E]'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sort Filter */}
      <div>
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="flex items-center justify-between w-full mb-8 group"
        >
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#84827E]">{t.ui.filterSidebar.sortBy}</h3>
          <div className="h-[1px] flex-1 bg-[#DDDDDD] mx-4 group-hover:bg-[#67645E] transition-colors" />
          {sortOpen ? <ChevronUp className="w-3 h-3 text-[#84827E]" /> : <ChevronDown className="w-3 h-3 text-[#84827E]" />}
        </button>
        <AnimatePresence initial={false}>
          {sortOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-5">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onSortChange(option.id)}
                    className={`text-[13px] text-left tracking-wide transition-all uppercase font-medium ${
                      selectedSort === option.id 
                        ? 'text-[#67645E] translate-x-1' 
                        : 'text-[#84827E] hover:text-[#67645E]'
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Count Display for Desktop */}
      <div className="pt-12 border-t border-[#DDDDDD]">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#84827E]">
          {t.ui.filterSidebar.showingResults.replace('{count}', String(productCount))}
        </p>
      </div>
    </div>
  );
}
