import React, { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { SwipeRail } from './ui/SwipeRail';
import { ScrollReveal, StaggerContainer } from './ui/ScrollReveal';
import { SkeletonPulse } from './ui/skeletons';
import { fetchCatalogProducts, fetchProductShortcut } from '../lib/catalog-client';
import { useSiteContent } from '../hooks/useSiteContent';
import { Language, translations } from '../translations';
import { Product } from '../types';

interface LandingProductShowcaseProps {
  lang: Language;
  onProductSelect: (product: Product) => void;
}

const SHOWCASE_PRODUCT_LIMIT = 10;

const LandingProductShowcaseSkeleton = ({ lang }: { lang: Language }) => {
  const t = translations[lang];
  return (
    <section className="icare-index-section icare-landing-products">
    <div className="icare-landing-products__header">
      <SkeletonPulse className="h-10 w-72 rounded-[8px]" />
    </div>
    <SwipeRail
      ariaLabel={t.pages.landingShowcase.loadingShowcase}
      cursorLabel={t.pages.landingShowcase.swipe}
      className="icare-landing-products__rail"
      trackClassName="icare-landing-products__track"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="icare-landing-products__item" key={index}>
          <div className="icare-product-card icare-product-card--standard is-loading">
            <SkeletonPulse className="h-[31.25rem] w-[21.875rem] max-w-full rounded-[12px]" />
          </div>
        </div>
      ))}
    </SwipeRail>
  </section>
  );
};

export const LandingProductShowcase: React.FC<LandingProductShowcaseProps> = ({ lang, onProductSelect }) => {
  const { trendingTitle } = useSiteContent(lang);
  const t = translations[lang];
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      const featuredProducts = await fetchProductShortcut('featured', lang, SHOWCASE_PRODUCT_LIMIT);
      const fallbackProducts = featuredProducts?.length
        ? featuredProducts
        : await fetchCatalogProducts(undefined, lang);

      if (mounted) {
        setProducts((fallbackProducts ?? []).slice(0, SHOWCASE_PRODUCT_LIMIT));
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [lang]);

  if (products === null) {
    return <LandingProductShowcaseSkeleton lang={lang} />;
  }

  if (products.length === 0) {
    return (
      <section className="icare-index-section icare-landing-products">
        <div className="icare-landing-products__empty">
          {t.pages.landingShowcase.noProducts}
        </div>
      </section>
    );
  }

  return (
    <section className="icare-index-section icare-landing-products">
      <ScrollReveal direction="bottom" viewportMargin="-60px">
        <div className="icare-landing-products__header">
          <h2 className="icare-landing-products__title">
            {trendingTitle || t.pages.landingShowcase.trendingEssentials}
          </h2>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="bottom" delay={0.1} viewportMargin="-40px">
        <SwipeRail
          ariaLabel={t.pages.landingShowcase.featuredShowcase}
          cursorLabel={t.pages.landingShowcase.swipe}
          className="icare-landing-products__rail"
          trackClassName="icare-landing-products__track"
        >
          {products.map((product, index) => (
            <ScrollReveal key={product.id} direction="bottom" delay={Math.min(index * 0.05, 0.5)}>
              <div className="icare-landing-products__item">
                <ProductCard
                  product={product}
                  lang={lang}
                  onSelect={() => onProductSelect(product)}
                  showQuickAdd={false}
                />
              </div>
            </ScrollReveal>
          ))}
        </SwipeRail>
      </ScrollReveal>
    </section>
  );
};
