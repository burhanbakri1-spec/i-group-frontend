import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Language } from '../translations';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';
import { isPurchasableStock } from '../lib/mappers';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  product: Product;
  lang: Language;
  onSelect?: () => void;
}

const ProductCardBase: React.FC<ProductCardProps> = ({ product, lang, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist } = useShop();
  const inWishlist = isInWishlist(product.id);
  const isPurchasable = isPurchasableStock(product.stockStatus, product.stock);

  const hoverImage = product.images && product.images.length > 1 ? product.images[1] : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPurchasable) {
      addToCart(product);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const cardMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
      };

  return (
    <motion.div
      className="group relative w-full bg-white rounded-[var(--rb-radius-card)] overflow-hidden font-sans transition-colors duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...cardMotion}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        onClick={handleToggleWishlist}
        className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rb-primary-text)] focus-visible:ring-offset-2"
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          size={16}
          className={`transition-colors duration-300 ${inWishlist ? 'fill-[var(--rb-primary-text)] text-[var(--rb-primary-text)]' : 'text-[var(--rb-gray-84827E)]'}`}
        />
      </button>

      <div
        className="aspect-square bg-[var(--rb-bg-surface)] cursor-pointer relative overflow-hidden"
        onClick={onSelect}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: isHovered && hoverImage ? 0 : 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </motion.div>
        {hoverImage && (
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <ImageWithFallback
              src={hoverImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </motion.div>
        )}
        {product.badge && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-white text-[10px] font-bold uppercase tracking-wider rounded-full">
            {product.badge}
          </span>
        )}
        {!isPurchasable && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
            sold out
          </span>
        )}
      </div>

      <div className="p-5">
        <p className="text-xs text-[var(--rb-gray-84827E)] uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <h3 className="font-bold text-base text-[var(--rb-primary-text)] mb-1 line-clamp-1 lowercase">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {product.originalPrice && (
              <span className="text-sm text-[var(--rb-gray-ACA9A5)] line-through">{product.originalPrice}</span>
            )}
            <p className="text-lg font-bold text-[var(--rb-primary-text)]">{product.price}</p>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
            <span className="text-amber-500">&#9733;</span>
            <span>{product.rating}</span>
            <span>({product.reviews})</span>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!isPurchasable}
          className="w-full py-3 bg-[#67645E] text-white text-sm font-medium rounded-[var(--rb-radius-button)] hover:bg-[var(--rb-taupe-7B7872)] transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rb-primary-text)] focus-visible:ring-offset-2"
        >
          {isPurchasable ? (lang === 'en' ? 'Add to Bag' : 'أضف للسلة') : (lang === 'en' ? 'Sold Out' : 'نفد المخزون')}
        </button>
      </div>
    </motion.div>
  );
};

export const ProductCard = React.memo(ProductCardBase);
