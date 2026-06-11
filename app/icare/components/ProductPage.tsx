import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Star, ChevronDown, ThumbsUp, ThumbsDown, CheckCircle2, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language, translations } from '../translations';
import { ProductLineup } from './ProductLineup';
import { ShowcaseBlock } from './showcase/ShowcaseBlock';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { Product, ProductGalleryMedia, ProductReview, ProductVariant, CreateReviewInput } from '../types';
import { getDefaultVariant, isPurchasableStock, mapBackendProductGalleryMedia, mapBackendProductToProduct, mapBackendReviewToProductReview, normalizeProductMediaUrl } from '../lib/mappers';
import { fetchProductBySlug, fetchProductReviews, fetchRelatedProducts, submitProductReview, voteReviewHelpful } from '../lib/catalog-client';
import { cacheMiddleware } from '../lib/cache-middleware';
import { WriteReviewDialog } from './WriteReviewDialog';
import { useIcareShell } from './IcareShell';
import { ScrollReveal, StaggerContainer } from './ui/ScrollReveal';

interface ProductPageProps {
  product: Product;
  onBack?: () => void;
  lang: Language;
  onProductSelect?: (product: Product) => void;
}

const CONTROL_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

interface ReviewItemProps {
  review: ProductReview;
  content: { verifiedLabel: string; hydrationQuestion: string; hydrationLow: string; hydrationHigh: string; helpfulQuestion: string; ageRange: string; skinConcern: string; skinTypeQuestion: string; favoriteFeatures: string };
  helpfulCount?: number;
  onHelpfulVote?: (reviewId: number) => void;
}

const ReviewItem = ({ review, content, helpfulCount = 0, onHelpfulVote }: ReviewItemProps) => (
  <div className="py-12 border-b border-[#DDDDDD] grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
    {/* Left Sidebar */}
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-[#67645E]">{review.name}</span>
          {review.verified && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#84827E]">
              {content.verifiedLabel} <CheckCircle2 size={12} className="fill-black text-white" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {[
          { label: content.ageRange, value: review.age },
          { label: content.skinConcern, value: review.concern },
          { label: content.skinTypeQuestion, value: review.skinType },
          { label: content.favoriteFeatures, value: review.favorites },
        ].map((item, idx) => (
          <div key={idx} className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#67645E]">{item.label}</p>
            <p className="text-[12px] text-[#84827E] leading-relaxed">{item.value}</p>
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
          <span className="text-[11px] font-bold text-black/55">{review.time}</span>
        </div>

        <div className="space-y-3">
          <h4 className="text-[16px] font-bold text-[#67645E]">{review.title}</h4>
          <p className="text-[15px] text-[#67645E] leading-relaxed max-w-2xl">{review.content}</p>
        </div>

        <div className="space-y-4 max-w-sm pt-4">
          <p className="text-[11px] font-bold text-[#67645E]">{content.hydrationQuestion}</p>
          <div className="relative pt-2">
            <div className="h-0.5 w-full bg-black/10 rounded-full">
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#67645E] rounded-full border-2 border-white"
                style={{ left: `${review.hydration}%` }}
              />
            </div>
            <div className="flex justify-between pt-3 text-[10px] font-bold text-black/55 uppercase tracking-widest">
              <span>{content.hydrationLow}</span>
              <span>{content.hydrationHigh}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-6 pt-8">
        <div className="flex items-center gap-4 text-[11px] font-bold text-black/55">
          <span>{content.helpfulQuestion}</span>
          <button onClick={() => review.id && onHelpfulVote?.(review.id)} className={`flex items-center gap-1.5 rounded-md hover:text-black transition-colors ${CONTROL_FOCUS_CLASS}`}>
            <ThumbsUp size={14} /> {helpfulCount}
          </button>
          <button className={`flex items-center gap-1.5 rounded-md hover:text-black transition-colors ${CONTROL_FOCUS_CLASS}`}>
            <ThumbsDown size={14} /> 0
          </button>
        </div>
      </div>
    </div>
  </div>
);

const getProductImageGallery = (
  displayProduct: Product,
  selectedVariant: ProductVariant | null,
  selectedColorId?: number | null,
): ProductGalleryMedia[] => {
  // Color-aware gallery: if a color is selected and the current variant has per-color images,
  // surface the variant-color image first, then fall back to other images.
  let colorVariantImage: string | null = null;
  if (selectedColorId && selectedVariant?.variantColors) {
    const vc = selectedVariant.variantColors.find((v) => v.colorId === selectedColorId);
    colorVariantImage = vc?.image || null;
  }
  // Also try the product-level color image as a last-resort fallback
  // (legacy path: admin UI no longer writes `ProductColor.image` —
  // canonical per-color images now live on `variantColors[].image`,
  // i.e. the per-(variant×color) join row).
  let colorImage: string | null = colorVariantImage;
  if (!colorImage && selectedColorId && displayProduct.colors) {
    const pc = displayProduct.colors.find((c) => c.id === selectedColorId);
    colorImage = pc?.image || null;
  }

  if (displayProduct.backendProduct) {
    const baseMedia = mapBackendProductGalleryMedia(displayProduct.backendProduct, selectedVariant)
      .filter((media) => media.mediaType === 'IMAGE');
    if (colorImage) {
      // Reorder: put color image first if not already present
      const hasColorImage = baseMedia.some((m) => normalizeProductMediaUrl(m.url) === normalizeProductMediaUrl(colorImage));
      if (!hasColorImage) {
        return [{ url: colorImage, mediaType: 'IMAGE' as const, altText: 'color' }, ...baseMedia];
      }
    }
    return baseMedia;
  }

  const variantImages: ProductGalleryMedia[] = [
    ...(colorImage ? [{ url: colorImage, mediaType: 'IMAGE' as const, altText: 'color' }] : []),
    ...(selectedVariant?.image ? [{ url: selectedVariant.image, mediaType: 'IMAGE' as const, altText: selectedVariant.name }] : []),
    ...(displayProduct.variants ?? [])
      .filter((variant) => variant.id !== selectedVariant?.id && variant.image)
      .map((variant) => ({ url: variant.image ?? '', mediaType: 'IMAGE' as const, altText: variant.name })),
  ];

  const fallbackImages: ProductGalleryMedia[] = displayProduct.galleryMedia?.length
    ? displayProduct.galleryMedia
    : [
        ...(displayProduct.images ?? []).map((url) => ({ url, mediaType: 'IMAGE' as const })),
        { url: displayProduct.primaryImage, mediaType: 'IMAGE' as const },
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
  const t = translations[lang];
  const { addToCart, isAuthenticated, accessToken } = useShop();
  const { navigateToPage } = useIcareShell();
  const shouldReduceMotion = useReducedMotion();
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
  } = useSiteContent(lang);
  const [displayProduct, setDisplayProduct] = useState<Product>(product);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants?.find((variant) => variant.id === product.variantId) ?? null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(() => {
    // Auto-select the first available color for the current variant
    const firstColor = product.colors?.find((c) => c.isActive !== false);
    return firstColor?.id ?? null;
  });
  const [activeImageSelection, setActiveImageSelection] = useState({ index: 0, galleryKey: '', resetKey: '' });
  const [showBottomBar, setShowBottomBar] = useState(false);
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [remoteReviews, setRemoteReviews] = useState<ProductReview[] | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[] | null>(null);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [reviewSortBy, setReviewSortBy] = useState<string>('recent');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | undefined>(undefined);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<number, number>>({});
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [additionalReviews, setAdditionalReviews] = useState<ProductReview[]>([]);
  const lastScrollY = useRef(0);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'ar';

  const displayImages = useMemo(
    () => getProductImageGallery(displayProduct, selectedVariant, selectedColorId),
    [displayProduct, selectedVariant, selectedColorId],
  );
  const displayImagesKey = displayImages.map((image) => image.url).join('|');
  const activeImageResetKey = `${product.id}|${product.slug ?? ''}|${selectedVariant?.id ?? ''}`;
  const safeActiveImageIndex = activeImageSelection.galleryKey === displayImagesKey
    && activeImageSelection.resetKey === activeImageResetKey
    && displayImages[activeImageSelection.index]?.url
    ? activeImageSelection.index
    : 0;
  const activeProduct = displayImages[safeActiveImageIndex];
  const purchasableProduct = useMemo(
    () => displayProduct.backendProduct
      ? mapBackendProductToProduct(displayProduct.backendProduct, selectedVariant)
      : displayProduct,
    [displayProduct, selectedVariant],
  );
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
        fetchProductReviews(product.slug, 10, { page: 1, sortBy: reviewSortBy, rating: reviewRatingFilter }),
        fetchRelatedProducts(product.slug, 8),
      ]);
      setRemoteReviews(reviewData ?? []);
      setRelatedProducts(relatedData ?? []);
      setReviewPage(1);
      setAdditionalReviews([]);
      setHasMoreReviews((reviewData ?? []).length >= 10);
    };

    loadProductSupportData();
  }, [product.slug, reviewSortBy, reviewRatingFilter]);

  const displayReviews = [...(remoteReviews ?? []), ...additionalReviews];
  const hasReviews = displayReviews.length > 0;
  const averageRating = displayProduct.rating ?? '0';
  const reviewCount = displayProduct.reviews ?? '0';
  const ratingDistribution = displayProduct.backendProduct?.reviews?.summary?.distribution ?? {};

  const loadMoreReviews = async () => {
    if (!product.slug) return;
    const nextPage = reviewPage + 1;
    const moreReviews = await fetchProductReviews(product.slug, 10, { page: nextPage, sortBy: reviewSortBy, rating: reviewRatingFilter });
    if (moreReviews && moreReviews.length > 0) {
      setAdditionalReviews((prev) => [...prev, ...moreReviews]);
      setReviewPage(nextPage);
      setHasMoreReviews(moreReviews.length >= 10);
    } else {
      setHasMoreReviews(false);
    }
  };

  const handleReviewSubmit = async (review: CreateReviewInput) => {
    const submitted = await submitProductReview(product.slug ?? '', review, accessToken ?? undefined);
    if (submitted) {
      setRemoteReviews((prev) => [submitted, ...(prev ?? [])]);
      cacheMiddleware.invalidate(`/api/v1/products/${product.slug}/reviews`);
    }
  };

  const handleHelpfulVote = async (reviewId: number) => {
    const newCount = await voteReviewHelpful(reviewId, accessToken ?? undefined);
    if (newCount !== null) {
      setHelpfulVotes((prev) => ({ ...prev, [reviewId]: newCount }));
    }
  };

  const handleLoginRequest = () => {
    setIsWriteReviewOpen(false);
    navigateToPage('account');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFilterDropdownOpen && filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      if (isSortDropdownOpen && sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterDropdownOpen, isSortDropdownOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowBottomBar(currentScrollY > 520);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`bg-white min-h-screen overflow-x-hidden selection:bg-[#67645E] selection:text-white ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* 1. HERO SECTION - REFINED FOR MOBILE */}
      <section className="icare-index-section bg-[#F1F0ED] rounded-[12px] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6">
        
        {/* LEFT COLUMN: IMAGE SLIDER */}
        <div className="relative aspect-[4/5] rounded-[12px] group z-0 overflow-hidden bg-[#F1F0ED]">
          <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.div
                key={safeActiveImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
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
                    className={`w-9 h-9 md:w-11 md:h-11 rounded-lg overflow-hidden border-2 transition-colors relative ${CONTROL_FOCUS_CLASS} ${safeActiveImageIndex === idx ? 'border-white ring-2 ring-[#7B7872]/40 opacity-100' : 'border-white/40 opacity-70 hover:opacity-100'}`}
                >
                    <ImageWithFallback src={img.url} alt={img.altText || `${displayProduct.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
           </div>

          {/* Mobile Bottom Indicator */}
          {displayImages.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
              {displayImages.map((image, idx) => (
              <div key={image.url} className={`h-1 rounded-full transition-all duration-200 motion-reduce:transition-none ${safeActiveImageIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PRODUCT INFO - REFINED MOBILE DENSITY */}
        <div className="bg-white rounded-[12px] p-6 md:p-14 flex flex-col space-y-6 md:space-y-8 md:h-full md:overflow-y-auto no-scrollbar relative z-10">
          
          <div className="space-y-3 md:space-y-4">
               <h1 className="text-[42px] md:text-[72px] font-black tracking-[-0.04em] leading-[0.85] lowercase">
                {displayProduct.name}
              </h1>
             <div className="flex items-center gap-4 md:gap-6">
                  <p className="text-[9px] md:text-[12px] font-black uppercase tracking-[0.2em] text-[#84827E]">{displayProduct.brand ?? displayProduct.category ?? 'icare essentials'}</p>
               <div className="flex items-center gap-1">
                  <div className="flex text-black">
                    {[...Array(5)].map((_, i) => <Star key={i} size={8} className="md:size-[10px]" fill="currentColor" />)}
                  </div>
                    <span className="text-[10px] md:text-[11px] font-bold text-black/55">({displayProduct.reviews ?? '0'})</span>
               </div>
             </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <p className="text-[14px] md:text-[15px] leading-relaxed text-[#84827E] font-medium">
                  {displayProduct.description ?? (productDetailsFallback || 'Product details coming soon')}
            </p>
            
            <div className="space-y-3 text-[13px] md:text-[14px] border-t border-[#DDDDDD] pt-6">
                <p className="text-[#84827E] leading-relaxed"><span className="font-black lowercase">{t.product.categoryLabel}</span> {displayProduct.category ?? 'icare'} {displayProduct.stockStatus ? `— ${displayProduct.stockStatus.replaceAll('_', ' ')}` : ''}</p>
                <div className="flex justify-between items-center py-2">
                  <p className="font-black lowercase">{purchasableProduct.originalPrice ? <>{t.product.originalValueLabel} <span className="text-black/55 line-through ml-1">{purchasableProduct.originalPrice}</span></> : purchasableProduct.label ?? 'selected care'}</p>
                  <p className="font-black text-[15px] md:text-[18px]">{purchasableProduct.price}</p>
                </div>
            </div>
          </div>

          <div className="pt-4 space-y-6 md:space-y-8">
              {/* Color picker — shown when product has colors defined and current variant has variant-color data */}
              {displayProduct.colors && displayProduct.colors.length > 0 && (() => {
                const activeColors = displayProduct.colors.filter((c) => c.isActive !== false);
                if (activeColors.length === 0) return null;
                // Determine stock for the currently selected variant-color combination
                let currentColorStock: number | null = null;
                let currentColorStatus: string | null = null;
                if (selectedVariant?.variantColors && selectedColorId) {
                  const vc = selectedVariant.variantColors.find((v) => v.colorId === selectedColorId);
                  if (vc) {
                    currentColorStock = vc.stockQuantity;
                    currentColorStatus = vc.stockStatus;
                  }
                }
                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] md:text-[13px] text-[#84827E] lowercase font-black">
                        {t.product.color}:
                      </span>
                      <span className="text-[12px] md:text-[13px] text-[#67645E] lowercase font-black">
                        {activeColors.find((c) => c.id === selectedColorId)?.name ?? '—'}
                      </span>
                      {currentColorStock !== null && currentColorStock > 0 && currentColorStock <= 5 && (
                        <span className="text-[10px] md:text-[11px] font-bold text-amber-700 lowercase">
                          {t.product.onlyLeft.replace('{count}', String(currentColorStock))}
                        </span>
                      )}
                      {currentColorStatus === 'out_of_stock' && (
                        <span className="text-[10px] md:text-[11px] font-bold text-black/40 lowercase">
                          {t.product.outOfStock}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {activeColors.map((color) => {
                        const isSelected = selectedColorId === color.id;
                        // Find the variant-color for this color to get stock info
                        const variantColor = selectedVariant?.variantColors?.find((vc) => vc.colorId === color.id);
                        const isOutOfStock = variantColor?.stockStatus === 'out_of_stock' || (variantColor?.stockQuantity === 0);
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => setSelectedColorId(color.id)}
                            aria-label={color.name}
                            title={color.name}
                            disabled={isOutOfStock}
                            className={`relative h-9 w-9 md:h-11 md:w-11 rounded-full overflow-hidden border-2 transition-all ${CONTROL_FOCUS_CLASS} ${
                              isSelected
                                ? 'border-[#67645E] ring-2 ring-[#67645E]/30 opacity-100 scale-105'
                                : isOutOfStock
                                  ? 'border-black/15 opacity-40 cursor-not-allowed'
                                  : 'border-black/15 opacity-90 hover:opacity-100 hover:border-[#67645E]/40'
                            }`}
                            style={!color.image ? { backgroundColor: color.hexCode } : undefined}
                          >
                            {color.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={color.image}
                                alt={color.name}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                            {isOutOfStock && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="block h-[2px] w-full bg-black/40 rotate-45" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {displayProduct.variants && displayProduct.variants.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-[12px] md:text-[13px]">
                   <span className="text-[#84827E] lowercase">{productSelectOption || t.product.selectOption}</span>
                  {displayProduct.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={!isPurchasableStock(variant.stockStatus, variant.stockQuantity)}
                      className={`font-black underline underline-offset-4 flex items-center gap-1 rounded-md lowercase ${CONTROL_FOCUS_CLASS} ${selectedVariant?.id === variant.id ? 'text-[#67645E]' : 'text-[#84827E] hover:text-[#67645E]'} disabled:text-black/30 disabled:cursor-not-allowed`}
                    >
                      {variant.name}
                      {variant.isDefault && <ChevronDown size={14} />}
                    </button>
                  ))}
                </div>
              )}

             <div className="space-y-4">
                 <motion.button
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.005 }}
                   whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                   onClick={() => isSelectedVariantPurchasable && addToCart(purchasableProduct)}
                  disabled={!isSelectedVariantPurchasable}
                   className={`w-full bg-[#67645E] text-white py-5 rounded-full text-[12px] md:text-[13px] font-black uppercase tracking-[0.2em] hover:bg-[#67645E]/90 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${CONTROL_FOCUS_CLASS}`}
                >
                  <ShoppingBag size={16} />
                    {isSelectedVariantPurchasable
                      ? `${productAddToBag || t.product.addToBag} — ${purchasableProduct.price}`
                      : (productSoldOut || t.product.soldOut)}
                </motion.button>
                <div className="flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-bold text-[#84827E]">
                  {productAfterpayText || t.product.orAfterpay} <span className="text-black font-black bg-[#ACEBFF] px-1.5 py-0.5 rounded italic">Afterpay</span>
                </div>
              </div>
          </div>

          {/* Product Details — collapsible */}
          {(() => {
            const bp = displayProduct.backendProduct;
            if (!bp) return null;

            const details: { label: string; value: string | string[] }[] = [];

            if (bp.howToUse) details.push({ label: t.product.howToUse, value: bp.howToUse });
            if (bp.ingredients?.length) details.push({ label: t.product.ingredients, value: bp.ingredients });
            if (bp.benefits?.length) details.push({ label: t.product.benefits, value: bp.benefits });
            if (bp.skinTypes?.length) details.push({ label: t.product.skinTypes, value: bp.skinTypes });
            if (bp.concerns?.length) details.push({ label: t.product.concerns, value: bp.concerns });

            if (details.length === 0) return null;

            return (
              <div className="border-t border-[#DDDDDD] pt-4">
                <button
                  type="button"
                  onClick={() => setShowDetails((prev) => !prev)}
                  className={`flex items-center justify-between w-full text-[11px] md:text-[12px] font-black uppercase tracking-[0.15em] text-[#67645E] ${CONTROL_FOCUS_CLASS}`}
                >
                  <span>{t.product.productDetails}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
                  />
                </button>
                {showDetails && (
                  <div className="mt-4 space-y-4">
                    {details.map((detail) => (
                      <div key={detail.label} className="space-y-1">
                        <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.12em] text-[#84827E]">
                          {detail.label}
                        </p>
                        {Array.isArray(detail.value) ? (
                          <p className="text-[12px] md:text-[13px] text-[#67645E] leading-relaxed">
                            {detail.value.join(' · ')}
                          </p>
                        ) : (
                          <p className="text-[12px] md:text-[13px] text-[#67645E] leading-relaxed whitespace-pre-line">
                            {detail.value}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
        </div>
      </section>

      {/* SHOWCASE SECTION */}
      <ShowcaseBlock slug={product.slug} lang={lang} />

      {/* 2. REVIEWS SECTION */}
      <section className="icare-index-section pb-32">
        <div className="bg-[#F1F0ED] rounded-[12px] overflow-hidden p-8 lg:p-16">
          
          <ScrollReveal direction="bottom" viewportMargin="-60px">
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
                    <p className="text-[12px] font-black uppercase tracking-widest text-[#67645E]">{productRatingLabel || t.product.customerReviews}</p>
                    <p className="text-[12px] text-[#84827E]">{t.product.basedOnReviews.replace('{count}', String(reviewCount))}</p>
                  </div>
                  {/* Rating distribution */}
                  <div className="space-y-2 w-full max-w-xs">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = Number(ratingDistribution[String(star)] ?? 0);
                      const total = Object.values(ratingDistribution).reduce((sum, c) => sum + Number(c), 0);
                      const pct = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-[11px] font-bold text-black/55 w-3 text-right">{star}</span>
                          <Star size={10} fill="black" className="text-black shrink-0" />
                          <div className="flex-1 h-1.5 bg-black/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#67645E] rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-black/40 w-6 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsWriteReviewOpen(true)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#67645E] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#67645E]/90 transition-colors ${CONTROL_FOCUS_CLASS}`}
                  >
                    {t.product.writeReview}
                  </button>
                  <div ref={filterDropdownRef} className="relative">
                    <button
                      onClick={() => { setIsFilterDropdownOpen((prev) => !prev); setIsSortDropdownOpen(false); }}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-colors ${CONTROL_FOCUS_CLASS} ${reviewRatingFilter ? 'bg-[#67645E] text-white border-[#67645E]' : 'border-[#DDDDDD] hover:bg-[#67645E] hover:text-white'}`}
                    >
                       {reviewRatingFilter ? `${reviewRatingFilter} stars` : (reviewFilterButton || t.product.reviewFilter)}
                      <ChevronDown size={12} className={`transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isFilterDropdownOpen && (
                      <div className="absolute top-full mt-2 left-0 bg-white rounded-[12px] border border-[#DDDDDD] py-1 z-20 min-w-[140px]">
                        {reviewRatingFilter && (
                          <button
                            onClick={() => { setReviewRatingFilter(undefined); setIsFilterDropdownOpen(false); }}
                            className={`w-full px-4 py-2 text-left text-[11px] font-bold hover:bg-[#F1F0ED] transition-colors text-[#84827E]`}
                          >
                            {t.product.allRatings}
                          </button>
                        )}
                        {[5, 4, 3, 2, 1].map((r) => (
                          <button
                            key={r}
                            onClick={() => { setReviewRatingFilter(r); setIsFilterDropdownOpen(false); }}
                            className={`w-full px-4 py-2 text-left text-[11px] font-bold hover:bg-[#F1F0ED] transition-colors flex items-center gap-2 ${reviewRatingFilter === r ? 'text-[#67645E]' : 'text-[#84827E]'}`}
                          >
                            {r} star{r !== 1 ? 's' : ''}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div ref={sortDropdownRef} className="relative">
                    <button
                      onClick={() => { setIsSortDropdownOpen((prev) => !prev); setIsFilterDropdownOpen(false); }}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#DDDDDD] text-[10px] font-black uppercase tracking-widest hover:border-[#67645E] transition-colors bg-white ${CONTROL_FOCUS_CLASS}`}
                    >
                      {reviewSortBy === 'recent' ? t.product.mostRecent : reviewSortBy === 'highest' ? t.product.highestRated : reviewSortBy === 'lowest' ? t.product.lowestRated : t.product.mostHelpful}
                      <ChevronDown size={12} className={`transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isSortDropdownOpen && (
                      <div className="absolute top-full mt-2 right-0 bg-white rounded-[12px] border border-[#DDDDDD] py-1 z-20 min-w-[160px]">
                        {[
                          { value: 'recent', label: t.product.mostRecent },
                          { value: 'highest', label: t.product.highestRated },
                          { value: 'lowest', label: t.product.lowestRated },
                          { value: 'helpful', label: t.product.mostHelpful },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setReviewSortBy(opt.value); setIsSortDropdownOpen(false); }}
                            className={`w-full px-4 py-2 text-left text-[11px] font-bold hover:bg-[#F1F0ED] transition-colors ${reviewSortBy === opt.value ? 'text-[#67645E]' : 'text-[#84827E]'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className={`relative transition-all duration-700 ease-in-out overflow-hidden ${!isReviewsExpanded ? 'max-h-[500px] md:max-h-none' : 'max-h-[5000px]'}`}>
            {hasReviews ? (
              <StaggerContainer className="divide-y divide-black/5" staggerDelay={0.06} viewportMargin="-40px">
                {displayReviews.map((review, idx) => (
                  <ScrollReveal key={review.id ?? idx} direction="bottom" delay={idx * 0.06}>
                    <ReviewItem
                      review={review}
                      content={{ verifiedLabel: reviewVerifiedLabel, hydrationQuestion: reviewHydrationQuestion, hydrationLow: reviewHydrationLow, hydrationHigh: reviewHydrationHigh, helpfulQuestion: reviewHelpfulQuestion, ageRange: t.product.ageRange, skinConcern: t.product.skinConcern, skinTypeQuestion: t.product.skinTypeQuestion, favoriteFeatures: t.product.favoriteFeatures }}
                      helpfulCount={helpfulVotes[review.id ?? 0] ?? 0}
                      onHelpfulVote={handleHelpfulVote}
                    />
                  </ScrollReveal>
                ))}
              </StaggerContainer>
            ) : (
              <div className="py-16 text-center text-[14px] font-bold uppercase tracking-[0.2em] text-[#67645E]/40">
                {productNoReviews || t.product.noReviewsYet}
              </div>
            )}
            
            {/* Mobile Gradient Overlay */}
            {hasReviews && !isReviewsExpanded && (
              <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/80 to-transparent z-10 md:hidden pointer-events-none" />
            )}
          </div>

          {hasReviews && (
            <div className="flex flex-col items-center gap-3 pt-8 md:pt-12 relative z-20">
              {!isReviewsExpanded && (
                <button 
                  onClick={() => setIsReviewsExpanded(true)}
                  className={`px-12 py-3 rounded-full border border-[#DDDDDD] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#67645E] hover:text-white transition-colors duration-200 bg-white ${CONTROL_FOCUS_CLASS}`}
                >
                  {reviewShowMore || t.product.showMore}
                </button>
              )}
              {isReviewsExpanded && hasMoreReviews && (
                <button 
                  onClick={loadMoreReviews}
                  className={`px-12 py-3 rounded-full border border-[#DDDDDD] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#67645E] hover:text-white transition-colors duration-200 bg-white ${CONTROL_FOCUS_CLASS}`}
                >
                  {t.product.loadMoreReviews}
                </button>
              )}
              {isReviewsExpanded && (
                <button 
                  onClick={() => { setIsReviewsExpanded(false); setAdditionalReviews([]); setReviewPage(1); }}
                  className={`px-8 py-2 rounded-full border border-[#DDDDDD] text-[10px] font-bold uppercase tracking-widest hover:border-[#67645E] transition-colors ${CONTROL_FOCUS_CLASS}`}
                >
                  {reviewShowLess || t.product.showLess}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. LINEUP SECTION */}
      <ProductLineup lang={lang} products={relatedProducts} useShortcutFallback={false} onProductSelect={onProductSelect} />

      {/* FLOATING STICKY BAR */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ 
            y: showBottomBar ? 0 : 120, 
            opacity: showBottomBar ? 1 : 0 
          }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: [0.32, 0.72, 0, 1] }}
          className="fixed bottom-0 left-0 w-full bg-white px-[var(--icare-section-inset)] py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center justify-between gap-4 z-50 border-t border-[#DDDDDD]"
        >
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <div className="w-11 h-11 bg-white rounded-md flex items-center justify-center p-1.5">
               <ImageWithFallback src={displayProduct.primaryImage} alt={displayProduct.name} className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <span className="min-w-0 truncate text-[11px] md:text-[12px] font-black uppercase tracking-[0.14em] md:tracking-[0.2em] text-[#67645E]">{displayProduct.name}</span>
          </div>

          <motion.button 
            whileHover={shouldReduceMotion ? undefined : { scale: 1.005 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
            onClick={() => isSelectedVariantPurchasable && addToCart(purchasableProduct)}
            disabled={!isSelectedVariantPurchasable}
            className={`shrink-0 bg-[#67645E] text-white px-5 md:px-8 py-3 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.16em] md:tracking-[0.2em] hover:bg-[#67645E]/90 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${CONTROL_FOCUS_CLASS}`}
          >
            <ShoppingBag size={14} />
            {isSelectedVariantPurchasable
              ? `${productBuyNow || t.product.buyNow} - ${purchasableProduct.price}`
              : (productSoldOut || t.product.soldOut).toUpperCase()}
          </motion.button>
        </motion.div>
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <WriteReviewDialog
        open={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        productSlug={product.slug ?? ''}
        productName={displayProduct.name}
        onSubmit={handleReviewSubmit}
        isAuthenticated={isAuthenticated}
        onLoginRequest={handleLoginRequest}
        lang={lang}
      />
    </div>
  );
};
