import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ScrollReveal, StaggerContainer } from './ui/ScrollReveal';
import { Heart, ShoppingBag, X, Share2 } from 'lucide-react';
import { Language, translations } from '../translations';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { Product } from '../types';
import { fetchProductShortcut } from '../lib/catalog-client';
import { ProductCard } from './ProductCard';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface WishlistPageProps {
  lang: Language;
  onProductSelect: (product: Product) => void;
  onNavigate?: (page: string) => void;
}

const CONTROL_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const SURFACE_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F1F0ED]';
const SHORT_TWEEN = { duration: 0.18, ease: 'easeOut' as const };

export const WishlistPage: React.FC<WishlistPageProps> = ({ lang, onProductSelect, onNavigate }) => {
  const { wishlistItems, removeFromWishlist, addToCart } = useShop();
  const { wishlistEmpty, wishlistEmptySubtext, wishlistRecommendationsTitle } = useSiteContent(lang);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const shouldReduceMotion = useReducedMotion();

  const t = translations[lang];
  useEffect(() => {
    const loadRecommendations = async () => {
      const bestsellers = await fetchProductShortcut('bestsellers', lang, 4);
      if (bestsellers && bestsellers.length > 0) setRecommendations(bestsellers);
    };
    loadRecommendations();
  }, [lang]);

  const handleAddToBag = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="min-h-screen bg-[#F1F0ED] py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
            <Heart size={28} className="text-[#67645E] md:w-8 md:h-8" fill="#67645E" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light leading-none tracking-tight">{t.wishlist}</h1>
          </div>
          <p className="text-sm md:text-base text-[#67645E] mb-4 px-4">{t.cartDrawer.saveForLater}</p>
          {wishlistItems.length > 0 && (
            <div className="flex items-center justify-center gap-4 md:gap-6">
              <p className="text-xs md:text-sm text-[#67645E]">{wishlistItems.length} {t.cartDrawer.items}</p>
              <button className={`inline-flex min-h-9 items-center gap-2 whitespace-nowrap text-xs md:text-sm text-[#67645E] hover:text-black transition-colors ${SURFACE_FOCUS_CLASS}`}>
                <Share2 size={14} className="md:w-4 md:h-4" />
                {t.cartDrawer.share}
              </button>
            </div>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={SHORT_TWEEN}
            className="text-center py-16 md:py-20"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <Heart size={48} className="text-[#DDD] md:w-16 md:h-16" />
            </div>
            <h2 className="text-xl md:text-2xl font-light mb-2">{wishlistEmpty}</h2>
            <p className="text-sm md:text-base text-[#84827E] mb-8">{wishlistEmptySubtext}</p>
            <button onClick={() => onNavigate?.('shop')} className={`inline-flex min-h-12 items-center justify-center whitespace-nowrap px-6 md:px-8 py-3 bg-[#67645E] text-white text-sm md:text-base rounded-full hover:bg-[#7B7872] transition-colors ${CONTROL_FOCUS_CLASS}`}>
              {t.shopNow}
            </button>
          </motion.div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((product, index) => (
              <motion.div
                key={product.id}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ ...SHORT_TWEEN, delay: shouldReduceMotion ? 0 : Math.min(index * 0.04, 0.16) }}
                className="group relative bg-white rounded-[12px] overflow-hidden border border-[#DDDDDD]"
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className={`absolute top-4 right-4 z-10 w-10 h-10 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center opacity-100 transition-opacity border border-[#DDDDDD] hover:bg-[#67645E] hover:text-white ${CONTROL_FOCUS_CLASS}`}
                  aria-label={`${t.cartDrawer.remove} ${product.name}`}
                >
                  <X size={16} />
                </button>

                {/* Product Image */}
                <div
                  className="aspect-square bg-[#F5F5F5] cursor-pointer relative overflow-hidden"
                  onClick={() => onProductSelect(product)}
                >
                  <ImageWithFallback
                    src={product.primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>

                {/* Product Info */}
                <div className="p-6">
                  {product.label && (
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--rb-primary-text)] mb-1">
                      {product.label}
                    </p>
                  )}
                  <p className="text-xs text-[#67645E] uppercase tracking-wider mb-1">{product.category}</p>
                  <h3 className="font-medium mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {product.originalPrice && (
                        <span className="text-sm text-[#84827E]/50 line-through">{product.originalPrice}</span>
                      )}
                      <p className="text-lg font-medium">{product.price}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#84827E]">
                      <span>★</span>
                      <span>{product.rating}</span>
                      <span>({product.reviews})</span>
                    </div>
                  </div>

                  {/* Add to Bag Button */}
                  <button 
                    onClick={(e) => handleAddToBag(product, e)}
                    className={`inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#67645E] px-6 py-3 text-sm uppercase tracking-wider text-white hover:bg-[#7B7872] transition-colors ${CONTROL_FOCUS_CLASS}`}
                  >
                    <ShoppingBag size={16} />
                    {t.cartDrawer.addToBag}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {wishlistItems.length > 0 && recommendations.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-light text-center mb-12">{wishlistRecommendationsTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {recommendations.map((product) => (
                <ProductCard key={product.id} product={product} lang={lang} onSelect={() => onProductSelect(product)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
