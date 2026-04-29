import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const products = [
  { id: 1, title: 'BARRIER BUTTER', price: '$28', subtitle: 'The intensive moisture balm', image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400' },
  { id: 2, title: 'PEPTIDE GLAZE', price: '$32', subtitle: 'Dewy hydration fluid', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=400' },
  { id: 3, title: 'DAILY CLEANSING', price: '$24', subtitle: 'Creamy milk wash', image: 'https://images.unsplash.com/photo-1559539751-030138c2955e?q=80&w=400' },
  { id: 4, title: 'POCKET CLEANSER', price: '$12', subtitle: 'Travel size hydration', image: 'https://images.unsplash.com/photo-1594125355977-903e303f4435?q=80&w=400' },
  { id: 5, title: 'REPAIR SERUM', price: '$40', subtitle: 'Deep barrier support', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400' },
  { id: 6, title: 'LIP TINT', price: '$16', subtitle: 'Sheer peptide gloss', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=400' }
];

export const Shop: React.FC = () => {
  return (
    <div className="max-w-[1440px] mx-auto px-10 py-12">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-[40px] font-black tracking-tight text-[#5C5A56]">SHOP ALL</h2>
        <div className="flex gap-6">
          <button className="text-[12px] font-bold uppercase tracking-widest text-[#706E6A]">FILTER</button>
          <button className="text-[12px] font-bold uppercase tracking-widest text-[#706E6A]">SORT</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="group cursor-pointer">
            <div className="bg-[#F2F1ED] rounded-[32px] aspect-square flex items-center justify-center p-12 overflow-hidden mb-6">
              <ImageWithFallback 
                src={product.image} 
                alt={product.title} 
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[16px] font-black uppercase tracking-tight text-[#444]">{product.title}</h3>
                <p className="text-[14px] text-[#706E6A] font-medium">{product.subtitle}</p>
              </div>
              <span className="text-[16px] font-bold text-[#444]">{product.price}</span>
            </div>
            <button className="mt-4 text-[11px] font-black uppercase tracking-widest border-b border-black pb-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              ADD TO CART
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
