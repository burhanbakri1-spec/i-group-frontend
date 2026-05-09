import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronDown, ThumbsUp, ThumbsDown, CheckCircle2, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';
import { ProductLineup } from './ProductLineup';
import { ProductShowcaseBlock } from './ProductShowcaseBlock';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { Product, ProductGalleryMedia, ProductReview, ProductVariant } from '../types';
import { getDefaultVariant, isPurchasableStock, mapBackendProductGalleryMedia, mapBackendProductToProduct, mapBackendReviewToProductReview, normalizeProductMediaUrl } from '../lib/mappers';
import { fetchProductBySlug, fetchProductReviews, fetchRelatedProducts } from '../lib/catalog-client';

interface ProductPageProps {
  product: Product;
  onBack?: () => void;
  lang: Language;
  onProductSelect?: (product: Product) => void;
}

const ReviewItem = ({ review, content }: { review: ProductReview; content: { verifiedLabel: string; hydrationQuestion: string; hydrationLow: string; hydrationHigh: string; helpfulQuestion: string } }) => (
  <div className="py-12 border-b border-black/5 grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
    {/* Left Sidebar */}
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-[#333]">{review.name}</span>
          {review.verified && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#333] opacity-60">
              {content.verifiedLabel} <CheckCircle2 size={12} className="fill-black text-white" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {[
          { label: "Age Range", value: review.age },
          { label: "Biggest Skin Concern", value: review.concern },
          { label: "What is your skin type?", value: review.skinType },
          { label: "What are your favorite features about this product?", value: review.favorites },
        ].map((item, idx) => (
          <div key={idx} className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#333]">{item.label}</p>
            <p className="text-[12px] text-[#333] opacity-60 leading-relaxed">{item.value}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Main Content */}
    <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill={i < review.rating ? "black" : "none"} className={i < review.rating ? "text-black" : "text-black/10"} />
            ))}
          </div>
          <span className="text-[11px] font-bold opacity-40">{review.time}</span>
        </div>

        <div className="space-y-3">
          <h4 className="text-[16px] font-bold text-[#333]">{review.title}</h4>
          <p className="text-[15px] text-[#333] leading-relaxed max-w-2xl">{review.content}</p>
        </div>

        <div className="space-y-4 max-w-sm pt-4">
          <p className="text-[11px] font-bold text-[#333]">{content.hydrationQuestion}</p>
          <div className="relative pt-2">
            <div className="h-0.5 w-full bg-black/10 rounded-full">
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#66635F] rounded-full shadow-sm border-2 border-white"
                style={{ left: `${review.hydration}%` }}
              />
            </div>
            <div className="flex justify-between pt-3 text-[10px] font-bold opacity-40 uppercase tracking-widest">
              <span>{content.hydrationLow}</span>
              <span>{content.hydrationHigh}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-6 pt-8">
        <div className="flex items-center gap-4 text-[11px] font-bold opacity-40">
          <span>{content.helpfulQuestion}</span>
          <button className="flex items-center gap-1.5 hover:opacity-100 transition-opacity">
            <ThumbsUp size={14} /> 0
          </button>
          <button className="flex items-center gap-1.5 hover:opacity-100 transition-opacity">
            <ThumbsDown size={14} /> 0
          </button>
        </div>
      </div>
    </div>
  </div>
);

const getProductImageGallery = (displayProduct: Product, selectedVariant: ProductVariant | null): ProductGalleryMedia[] => {
  if (displayProduct.backendProduct) {
    return mapBackendProductGalleryMedia(displayProduct.backendProduct, selectedVariant)
      .filter((media) => media.mediaType === 'IMAGE');
  }

  const variantImages: ProductGalleryMedia[] = [
    ...(selectedVariant?.image ? [{ url: selectedVariant.image, mediaType: 'IMAGE' as const, altText: selectedVariant.name, isPrimary: true }] : []),
    ...(displayProduct.variants ?? [])
      .filter((variant) => variant.id !== selectedVariant?.id && variant.image)
      .map((variant) => ({ url: variant.image ?? '', mediaType: 'IMAGE' as const, altText: variant.name })),
  ];

  const fallbackImages: ProductGalleryMedia[] = displayProduct.galleryMedia?.length
    ? displayProduct.galleryMedia
    : [
        ...(displayProduct.images ?? []).map((url) => ({ url, mediaType: 'IMAGE' as const })),
        { url: displayProduct.image, mediaType: 'IMAGE' as const },
      ];

  const seenUrls = new Set<string>();
  return [...variantImages, ...fallbackImages].flatMap((media) => {
    const normalizedUrl = normalizeProductMediaUrl(media.url);
    if (!normalizedUrl || seenUrls.has(normalizedUrl) || media.mediaType !== 'IMAGE') return [];
    seenUrls.add(normalizedUrl);
    return [{ ...media, url: normalizedUrl, mediaType: 'IMAGE' as const }];
  });
};

export const ProductPage: React.FC<ProductPageProps> = ({ product, lang, onProductSelect }) => {
  const { addToCart } = useShop();
  const {
    productDetailsFallback,
    productNoReviews,
    productAddToBag,
    productSoldOut,
    productAfterpayText,
    productSelectOption,
    productRatingLabel,
    productBuyNow,
    reviewVerifiedLabel,
    reviewFilterButton,
    reviewSortRecent,
    reviewShowMore,
    reviewShowLess,
    reviewHelpfulQuestion,
    reviewHydrationQuestion,
    reviewHydrationLow,
    reviewHydrationHigh,
  } = useSiteContent();
  const [displayProduct, setDisplayProduct] = useState<Product>(product);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants?.find((variant) => variant.id === product.variantId) ?? null);
  const [activeImageSelection, setActiveImageSelection] = useState({ index: 0, galleryKey: '', resetKey: '' });
  const [showBottomBar, setShowBottomBar] = useState(true);
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);
  const [remoteReviews, setRemoteReviews] = useState<ProductReview[] | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[] | null>(null);
  const lastScrollY = useRef(0);
  const isRtl = lang === 'ar';

  const displayImages = useMemo(
    () => getProductImageGallery(displayProduct, selectedVariant),
    [displayProduct, selectedVariant],
  );
  const displayImagesKey = displayImages.map((image) => image.url).join('|');
  const activeImageResetKey = `${product.id}|${product.slug ?? ''}|${selectedVariant?.id ?? ''}`;
  const safeActiveImageIndex = activeImageSelection.galleryKey === displayImagesKey
    && activeImageSelection.resetKey === activeImageResetKey
    && displayImages[activeImageSelection.index]?.url
    ? activeImageSelection.index
    : 0;
  const activeProduct = displayImages[safeActiveImageIndex];
  const purchasableProduct = displayProduct.backendProduct
    ? mapBackendProductToProduct(displayProduct.backendProduct, selectedVariant)
    : displayProduct;
  const isSelectedVariantPurchasable = isPurchasableStock(purchasableProduct.stockStatus, purchasableProduct.stock);

  useEffect(() => {
    const loadProductDetail = async () => {
      if (!product.slug || product.backendProduct) {
        setDisplayProduct(product);
        setSelectedVariant(product.variants?.find((variant) => variant.id === product.variantId) ?? null);
        setRemoteReviews(product.backendProduct?.reviews?.recent?.map(mapBackendReviewToProductReview) ?? []);
        return;
      }

      const productDetail = await fetchProductBySlug(product.slug);
      if (productDetail) {
        const defaultVariant = productDetail.backendProduct ? getDefaultVariant(productDetail.backendProduct) : productDetail.variants?.find((variant) => variant.id === productDetail.variantId) ?? null;
        setDisplayProduct(productDetail.backendProduct ? mapBackendProductToProduct(productDetail.backendProduct, defaultVariant) : productDetail);
        setSelectedVariant(defaultVariant);
        setRemoteReviews(productDetail.backendProduct?.reviews?.recent?.map(mapBackendReviewToProductReview) ?? []);
      } else {
        setDisplayProduct(product);
      }
    };

    loadProductDetail();
  }, [product]);

  useEffect(() => {
    const loadProductSupportData = async () => {
      if (!product.slug) {
        setRemoteReviews([]);
        return;
      }
      const [reviewData, relatedData] = await Promise.all([
        fetchProductReviews(product.slug, 10),
        fetchRelatedProducts(product.slug, 8),
      ]);
      setRemoteReviews(reviewData ?? []);
      setRelatedProducts(relatedData ?? []);
    };

    loadProductSupportData();
  }, [product.slug]);

  const displayReviews = remoteReviews ?? [];
  const hasReviews = displayReviews.length > 0;
  const averageRating = displayProduct.rating ?? '0';
  const reviewCount = displayProduct.reviews ?? '0';

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setShowBottomBar(true);
      } else {
        // Scrolling up
        setShowBottomBar(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`bg-white min-h-screen selection:bg-black selection:text-white ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* 1. HERO SECTION - REFINED FOR MOBILE */}
      <section className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6 overflow-hidden">
        
        {/* LEFT COLUMN: IMAGE SLIDER */}
        <div className="relative aspect-[4/5] md:aspect-[4/5] rounded-[24px] md:rounded-[32px] group z-0 overflow-hidden shadow-sm">
          <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.div
                key={safeActiveImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                {activeProduct?.url ? (
                  <ImageWithFallback
                    src={activeProduct.url}
                    alt={activeProduct.altText || displayProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#F2F1ED] flex items-center justify-center text-[11px] font-black uppercase tracking-[0.2em] text-black/30">
                    no image
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Floating Navigation Thumbnails - Mobile Optimized */}
          <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 md:gap-3 z-20">
             {displayImages.map((img, idx) => (
                <button 
                  key={img.url}
                  onClick={() => setActiveImageSelection({ index: idx, galleryKey: displayImagesKey, resetKey: activeImageResetKey })}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden border-2 transition-all scale-95 hover:scale-105 relative ${safeActiveImageIndex === idx ? 'border-white ring-2 ring-black/10 shadow-lg' : 'border-transparent opacity-40'}`}
                >
                    <ImageWithFallback src={img.url} alt={img.altText || `${displayProduct.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
           </div>

          {/* Mobile Bottom Indicator */}
          {displayImages.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
              {displayImages.map((image, idx) => (
              <div key={image.url} className={`h-1 rounded-full transition-all duration-300 ${safeActiveImageIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/30'}`} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PRODUCT INFO - REFINED MOBILE DENSITY */}
        <div className="bg-[#F2F1ED] rounded-[24px] md:rounded-[32px] p-6 md:p-14 flex flex-col space-y-6 md:space-y-8 md:h-full md:overflow-y-auto no-scrollbar relative z-10 shadow-[-20px_0_40px_rgba(0,0,0,0.01)]">
          
          <div className="space-y-3 md:space-y-4">
               <h1 className="text-[42px] md:text-[72px] font-black tracking-[-0.04em] leading-[0.85] lowercase">
                {displayProduct.name}
              </h1>
             <div className="flex items-center gap-4 md:gap-6">
                <p className="text-[9px] md:text-[12px] font-black uppercase tracking-[0.2em] opacity-60">{displayProduct.brand ?? displayProduct.category ?? 'icare essentials'}</p>
               <div className="flex items-center gap-1">
                  <div className="flex text-black">
                    {[...Array(5)].map((_, i) => <Star key={i} size={8} className="md:size-[10px]" fill="currentColor" />)}
                  </div>
                   <span className="text-[10px] md:text-[11px] font-bold opacity-40">({displayProduct.reviews ?? '0'})</span>
               </div>
             </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <p className="text-[14px] md:text-[15px] leading-relaxed text-[#444] font-medium opacity-80">
              {displayProduct.description ?? productDetailsFallback}
            </p>
            
            <div className="space-y-3 text-[13px] md:text-[14px] border-t border-black/5 pt-6">
                <p className="text-[#444] leading-relaxed"><span className="font-black lowercase">category:</span> {displayProduct.category ?? 'icare'} {displayProduct.stockStatus ? `— ${displayProduct.stockStatus.replaceAll('_', ' ')}` : ''}</p>
                <div className="flex justify-between items-center py-2">
                  <p className="font-black lowercase">{displayProduct.originalPrice ? <>original value: <span className="opacity-40 line-through ml-1">{displayProduct.originalPrice}</span></> : displayProduct.badge ?? 'selected care'}</p>
                  <p className="font-black text-[15px] md:text-[18px]">{purchasableProduct.price}</p>
                </div>
            </div>
          </div>

          <div className="pt-4 space-y-6 md:space-y-8">
              {displayProduct.variants && displayProduct.variants.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-[12px] md:text-[13px]">
                  <span className="opacity-40 lowercase">{productSelectOption}</span>
                  {displayProduct.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={!isPurchasableStock(variant.stockStatus, variant.stockQuantity)}
                      className={`font-black underline underline-offset-4 flex items-center gap-1 lowercase ${selectedVariant?.id === variant.id ? 'text-black' : 'opacity-50'}`}
                    >
                      {variant.name}
                      {variant.isDefault && <ChevronDown size={14} />}
                    </button>
                  ))}
                </div>
              )}

             <div className="space-y-4">
               <motion.button 
                 whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                   onClick={() => isSelectedVariantPurchasable && addToCart(purchasableProduct)}
                  disabled={!isSelectedVariantPurchasable}
                  className="w-full bg-black text-white py-5 rounded-full text-[12px] md:text-[13px] font-black uppercase tracking-[0.2em] hover:bg-black/90 transition-all duration-300 shadow-xl shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={16} />
                    {isSelectedVariantPurchasable
                      ? (lang === 'en' ? `${productAddToBag} — ${purchasableProduct.price}` : `أضف للسلة — ${purchasableProduct.price}`)
                      : (lang === 'en' ? productSoldOut : 'نفد المخزون')}
                </motion.button>
               <div className="flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-bold opacity-30">
                  {lang === 'en' ? productAfterpayText : 'أو 4 دفعات بدون فوائد مع'} <span className="text-black font-black bg-[#ACEBFF] px-1.5 py-0.5 rounded italic">Afterpay</span>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION */}
      <ProductShowcaseBlock slug={product.slug} lang={lang} />

      {/* 2. REVIEWS SECTION */}
      <section className="px-4 lg:px-6 pb-32">
        <div className="max-w-[1600px] mx-auto bg-[#FAF9F6] rounded-[24px] p-8 lg:p-16">
          
          <div className="border-b border-black/10 pb-8 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-[44px] font-black tracking-tighter">{averageRating}</span>
                  <div className="flex text-black mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[12px] font-black uppercase tracking-widest text-[#333]">{productRatingLabel}</p>
                  <p className="text-[12px] text-[#333] opacity-40">Based on {reviewCount} reviews</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-black/10 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                  {reviewFilterButton}
                </button>
                <div className="relative group">
                  <button className="flex items-center gap-6 px-6 py-2.5 rounded-full border border-black/10 text-[10px] font-black uppercase tracking-widest hover:border-black transition-all">
                    {reviewSortRecent} <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`relative transition-all duration-700 ease-in-out overflow-hidden ${!isReviewsExpanded ? 'max-h-[500px] md:max-h-none' : 'max-h-[5000px]'}`}>
            {hasReviews ? (
              <div className="divide-y divide-black/5">
                {displayReviews.map((review, idx) => (
                  <ReviewItem key={review.id ?? idx} review={review} content={{ verifiedLabel: reviewVerifiedLabel, hydrationQuestion: reviewHydrationQuestion, hydrationLow: reviewHydrationLow, hydrationHigh: reviewHydrationHigh, helpfulQuestion: reviewHelpfulQuestion }} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-[14px] font-bold uppercase tracking-[0.2em] text-[#333]/40">
                {productNoReviews}
              </div>
            )}
            
            {/* Mobile Gradient Overlay */}
            {hasReviews && !isReviewsExpanded && (
              <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/80 to-transparent z-10 md:hidden pointer-events-none" />
            )}
          </div>

          {hasReviews && (
            <div className="flex justify-center pt-8 md:pt-12 relative z-20">
            <button 
              onClick={() => setIsReviewsExpanded(!isReviewsExpanded)}
              className="px-12 py-3 rounded-full border border-black/10 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-500 bg-white"
            >
              {isReviewsExpanded ? reviewShowLess : reviewShowMore}
            </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. LINEUP SECTION */}
      <ProductLineup products={relatedProducts} useShortcutFallback={false} onProductSelect={onProductSelect} />

      {/* FLOATING STICKY BAR */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ 
            y: showBottomBar ? 0 : 120, 
            opacity: showBottomBar ? 1 : 0 
          }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="fixed bottom-0 left-0 w-full bg-[#EEEEEE] px-8 py-3 flex items-center justify-between z-50 border-t border-black/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-white rounded-md flex items-center justify-center p-1.5 shadow-sm">
               <ImageWithFallback src={displayProduct.image} alt={displayProduct.name} className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#333]">{displayProduct.name}</span>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => isSelectedVariantPurchasable && addToCart(purchasableProduct)}
            disabled={!isSelectedVariantPurchasable}
            className="bg-[#66635F] text-white px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={14} />
            {isSelectedVariantPurchasable
              ? (lang === 'en' ? `${productBuyNow} - ${purchasableProduct.price}` : `اشتر الآن - ${purchasableProduct.price}`)
              : (lang === 'en' ? productSoldOut.toUpperCase() : 'نفد المخزون')}
          </motion.button>
        </motion.div>
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};
