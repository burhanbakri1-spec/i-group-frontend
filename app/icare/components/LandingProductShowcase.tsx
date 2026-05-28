import React, { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { SwipeRail } from './ui/SwipeRail';
import { SkeletonPulse } from './ui/skeletons';
import { fetchCatalogProducts, fetchProductShortcut } from '../lib/catalog-client';
import { useSiteContent } from '../hooks/useSiteContent';
import { Language } from '../translations';
import { Product } from '../types';

interface LandingProductShowcaseProps {
  lang: Language;
  onProductSelect: (product: Product) => void;
}

const SHOWCASE_PRODUCT_LIMIT = 10;

const LandingProductShowcaseSkeleton = () => (
  <section className="icare-index-section icare-landing-products">
    <div className="icare-landing-products__header">
      <SkeletonPulse className="h-10 w-72 rounded-[8px]" />
    </div>
    <SwipeRail
      ariaLabel="Loading product showcase"
      cursorLabel="swipe"
      className="icare-landing-products__rail"
      trackClassName="icare-landing-products__track"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="icare-landing-products__item" key={index}>
          <div className="icare-product-card icare-product-card--standard is-loading">
            <SkeletonPulse className="h-full w-full rounded-[12px]" />
          </div>
        </div>
      ))}
    </SwipeRail>
  </section>
);

export const LandingProductShowcase: React.FC<LandingProductShowcaseProps> = ({ lang, onProductSelect }) => {
  const { trendingTitle } = useSiteContent(lang);
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      const featuredProducts = await fetchProductShortcut('featured', SHOWCASE_PRODUCT_LIMIT);
      const fallbackProducts = featuredProducts?.length
        ? featuredProducts
        : await fetchCatalogProducts();

      if (mounted) {
        setProducts((fallbackProducts ?? []).slice(0, SHOWCASE_PRODUCT_LIMIT));
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  if (products === null) {
    return <LandingProductShowcaseSkeleton />;
  }

  if (products.length === 0) {
    return (
      <section className="icare-index-section icare-landing-products">
        <div className="icare-landing-products__empty">
          {lang === 'en' ? 'No products available' : 'لا توجد منتجات متاحة'}
        </div>
      </section>
    );
  }

  return (
    <section className="icare-index-section icare-landing-products">
      <div className="icare-landing-products__header">
        <h2 className="icare-landing-products__title">
          {lang === 'en' ? (trendingTitle || 'trending essentials') : 'أساسيات رائجة'}
        </h2>
      </div>

      <SwipeRail
        ariaLabel={lang === 'en' ? 'Featured product showcase' : 'عرض المنتجات المختارة'}
        cursorLabel={lang === 'en' ? 'swipe' : 'اسحب'}
        className="icare-landing-products__rail"
        trackClassName="icare-landing-products__track"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="icare-landing-products__item"
          >
            <ProductCard
              product={product}
              lang={lang}
              onSelect={() => onProductSelect(product)}
            />
          </div>
        ))}
      </SwipeRail>
    </section>
  );
};
