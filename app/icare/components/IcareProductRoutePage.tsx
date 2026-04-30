'use client';

import React, { useEffect, useState } from 'react';
import { ProductPage } from './ProductPage';
import { useIcareShell } from './IcareShell';
import { fetchProductBySlug } from '../lib/catalog-client';
import { Product } from '../types';

export const IcareProductRoutePage = ({ slug }: { slug: string }) => {
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
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isUnavailable || !product) {
    return (
      <div className="min-h-[60vh] bg-white flex items-center justify-center px-6 text-center">
        <div className="max-w-xl space-y-6">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-black/40">product unavailable</p>
          <h1 className="text-[42px] md:text-[64px] font-black tracking-[-0.04em] lowercase text-[#333]">
            We could not find this iCare product.
          </h1>
          <p className="text-[15px] text-[#706E6A] font-medium">
            It may have been removed, unpublished, or temporarily unavailable from the backend catalog.
          </p>
          <button
            onClick={() => navigateToPage('shop')}
            className="px-10 py-4 bg-black text-white rounded-full text-[12px] font-black uppercase tracking-[0.2em] hover:bg-black/90 transition-colors"
          >
            back to shop
          </button>
        </div>
      </div>
    );
  }

  return <ProductPage product={product} lang={lang} onProductSelect={navigateToProduct} />;
};
