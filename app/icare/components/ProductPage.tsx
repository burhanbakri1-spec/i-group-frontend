import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Star, ChevronDown, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language, translations } from '../translations';
import { ProductLineup } from './ProductLineup';
import { ShowcaseBlock } from './showcase/ShowcaseBlock';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { usePdpScrollChain } from '../hooks/usePdpScrollChain';
import { Product, ProductGalleryMedia, ProductReview, ProductVariant, CreateReviewInput } from '../types';
import { getDefaultVariant, isPurchasableStock, mapBackendProductGalleryMedia, mapBackendProductToProduct, mapBackendReviewToProductReview, normalizeProductMediaUrl } from '../lib/mappers';
import { fetchProductBySlug, fetchProductReviews, fetchRelatedProducts, submitProductReview, voteReviewHelpful } from '../lib/catalog-client';
import { cacheMiddleware } from '../lib/cache-middleware';
import { WriteReviewDialog } from './WriteReviewDialog';
import { useIcareShell } from './IcareShell';
import { ScrollReveal, StaggerContainer } from './ui/ScrollReveal';
import { pickLocalized } from '../lib/localized';

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
  lang: Language,
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
    const baseMedia = mapBackendProductGalleryMedia(displayProduct.backendProduct, lang, selectedVariant)
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
    ...(selectedVariant?.image ? [{ url: selectedVariant.image, mediaType: 'IMAGE' as const, altText: pickLocalized(selectedVariant.name, lang) }] : []),
    ...(displayProduct.variants ?? [])
      .filter((variant) => variant.id !== selectedVariant?.id && variant.image)
      .map((variant) => ({ url: variant.image ?? '', mediaType: 'IMAGE' as const, altText: pickLocalized(variant.name, lang) })),
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
  const pdpSectionRef = useRef<HTMLElement>(null);
  const pdpGridRef = useRef<HTMLDivElement>(null);
  const pdpPanelRef = useRef<HTMLDivElement>(null);
  const pdpMediaTrackRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'ar';

  usePdpScrollChain(pdpSectionRef, pdpGridRef, pdpPanelRef);

  const displayImages = useMemo(
    () => getProductImageGallery(displayProduct, selectedVariant, lang, selectedColorId),
    [displayProduct, selectedVariant, selectedColorId, lang],
  );
  const displayImagesKey = displayImages.map((image) => image.url).join('|');
  const activeImageResetKey = `${product.id}|${product.slug ?? ''}|${selectedVariant?.id ?? ''}`;
  const safeActiveImageIndex = activeImageSelection.galleryKey === displayImagesKey
    && activeImageSelection.resetKey === activeImageResetKey
    && displayImages[activeImageSelection.index]?.url
    ? activeImageSelection.index
    : 0;

  const scrollToMediaSlide = (index: number) => {
    const track = pdpMediaTrackRef.current;
    const slide = track?.querySelector<HTMLElement>(`[data-media-index="${index}"]`);
    if (!slide) return;
    slide.scrollIntoView({
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
      inline: 'start',
      block: 'nearest',
    });
  };

  const handleMediaTrackScroll = () => {
    const track = pdpMediaTrackRef.current;
    if (!track) return;

    const slides = [...track.querySelectorAll<HTMLElement>('[data-media-index]')];
    if (slides.length === 0) return;

    const trackLeft = track.getBoundingClientRect().left;
    let nextIndex = 0;
    let minDistance = Infinity;

    slides.forEach((slide, idx) => {
      const distance = Math.abs(slide.getBoundingClientRect().left - trackLeft);
      if (distance < minDistance) {
        minDistance = distance;
        nextIndex = idx;
      }
    });

    if (nextIndex !== safeActiveImageIndex) {
      setActiveImageSelection({
        index: nextIndex,
        galleryKey: displayImagesKey,
        resetKey: activeImageResetKey,
      });
    }
  };

  const purchasableProduct = useMemo(
    () => displayProduct.backendProduct
      ? mapBackendProductToProduct(displayProduct.backendProduct, lang, selectedVariant)
      : displayProduct,
    [displayProduct, selectedVariant, lang],
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

      const productDetail = await fetchProductBySlug(product.slug, lang);
      if (productDetail) {
        const defaultVariant = productDetail.backendProduct ? getDefaultVariant(productDetail.backendProduct) : productDetail.variants?.find((variant) => variant.id === productDetail.variantId) ?? null;
        setDisplayProduct(productDetail.backendProduct ? mapBackendProductToProduct(productDetail.backendProduct, lang, defaultVariant) : productDetail);
        setSelectedVariant(defaultVariant);
        setRemoteReviews(productDetail.backendProduct?.reviews?.recent?.map(mapBackendReviewToProductReview) ?? []);
      } else {
        setDisplayProduct(product);
      }
    };

    loadProductDetail();
  }, [product, lang]);

  useEffect(() => {
    const loadProductSupportData = async () => {
      if (!product.slug) {
        setRemoteReviews([]);
        return;
      }
      const [reviewData, relatedData] = await Promise.all([
        fetchProductReviews(product.slug, 10, { page: 1, sortBy: reviewSortBy, rating: reviewRatingFilter }),
        fetchRelatedProducts(product.slug, lang, 8),
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
  const formattedReviewCount = (() => {
    const count = Number(reviewCount);
    return Number.isFinite(count)
      ? count.toLocaleString(lang === 'ar' ? 'ar' : 'en-US')
      : String(reviewCount);
  })();
  const productTagline =
    displayProduct.sub?.trim()
    || displayProduct.brand?.trim()
    || displayProduct.category?.trim()
    || 'icare essentials';
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
      
      {/* 1. HERO SECTION — Rhode Product__new two-column layout */}
      <section ref={pdpSectionRef} className="icare-index-section icare-pdp">
        <div ref={pdpGridRef} className="icare-pdp__grid">

        {/* LEFT COLUMN: IMAGE GALLERY */}
        <div className="icare-pdp__media" aria-label={displayProduct.name}>
          {displayImages.length > 0 ? (
            <>
              <div
                ref={pdpMediaTrackRef}
                className={`icare-pdp__media-track ${displayImages.length === 1 ? 'icare-pdp__media-track--single' : ''}`}
                onScroll={handleMediaTrackScroll}
              >
                {displayImages.map((img, idx) => (
                  <div key={img.url || idx} className="icare-pdp__media-slide" data-media-index={idx}>
                    <ImageWithFallback
                      src={img.url}
                      alt={img.altText || `${displayProduct.name} ${idx + 1}`}
                      className="icare-pdp__media-image"
                    />
                  </div>
                ))}
              </div>

              {displayImages.length > 1 && (
                <div className="icare-pdp__thumbnails">
                  {displayImages.map((img, idx) => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => {
                        setActiveImageSelection({
                          index: idx,
                          galleryKey: displayImagesKey,
                          resetKey: activeImageResetKey,
                        });
                        scrollToMediaSlide(idx);
                      }}
                      aria-label={img.altText || `${displayProduct.name} thumbnail ${idx + 1}`}
                      className={`icare-pdp__thumbnail ${CONTROL_FOCUS_CLASS} ${safeActiveImageIndex === idx ? 'is-active' : ''}`}
                    >
                      <ImageWithFallback src={img.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {displayImages.length > 1 && (
                <div className="icare-pdp__mobile-dots md:hidden">
                  {displayImages.map((image, idx) => (
                    <div
                      key={image.url}
                      className={`h-1 rounded-full transition-all duration-200 motion-reduce:transition-none ${safeActiveImageIndex === idx ? 'w-4 bg-[#67645E]' : 'w-1.5 bg-[#67645E]/30'}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <ImageWithFallback alt={displayProduct.name} className="icare-pdp__media-image" />
          )}
        </div>

        {/* RIGHT COLUMN: PRODUCT INFO PANEL */}
        <div ref={pdpPanelRef} className="icare-pdp__panel">

          <div className="icare-pdp__panel-fold">
          <h1 className="icare-pdp__title">{displayProduct.name}</h1>

          <div className="icare-pdp__subtitle-row">
            <p className="icare-pdp__tagline">{productTagline}</p>
            <div className="icare-pdp__rating" aria-label={productRatingLabel || t.product.ratingLabel}>
              <div className="flex text-black">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} fill="currentColor" />
                ))}
              </div>
              <span>({formattedReviewCount})</span>
            </div>
          </div>

          <p className="icare-pdp__description">
            {displayProduct.description ?? (productDetailsFallback || 'Product details coming soon')}
          </p>

          <div className="icare-pdp__meta">
            <p>
              <span className="font-bold lowercase">{t.product.categoryLabel}</span>{' '}
              {displayProduct.category ?? 'icare'}
              {displayProduct.stockStatus ? ` — ${displayProduct.stockStatus.replaceAll('_', ' ')}` : ''}
            </p>
            <div className="icare-pdp__price-row">
              <p className="lowercase">
                {purchasableProduct.originalPrice ? (
                  <>
                    {t.product.originalValueLabel}{' '}
                    <span className="text-black/55 line-through">{purchasableProduct.originalPrice}</span>
                  </>
                ) : (
                  purchasableProduct.label ?? 'selected care'
                )}
              </p>
              <p className="icare-pdp__price">{purchasableProduct.price}</p>
            </div>
          </div>

          {/* VARIANT PICKER */}
          {displayProduct.variants && displayProduct.variants.length > 1 && (
            <div className="icare-pdp__options">
              <p className="icare-pdp__options-label">{t.product.color || 'size'}</p>
              <div className="icare-pdp__options-row">
                {displayProduct.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    aria-pressed={selectedVariant?.id === variant.id}
                    className={`icare-pdp__option-btn ${selectedVariant?.id === variant.id ? 'is-selected' : ''} ${CONTROL_FOCUS_CLASS}`}
                  >
                    {pickLocalized(variant.name, lang)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* COLOR PICKER */}
          {displayProduct.colors && displayProduct.colors.length > 0 && (
            <div className="icare-pdp__options">
              <p className="icare-pdp__options-label">{t.product.color || 'color'}</p>
              <div className="icare-pdp__options-row">
                {displayProduct.colors.filter((c) => c.isActive !== false).map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColorId(color.id)}
                    aria-pressed={selectedColorId === color.id}
                    aria-label={pickLocalized(color.name, lang)}
                    className={`icare-pdp__color-btn ${selectedColorId === color.id ? 'is-selected' : ''} ${CONTROL_FOCUS_CLASS}`}
                    style={{ '--swatch': color.hexCode } as React.CSSProperties}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="icare-pdp__cta-block">
            <motion.button
              whileHover={shouldReduceMotion ? undefined : { scale: 1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
              onClick={() => isSelectedVariantPurchasable && addToCart(purchasableProduct)}
              disabled={!isSelectedVariantPurchasable}
              className={`icare-pdp__cta ${CONTROL_FOCUS_CLASS}`}
            >
              {isSelectedVariantPurchasable
                ? `${productAddToBag || t.product.addToBag} - ${purchasableProduct.price}`
                : (productSoldOut || t.product.soldOut)}
            </motion.button>
            <div className="icare-pdp__afterpay">
              {productAfterpayText || t.product.orAfterpay}{' '}
              <span className="text-black font-black bg-[#ACEBFF] px-1.5 py-0.5 rounded italic">Afterpay</span>
            </div>
          </div>
          </div>

          {(() => {
            const bp = displayProduct.backendProduct;
            if (!bp) return null;

            const details: { label: string; value: string | string[] }[] = [];

            const howToUse = pickLocalized(bp.howToUse, lang);
            if (howToUse) details.push({ label: t.product.howToUse, value: howToUse });
            if (bp.ingredients?.length) details.push({ label: t.product.ingredients, value: bp.ingredients });
            if (bp.benefits?.length) details.push({ label: t.product.benefits, value: bp.benefits });
            if (bp.skinTypes?.length) details.push({ label: t.product.skinTypes, value: bp.skinTypes });
            if (bp.concerns?.length) details.push({ label: t.product.concerns, value: bp.concerns });

            if (details.length === 0) return null;

            return (
              <div className="icare-pdp__details">
                <h2 className="icare-pdp__details-heading">{t.product.productDetails}</h2>
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
                    className={`inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap px-6 py-2.5 rounded-full bg-[#67645E] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#67645E]/90 transition-colors ${CONTROL_FOCUS_CLASS}`}
                  >
                    {t.product.writeReview}
                  </button>
                  <div ref={filterDropdownRef} className="relative">
                    <button
                      onClick={() => { setIsFilterDropdownOpen((prev) => !prev); setIsSortDropdownOpen(false); }}
                       className={`inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap px-6 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-colors ${CONTROL_FOCUS_CLASS} ${reviewRatingFilter ? 'bg-[#67645E] text-white border-[#67645E]' : 'border-[#DDDDDD] hover:bg-[#67645E] hover:text-white'}`}
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
                       className={`inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap px-6 py-2.5 rounded-full border border-[#DDDDDD] text-[10px] font-black uppercase tracking-widest hover:border-[#67645E] transition-colors bg-white ${CONTROL_FOCUS_CLASS}`}
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
                   className={`inline-flex min-h-11 items-center justify-center px-12 py-3 rounded-full border border-[#DDDDDD] text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap hover:bg-[#67645E] hover:text-white transition-colors duration-200 bg-white ${CONTROL_FOCUS_CLASS}`}
                >
                  {reviewShowMore || t.product.showMore}
                </button>
              )}
              {isReviewsExpanded && hasMoreReviews && (
                <button 
                  onClick={loadMoreReviews}
                   className={`inline-flex min-h-11 items-center justify-center px-12 py-3 rounded-full border border-[#DDDDDD] text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap hover:bg-[#67645E] hover:text-white transition-colors duration-200 bg-white ${CONTROL_FOCUS_CLASS}`}
                >
                  {t.product.loadMoreReviews}
                </button>
              )}
              {isReviewsExpanded && (
                <button 
                  onClick={() => { setIsReviewsExpanded(false); setAdditionalReviews([]); setReviewPage(1); }}
                   className={`inline-flex min-h-10 items-center justify-center px-8 py-2 rounded-full border border-[#DDDDDD] text-[10px] font-bold uppercase tracking-widest whitespace-nowrap hover:border-[#67645E] transition-colors ${CONTROL_FOCUS_CLASS}`}
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

      {/* FLOATING STICKY BAR — Rhode Product-sticky-bar */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ 
            y: showBottomBar ? 0 : 120, 
            opacity: showBottomBar ? 1 : 0 
          }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: [0.32, 0.72, 0, 1] }}
          className={`icare-pdp__sticky-bar${showBottomBar ? '' : ' is-hidden'}`}
        >
          <div className="icare-pdp__sticky-bar-inner">
            <div className="icare-pdp__sticky-bar-info">
              <div className="icare-pdp__sticky-bar-image">
                <ImageWithFallback src={displayProduct.primaryImage} alt={displayProduct.name} className="w-full h-full object-contain" />
              </div>
              <p className="icare-pdp__sticky-bar-title">{displayProduct.name}</p>
            </div>

            <button 
              type="button"
              onClick={() => isSelectedVariantPurchasable && addToCart(purchasableProduct)}
              disabled={!isSelectedVariantPurchasable}
              className={`icare-pdp__sticky-cta ${CONTROL_FOCUS_CLASS}`}
            >
              {isSelectedVariantPurchasable
                ? `${productBuyNow || t.product.buyNow} - ${purchasableProduct.price}`
                : (productSoldOut || t.product.soldOut).toUpperCase()}
            </button>
          </div>
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
