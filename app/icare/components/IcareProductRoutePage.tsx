'use client';

import React, { useEffect, useState } from 'react';
import { ProductPage } from './ProductPage';
import { useIcareShell } from './IcareShell';
import { fetchProductBySlug } from '../lib/catalog-client';
import { useSiteContent } from '../hooks/useSiteContent';
import { Product } from '../types';

export const IcareProductRoutePage = ({ slug }: { slug: string }) => {
  const { productUnavailableHeadline, productUnavailableDesc, productUnavailableCta } = useSiteContent();
  const { lang, navigateToPage, navigateToProduct } = useIcareShell();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      setIsLoading(true);
      setIsUnavailable(false);
      const productDetail = await fetchProductBySlug(slug);
      if (!isMounted) return;
      setProduct(productDetail);
      setIsUnavailable(!productDetail);
      setIsLoading(false);
    };

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F1F0ED]">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isUnavailable || !product) {
    return (
      <div className="min-h-[60vh] bg-[#F1F0ED] flex items-center justify-center px-6 text-center">
        <div className="max-w-xl space-y-6">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-black/40">product unavailable</p>
          <h1 className="text-[42px] md:text-[64px] font-bold tracking-[-0.04em] lowercase text-[#67645E]">
            {productUnavailableHeadline}
          </h1>
          <p className="text-[15px] text-[#706E6A] font-medium">
            {productUnavailableDesc}
          </p>
          <button
            onClick={() => navigateToPage('shop')}
            className="px-10 py-4 bg-[#67645E] text-white rounded-full text-[12px] font-black uppercase tracking-[0.2em] hover:bg-[#7B7872] transition-colors"
          >
            back to shop
          </button>
        </div>
      </div>
    );
  }

  return <ProductPage product={product} lang={lang} onProductSelect={navigateToProduct} />;
};
