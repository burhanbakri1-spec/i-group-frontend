import { createApiClient, createRecorder, getListItems, makeResult, normalizeBaseUrl, summarizeResults, writeJson, writeMarkdown } from './api-client.mjs';
import { passIfOkEnvelope } from './assert-envelope.mjs';

const pickSlug = (items) => items.find((item) => typeof item?.slug === 'string' && item.slug.length > 0)?.slug ?? null;
const pickProductForCart = (products) => {
  return products.find((product) => product?.id && product?.stockStatus !== 'out_of_stock') ?? products.find((product) => product?.id) ?? null;
};

export const discoverCatalog = async ({ baseUrl = normalizeBaseUrl() } = {}) => {
  const recorder = createRecorder();
  const client = createApiClient({ baseUrl, recorder });
  const results = [];

  const productsResponse = await client.get('/api/v1/products', { query: { page: 1, limit: 10, active: true } });
  results.push(passIfOkEnvelope('Discover products list', productsResponse));
  const products = getListItems(productsResponse.payload);

  const categoriesResponse = await client.get('/api/v1/categories', { query: { page: 1, limit: 10, isActive: true } });
  results.push(passIfOkEnvelope('Discover categories list', categoriesResponse));
  const categories = getListItems(categoriesResponse.payload);

  const rootsResponse = await client.get('/api/v1/categories/roots');
  results.push(passIfOkEnvelope('Discover root categories', rootsResponse));
  const roots = getListItems(rootsResponse.payload);

  const brandsResponse = await client.get('/api/v1/brands', { query: { page: 1, limit: 10, isActive: true } });
  results.push(passIfOkEnvelope('Discover brands list', brandsResponse));
  const brands = getListItems(brandsResponse.payload);

  const cartProduct = pickProductForCart(products);
  const defaultVariant = cartProduct?.variants?.find((variant) => variant?.isDefault) ?? cartProduct?.variants?.[0] ?? null;
  const discovered = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    productSlug: pickSlug(products),
    categorySlug: pickSlug(categories) ?? pickSlug(roots),
    brandSlug: pickSlug(brands),
    cartCandidate: cartProduct
      ? { productId: cartProduct.id, productSlug: cartProduct.slug, variantId: defaultVariant?.id ?? null, variantName: defaultVariant?.name ?? null }
      : null,
    counts: { products: products.length, categories: categories.length, roots: roots.length, brands: brands.length },
    requests: recorder.entries(),
    results,
  };
  if (!products.length) results.push(makeResult('Discovered product data', 'SKIP', { message: 'No products returned from live catalog.' }));
  await writeJson('discovered-catalog.json', discovered);
  await writeMarkdown('discover-catalog-report.md', summarizeResults('Catalog Discovery Report', results));
  return discovered;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const discovered = await discoverCatalog();
  console.log(JSON.stringify(discovered, null, 2));
}
