import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  productCount: number;
}

export function FilterSidebar({ selectedCategory, onCategoryChange, selectedSort, onSortChange, productCount }: FilterSidebarProps) {
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [sortOpen, setSortOpen] = useState(true);

  const categories = [
    { id: 'all', name: 'Shop All' },
    { id: 'skin', name: 'Skin' },
    { id: 'lip', name: 'Lip' },
    { id: 'kits', name: 'Kits' },
  ];

  const sortOptions = [
    { id: 'featured', name: 'Featured' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'name-az', name: 'Alphabetically, A-Z' },
    { id: 'name-za', name: 'Alphabetically, Z-A' },
  ];

  return (
    <div className="w-full space-y-12">
      {/* Category Filter */}
      <div>
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="flex items-center justify-between w-full mb-8 group"
        >
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Shop By</h3>
          <div className="h-[1px] flex-1 bg-[#e8e3dc] mx-4 group-hover:bg-black transition-colors" />
          {categoryOpen ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
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
                        ? 'text-black translate-x-1' 
                        : 'text-gray-400 hover:text-black'
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
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Sort By</h3>
          <div className="h-[1px] flex-1 bg-[#e8e3dc] mx-4 group-hover:bg-black transition-colors" />
          {sortOpen ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
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
                        ? 'text-black translate-x-1' 
                        : 'text-gray-400 hover:text-black'
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
      <div className="pt-12 border-t border-[#e8e3dc]">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
          Showing {productCount} results
        </p>
      </div>
    </div>
  );
}
