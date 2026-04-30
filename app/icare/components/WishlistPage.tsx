import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, X, Share2 } from 'lucide-react';
import { Language } from '../translations';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';
import { fetchProductShortcut } from '../lib/catalog-client';
import { ProductCard } from './ProductCard';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface WishlistPageProps {
  lang: Language;
  onProductSelect: (product: Product) => void;
  onNavigate?: (page: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ lang, onProductSelect, onNavigate }) => {
  const { wishlistItems, removeFromWishlist, addToCart } = useShop();
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  const t = {
    en: {
      wishlist: 'MY WISHLIST',
      items: 'items',
      empty: 'Your wishlist is empty',
      emptyDesc: 'Start adding products you love',
      shopNow: 'SHOP NOW',
      remove: 'Remove',
      addToBag: 'ADD TO BAG',
      share: 'SHARE WISHLIST',
      saveForLater: 'Save your favorites and share them with friends&#39;'
    },
    ar: {
      wishlist: 'قائمة الأمنيات',
      items: 'منتجات',
      empty: 'قائمة الأمنيات فارغة',
      emptyDesc: 'ابدأ بإضافة المنتجات المفضلة',
      shopNow: 'تسوق الآن',
      remove: 'حذف',
      addToBag: 'أضف للسلة',
      share: 'مشاركة القائمة',
      saveForLater: 'احفظ المنتجات المفضلة وشاركها مع الأصدقاء'
    }
  };

  const text = t[lang];
  useEffect(() => {
    const loadRecommendations = async () => {
      const bestsellers = await fetchProductShortcut('bestsellers', 4);
      if (bestsellers && bestsellers.length > 0) setRecommendations(bestsellers);
    };
    loadRecommendations();
  }, []);

  const handleAddToBag = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
            <Heart size={28} className="text-[#FF6B6B] md:w-8 md:h-8" fill="#FF6B6B" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight">{text.wishlist}</h1>
          </div>
          <p className="text-sm md:text-base text-[#666] mb-4 px-4">{text.saveForLater}</p>
          {wishlistItems.length > 0 && (
            <div className="flex items-center justify-center gap-4 md:gap-6">
              <p className="text-xs md:text-sm text-[#888]">{wishlistItems.length} {text.items}</p>
              <button className="flex items-center gap-2 text-xs md:text-sm hover:text-black transition-colors">
                <Share2 size={14} className="md:w-4 md:h-4" />
                {text.share}
              </button>
            </div>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 md:py-20"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <Heart size={48} className="text-[#DDD] md:w-16 md:h-16" />
            </div>
            <h2 className="text-xl md:text-2xl font-light mb-2">{text.empty}</h2>
            <p className="text-sm md:text-base text-[#888] mb-8">{text.emptyDesc}</p>
            <button onClick={() => onNavigate?.('shop')} className="px-6 md:px-8 py-3 bg-black text-white text-sm md:text-base rounded-full hover:bg-[#333] transition-colors">
              {text.shopNow}
            </button>
          </motion.div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-[#FF6B6B] hover:text-white"
                >
                  <X size={16} />
                </button>

                {/* Product Image */}
                <div
                  className="aspect-square bg-[#F5F5F5] cursor-pointer relative overflow-hidden"
                  onClick={() => onProductSelect(product)}
                >
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.badge && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-white text-xs uppercase tracking-wider">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <p className="text-xs text-[#888] uppercase tracking-wider mb-1">{product.title}</p>
                  <h3 className="font-medium mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-lg font-medium">{product.price}</p>
                    <div className="flex items-center gap-1 text-xs text-[#888]">
                      <span>★</span>
                      <span>{product.rating}</span>
                      <span>({product.reviews})</span>
                    </div>
                  </div>

                  {/* Add to Bag Button */}
                  <button 
                    onClick={(e) => handleAddToBag(product, e)}
                    className="w-full py-3 bg-black text-white text-sm uppercase tracking-wider rounded-full hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={16} />
                    {text.addToBag}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {wishlistItems.length > 0 && recommendations.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-light text-center mb-12">You Might Also Like</h2>
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
