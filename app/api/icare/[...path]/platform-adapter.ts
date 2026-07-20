import { NextRequest, NextResponse } from 'next/server';
import { platformApiOrigin } from '../../../icare/lib/platform-origin';

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const localized = (value: unknown) => {
  if (typeof value === 'string') return { en: value, ar: value };
  if (!isRecord(value)) return { en: '', ar: '' };
  return {
    en: typeof value.en === 'string' ? value.en : '',
    ar: typeof value.ar === 'string' ? value.ar : '',
  };
};

const numeric = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const platformApiBaseUrl = platformApiOrigin;

const PLACEHOLDER_PATTERNS = [
  '/images/products/product-placeholder',
  '/images/product-placeholder',
  '/product-placeholder',
  'placeholder.svg',
];

const isKnownPlaceholder = (value: string): boolean =>
  PLACEHOLDER_PATTERNS.some((pattern) => value.includes(pattern));

const absoluteMediaUrl = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return '';
  if (isKnownPlaceholder(value)) return '';
  return /^https?:\/\//i.test(value)
    ? value
    : new URL(value, platformApiBaseUrl()).toString();
};

export const envelope = (data: unknown, message = 'OK') => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString(),
});

const errorEnvelope = (message: string) => ({
  success: false,
  message,
  data: null,
  timestamp: new Date().toISOString(),
});

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Platform API returned invalid JSON (HTTP ${response.status}).`);
  }
}

function requestStorefront(request: NextRequest) {
  const referer = request.headers.get('referer');
  let refererUrl: URL | null = null;
  try {
    refererUrl = referer ? new URL(referer) : null;
  } catch {
    refererUrl = null;
  }
  return {
    host: process.env.NEXT_PUBLIC_STOREFRONT_HOST?.trim()
      || request.headers.get('x-forwarded-host')
      || request.nextUrl.host,
    path: refererUrl?.pathname || '/icare',
  };
}

export async function resolveTenant(request: NextRequest) {
  const { host, path } = requestStorefront(request);
  const url = new URL('/api/company/resolve-storefront', platformApiBaseUrl());
  url.searchParams.set('host', host);
  url.searchParams.set('path', path);
  const response = await fetch(url, { cache: 'no-store' });
  const body = await parseJson(response);
  if (!response.ok || !isRecord(body) || body.status !== 'active') {
    throw Object.assign(new Error('Storefront company not found or inactive.'), { status: response.status || 404 });
  }
  const storefrontPath = typeof body.storefrontPath === 'string' ? body.storefrontPath : '';
  if (!storefrontPath || (path !== storefrontPath && !path.startsWith(`${storefrontPath}/`))) {
    throw Object.assign(new Error('Resolved storefront does not match the requested path.'), { status: 403 });
  }
  return body;
}

async function platformFetch(
  request: NextRequest,
  companyId: string,
  path: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  headers.set('X-Company-Id', companyId);
  const authorization = request.headers.get('authorization');
  if (authorization) headers.set('Authorization', authorization);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(new URL(path, platformApiBaseUrl()), { ...init, headers, cache: 'no-store' });
}

async function platformJson(
  request: NextRequest,
  companyId: string,
  path: string,
  init: RequestInit = {},
) {
  const response = await platformFetch(request, companyId, path, init);
  const body = await parseJson(response);
  if (!response.ok) {
    const message = isRecord(body) && typeof body.message === 'string'
      ? body.message
      : `Platform API request failed (HTTP ${response.status}).`;
    throw Object.assign(new Error(message), { status: response.status });
  }
  return body;
}

function mapCategory(category: JsonRecord) {
  return {
    id: category.id,
    slug: category.slug,
    name: localized(category.name),
    description: localized(category.description),
    image: absoluteMediaUrl(category.imageUrl),
    parentId: category.parentId ?? null,
    isActive: category.isActive !== false,
  };
}

function mapBrand(brand: JsonRecord) {
  return {
    id: brand.id,
    slug: brand.slug,
    name: typeof brand.name === 'string' ? { en: brand.name, ar: brand.name } : localized(brand.name),
    country: brand.country ?? null,
    logo: absoluteMediaUrl(brand.logoUrl),
    isActive: brand.isActive !== false,
  };
}

function mapVariant(variant: JsonRecord, index: number) {
  const stock = numeric(variant.stock ?? variant.stockQty ?? variant.stockQuantity);
  return {
    id: variant.id ?? `variant-${index}`,
    name: localized(variant.name ?? variant.size ?? variant.color_name ?? variant.colorName ?? 'Default'),
    sku: variant.sku ?? null,
    image: absoluteMediaUrl(variant.image_url ?? variant.imageUrl ?? variant.image),
    size: variant.size ?? null,
    price: numeric(variant.price),
    salePrice: variant.salePrice == null ? null : numeric(variant.salePrice),
    stockQuantity: stock,
    stockStatus: stock > 0 ? 'in_stock' : 'out_of_stock',
    isActive: variant.isActive !== false && variant.is_active !== false,
    isDefault: index === 0,
  };
}

function mapProduct(
  product: JsonRecord,
  categories: Map<string, JsonRecord>,
  brands: Map<string, JsonRecord>,
) {
  const fields = isRecord(product.fields) ? product.fields : {};
  const category = categories.get(String(product.categoryId ?? ''));
  const brand = brands.get(String(product.brandId ?? ''));
  const variants = Array.isArray(product.variants)
    ? product.variants.filter(isRecord).map(mapVariant)
    : [];
  const gallery = Array.isArray(product.gallery_images)
    ? product.gallery_images
    : Array.isArray(product.galleryImages)
      ? product.galleryImages
      : [];
  const images = gallery.map((entry, index) => {
    const record = isRecord(entry) ? entry : {};
    const value = isRecord(entry) ? record.image_url ?? record.image ?? record.url : entry;
    return {
      imageUrl: absoluteMediaUrl(value),
      sortOrder: numeric(record.sort_order ?? record.sortOrder, index),
      mediaType: 'IMAGE',
    };
  }).filter((entry) => entry.imageUrl);
  const firstVariant = variants[0];
  return {
    ...product,
    id: product.id,
    slug: product.slug,
    name: localized(product.name),
    shortDescription: localized(product.shortDescription ?? product.short_description),
    description: localized(product.description ?? product.fullDescription),
    howToUse: fields.howToUse ?? product.howToUse ?? null,
    ingredients: Array.isArray(fields.featuredIngredients)
      ? fields.featuredIngredients
      : typeof fields.ingredients === 'string'
        ? fields.ingredients.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean)
        : product.ingredients ?? [],
    benefits: Array.isArray(fields.benefits) ? fields.benefits : product.benefits ?? [],
    skinTypes: Array.isArray(fields.skinTypes) ? fields.skinTypes : product.skinTypes ?? [],
    hairTypes: Array.isArray(fields.hairTypes) ? fields.hairTypes : [],
    warnings: fields.warnings ?? null,
    suitableFor: fields.suitableFor ?? [],
    productType: fields.productType ?? null,
    finish: fields.finish ?? null,
    coverage: fields.coverage ?? null,
    texture: fields.texture ?? null,
    countryOfOrigin: fields.countryOfOrigin ?? null,
    productFaqs: Array.isArray(fields.faqs) ? fields.faqs : [],
    showcaseUnits: fields.showcaseUnits ?? [],
    seo: { title: fields.metaTitle ?? null, description: fields.metaDescription ?? null, canonicalUrl: fields.canonicalUrl ?? null },
    price: numeric(product.price ?? product.primaryPrice ?? firstVariant?.price),
    salePrice: product.salePrice == null ? null : numeric(product.salePrice),
    primaryImage: absoluteMediaUrl(product.image ?? product.primaryImage),
    secondaryImage: absoluteMediaUrl(product.hoverImage ?? product.secondaryImage),
    videoUrl: absoluteMediaUrl(fields.videoUrl ?? product.videoUrl),
    stockQuantity: product.isActive === false
      ? Math.max(numeric(product.stockQty), 0)
      : Math.max(variants.filter((v) => v.isActive !== false).reduce((total, v) => total + numeric(v.stockQuantity), 0), numeric(product.stockQty)),
    stockStatus: product.isActive === false
      ? 'out_of_stock'
      : variants.filter((v) => v.isActive !== false && v.stockStatus !== 'out_of_stock').length === 0
        ? 'out_of_stock'
        : 'in_stock',
    isFeatured: product.featured === true || product.isFeatured === true,
    isNew: product.isNew === true || product.newArrival === true,
    isBestseller: product.isBestseller === true || product.bestseller === true,
    category: category ? mapCategory(category) : null,
    brand: brand ? mapBrand(brand) : null,
    variants,
    images,
    fields,
  };
}

async function catalogSnapshot(request: NextRequest, companyId: string) {
  const [products, categories, brands] = await Promise.all([
    platformJson(request, companyId, '/api/products'),
    platformJson(request, companyId, '/api/categories'),
    platformJson(request, companyId, '/api/brands'),
  ]);
  const categoryRows = Array.isArray(categories) ? categories.filter(isRecord) : [];
  const brandRows = Array.isArray(brands) ? brands.filter(isRecord) : [];
  const categoryMap = new Map(categoryRows.map((row) => [String(row.id), row]));
  const brandMap = new Map(brandRows.map((row) => [String(row.id), row]));
  return {
    products: (Array.isArray(products) ? products.filter(isRecord) : []).map((row) => mapProduct(row, categoryMap, brandMap)),
    categories: categoryRows.map(mapCategory),
    brands: brandRows.map(mapBrand),
  };
}

function mapAuthSession(body: JsonRecord) {
  return {
    accessToken: typeof body.token === 'string' ? body.token : '',
    refreshToken: '',
    tokenType: 'Bearer',
    expiresIn: 86400,
    user: body.user,
  };
}

function cartEnvelope(items: JsonRecord[], products: JsonRecord[]) {
  const productMap = new Map(products.map((product) => [String(product.id), product]));
  const mapped = items.map((item, index) => {
    const product = productMap.get(String(item.productId));
    if (!product) return null;
    const variants = Array.isArray(product.variants) ? product.variants.filter(isRecord) : [];
    const variant = variants.find((entry) => String(entry.id) === String(item.variantId)) ?? null;
    return {
      id: item.id ?? `cart-${index}`,
      quantity: Math.max(1, numeric(item.quantity, 1)),
      product,
      variant,
    };
  }).filter(Boolean) as JsonRecord[];
  const subtotal = mapped.reduce((total, item) => {
    const variant = isRecord(item.variant) ? item.variant : {};
    const product = isRecord(item.product) ? item.product : {};
    return total + numeric(variant.salePrice ?? variant.price ?? product.salePrice ?? product.price) * numeric(item.quantity);
  }, 0);
  return {
    items: mapped,
    summary: {
      itemCount: mapped.length,
      totalQuantity: mapped.reduce((total, item) => total + numeric(item.quantity), 0),
      subtotal,
    },
  };
}

async function readCart(request: NextRequest, companyId: string) {
  const [items, catalog] = await Promise.all([
    platformJson(request, companyId, '/api/cart'),
    catalogSnapshot(request, companyId),
  ]);
  return {
    rawItems: Array.isArray(items) ? items.filter(isRecord) : [],
    catalog,
  };
}

function mapOrder(order: JsonRecord) {
  const items = Array.isArray(order.items) ? order.items.filter(isRecord) : [];
  const customer = isRecord(order.customer) ? order.customer : {};
  return {
    ...order,
    id: order.id,
    orderNumber: order.id,
    shippingCost: numeric(order.delivery_price),
    tax: 0,
    discount: numeric(order.discountFromPoints),
    itemCount: items.length,
    shippingName: customer.name ?? '',
    shippingAddress: customer.address ?? '',
    shippingCity: customer.city ?? '',
    shippingPhone: customer.phone ?? '',
  };
}

const jsonResponse = (data: unknown, status = 200) =>
  NextResponse.json(envelope(data), { status });

export async function handlePlatformRequest(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  try {
    const tenant = await resolveTenant(request);
    const companyId = String(tenant.id);
    const pathname = `/${pathSegments.join('/')}`.replace(/\/+$/, '');
    const path = pathname.startsWith('/api/v1/') ? pathname.slice('/api/v1'.length) : pathname;
    const method = request.method;
    const body = method === 'GET' || method === 'HEAD'
      ? null
      : await request.json().catch(() => ({}));

    if (path === '/products' && method === 'GET') return jsonResponse((await catalogSnapshot(request, companyId)).products);
    if (/^\/products\/(featured|new|bestsellers|on-sale)$/.test(path) && method === 'GET') {
      const kind = path.split('/').pop();
      const products = (await catalogSnapshot(request, companyId)).products;
      const filtered = products.filter((product) => (
        kind === 'featured' ? product.isFeatured
          : kind === 'new' ? product.isNew
            : kind === 'bestsellers' ? product.isBestseller
              : product.salePrice != null && numeric(product.salePrice) < numeric(product.price)
      ));
      return jsonResponse(filtered.slice(0, Math.max(1, numeric(request.nextUrl.searchParams.get('limit'), 8))));
    }
    const relatedMatch = path.match(/^\/products\/([^/]+)\/related$/);
    if (relatedMatch) {
      const products = (await catalogSnapshot(request, companyId)).products;
      const current = products.find((entry) => entry.slug === decodeURIComponent(relatedMatch[1]));
      return jsonResponse(products.filter((entry) => entry.id !== current?.id && (
        !current || entry.category?.id === current.category?.id
      )).slice(0, 8));
    }
    const reviewMatch = path.match(/^\/products\/([^/]+)\/reviews$/);
    if (reviewMatch) {
      const product = (await catalogSnapshot(request, companyId)).products.find(
        (entry) => entry.slug === decodeURIComponent(reviewMatch[1]),
      );
      if (!product) return NextResponse.json(errorEnvelope('Product not found.'), { status: 404 });
      if (method === 'GET') return jsonResponse(await platformJson(request, companyId, `/api/reviews/product/${encodeURIComponent(String(product.id))}`));
      if (method === 'POST') {
        const result = await platformJson(request, companyId, '/api/reviews', {
          method: 'POST',
          body: JSON.stringify({ ...(isRecord(body) ? body : {}), type: 'product', productId: product.id }),
        });
        return jsonResponse(result, 201);
      }
    }
    const showcaseMatch = path.match(/^\/products\/([^/]+)\/showcase$/);
    if (showcaseMatch && method === 'GET') {
      const key = decodeURIComponent(showcaseMatch[1]);
      const catalog = await catalogSnapshot(request, companyId);
      const product = catalog.products.find((entry) => entry.slug === key || String(entry.id) === key);
      if (!product) return NextResponse.json(errorEnvelope('Product not found.'), { status: 404 });
      const details = await platformJson(request, companyId, `/api/products/${encodeURIComponent(String(product.id))}/details`);
      const fields = isRecord(details) && isRecord(details.fields) ? details.fields : {};
      return jsonResponse(Array.isArray(fields.showcaseUnits) ? fields.showcaseUnits : []);
    }
    const productMatch = path.match(/^\/products\/([^/]+)$/);
    if (productMatch && method === 'GET') {
      const key = decodeURIComponent(productMatch[1]);
      const product = (await catalogSnapshot(request, companyId)).products.find(
        (entry) => entry.slug === key || String(entry.id) === key,
      );
      if (!product) return NextResponse.json(errorEnvelope('Product not found.'), { status: 404 });
      const details = await platformJson(request, companyId, `/api/products/${encodeURIComponent(String(product.id))}/details`);
      return jsonResponse({
        ...mapProduct(isRecord(details) ? details : product, new Map(), new Map()),
        category: product.category,
        brand: product.brand,
      });
    }

    if (path === '/categories' || path === '/categories/roots') {
      const rows = (await catalogSnapshot(request, companyId)).categories;
      return jsonResponse(path.endsWith('/roots') ? rows.filter((entry) => !entry.parentId) : rows);
    }
    const categoryChildren = path.match(/^\/categories\/([^/]+)\/children$/);
    if (categoryChildren) {
      const rows = (await catalogSnapshot(request, companyId)).categories;
      const parent = rows.find((entry) => entry.slug === decodeURIComponent(categoryChildren[1]));
      return jsonResponse(parent ? rows.filter((entry) => String(entry.parentId) === String(parent.id)) : []);
    }
    const categoryDetail = path.match(/^\/categories\/([^/]+)$/);
    if (categoryDetail) {
      const row = (await catalogSnapshot(request, companyId)).categories.find(
        (entry) => entry.slug === decodeURIComponent(categoryDetail[1]),
      );
      return row ? jsonResponse(row) : NextResponse.json(errorEnvelope('Category not found.'), { status: 404 });
    }
    if (path === '/brands') return jsonResponse((await catalogSnapshot(request, companyId)).brands);
    const brandDetail = path.match(/^\/brands\/([^/]+)$/);
    if (brandDetail) {
      const row = (await catalogSnapshot(request, companyId)).brands.find(
        (entry) => entry.slug === decodeURIComponent(brandDetail[1]),
      );
      return row ? jsonResponse(row) : NextResponse.json(errorEnvelope('Brand not found.'), { status: 404 });
    }

    if (path === '/content') {
      const [texts, media] = await Promise.all([
        platformJson(request, companyId, '/api/website-texts'),
        platformJson(request, companyId, '/api/website-media'),
      ]);
      const en: Record<string, string> = {};
      const ar: Record<string, string> = {};
      for (const item of Array.isArray(texts) ? texts.filter(isRecord) : []) {
        if (typeof item.key !== 'string') continue;
        en[item.key] = typeof item.valueEn === 'string' ? item.valueEn : '';
        ar[item.key] = typeof item.valueAr === 'string' ? item.valueAr : en[item.key];
      }
      for (const item of Array.isArray(media) ? media.filter(isRecord) : []) {
        if (item.isHidden === true || typeof item.sectionKey !== 'string') continue;
        const mediaUrl = absoluteMediaUrl(item.imageUrl ?? item.fallbackImageUrl);
        if (mediaUrl) en[item.sectionKey] = ar[item.sectionKey] = mediaUrl;
      }
      return jsonResponse({ en, ar, version: new Date().toISOString() });
    }
    if (path === '/settings' || path.startsWith('/settings/')) {
      const context = await platformJson(request, companyId, '/api/company/context');
      const settings = isRecord(context) && isRecord(context.settings) ? context.settings : {};
      const general = Object.fromEntries(Object.entries(settings).map(([key, value]) => [
        key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`),
        String(value ?? ''),
      ]));
      general.site_name = isRecord(context) ? String(context.name ?? '') : '';
      return jsonResponse({ settings: { general }, groups: { general } });
    }
    if (path === '/social-links') {
      const context = await platformJson(request, companyId, '/api/company/context');
      const settings = isRecord(context) && isRecord(context.settings) ? context.settings : {};
      return jsonResponse(isRecord(settings.socialLinks) ? settings.socialLinks : {});
    }

    if (path === '/auth/login' || path === '/auth/register') {
      const result = await platformJson(request, companyId, path === '/auth/login' ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(body ?? {}),
      });
      return jsonResponse(isRecord(result) ? mapAuthSession(result) : result, path.endsWith('/register') ? 201 : 200);
    }
    if (path === '/auth/me') {
      const result = await platformJson(request, companyId, '/api/auth/me');
      return jsonResponse(isRecord(result) && isRecord(result.user) ? result.user : result);
    }
    if (path === '/auth/logout') {
      await platformJson(request, companyId, '/api/auth/logout', { method: 'POST', body: '{}' });
      return jsonResponse({ message: 'Signed out.' });
    }
    if (path === '/auth/refresh') {
      return NextResponse.json(errorEnvelope('Session refresh is not supported; sign in again.'), { status: 401 });
    }

    if (path === '/dropshipping' || path.startsWith('/dropshipping/')) {
      const response = await platformFetch(request, companyId, `/api${path}${request.nextUrl.search}`, {
        method,
        ...(body === null ? {} : { body: JSON.stringify(body) }),
      });
      const result = await parseJson(response);
      if (!response.ok) {
        const message = isRecord(result) && typeof result.message === 'string' ? result.message : 'Dropshipping request failed.';
        return NextResponse.json(errorEnvelope(message), { status: response.status });
      }
      return jsonResponse(result, response.status);
    }

    if (path === '/cart') {
      if (method === 'GET') {
        const { rawItems, catalog } = await readCart(request, companyId);
        return jsonResponse(cartEnvelope(rawItems, catalog.products as JsonRecord[]));
      }
      if (method === 'POST') {
        const { rawItems, catalog } = await readCart(request, companyId);
        const input = isRecord(body) ? body : {};
        const existing = rawItems.find((item) =>
          String(item.productId) === String(input.productId)
          && String(item.variantId ?? '') === String(input.variantId ?? ''));
        const nextItems = existing
          ? rawItems.map((item) => item === existing ? { ...item, quantity: numeric(item.quantity, 1) + numeric(input.quantity, 1) } : item)
          : [...rawItems, { id: `cart-${Date.now()}`, productId: input.productId, variantId: input.variantId ?? null, quantity: numeric(input.quantity, 1) }];
        const saved = await platformJson(request, companyId, '/api/cart', { method: 'PUT', body: JSON.stringify({ items: nextItems }) });
        return jsonResponse(cartEnvelope(Array.isArray(saved) ? saved.filter(isRecord) : nextItems, catalog.products as JsonRecord[]));
      }
    }
    const cartItem = path.match(/^\/cart\/([^/]+)$/);
    if (cartItem && (method === 'PUT' || method === 'DELETE')) {
      const { rawItems, catalog } = await readCart(request, companyId);
      const id = decodeURIComponent(cartItem[1]);
      const nextItems = method === 'DELETE'
        ? rawItems.filter((item) => String(item.id) !== id)
        : rawItems.map((item) => String(item.id) === id ? { ...item, quantity: numeric(isRecord(body) ? body.quantity : 1, 1) } : item);
      const saved = await platformJson(request, companyId, '/api/cart', { method: 'PUT', body: JSON.stringify({ items: nextItems }) });
      return jsonResponse(cartEnvelope(Array.isArray(saved) ? saved.filter(isRecord) : nextItems, catalog.products as JsonRecord[]));
    }
    if (path === '/cart/clear') {
      await platformFetch(request, companyId, '/api/cart', { method: 'DELETE' });
      return jsonResponse(cartEnvelope([], []));
    }
    if (path === '/cart/sync-prices') {
      const { rawItems, catalog } = await readCart(request, companyId);
      return jsonResponse(cartEnvelope(rawItems, catalog.products as JsonRecord[]));
    }
    if (path === '/orders/summary') {
      const { rawItems, catalog } = await readCart(request, companyId);
      const cart = cartEnvelope(rawItems, catalog.products as JsonRecord[]);
      return jsonResponse({ ...cart.summary, shipping: 0, tax: 0, discount: 0, total: cart.summary.subtotal });
    }
    if (path === '/orders' && method === 'POST') {
      const input = isRecord(body) ? body : {};
      const catalog = await catalogSnapshot(request, companyId);
      const productMap = new Map(catalog.products.map((product) => [String(product.id), product]));
      const items = (Array.isArray(input.items) ? input.items.filter(isRecord) : []).map((item) => {
        const product = productMap.get(String(item.productId));
        const variants = Array.isArray(product?.variants) ? product.variants : [];
        const variant = variants.find((entry) => String(entry.id) === String(item.variantId));
        const price = numeric(variant?.salePrice ?? variant?.price ?? product?.salePrice ?? product?.price);
        return {
          productId: item.productId,
          variantId: item.variantId ?? '',
          productName: localized(product?.name).en,
          slug: product?.slug ?? '',
          quantity: numeric(item.quantity, 1),
          price,
          lineTotal: price * numeric(item.quantity, 1),
        };
      });
      const result = await platformJson(request, companyId, '/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer: {
            name: input.shippingName,
            phone: input.shippingPhone ?? input.guestPhone,
            city: input.shippingCity,
            address: input.shippingAddress,
            notes: input.notes,
          },
          items,
          paymentMethod: input.paymentMethod === 'online' ? 'Online' : 'Cash on delivery',
        }),
      });
      return jsonResponse(isRecord(result) ? mapOrder(result) : result, 201);
    }
    if (path === '/orders' && method === 'GET') {
      const rows = await platformJson(request, companyId, '/api/orders/my-orders');
      return jsonResponse((Array.isArray(rows) ? rows.filter(isRecord) : []).map(mapOrder));
    }
    const orderDetail = path.match(/^\/orders\/([^/]+)$/);
    if (orderDetail && method === 'GET') {
      const rows = await platformJson(request, companyId, '/api/orders/my-orders');
      const order = (Array.isArray(rows) ? rows.filter(isRecord) : []).find(
        (entry) => String(entry.id) === decodeURIComponent(orderDetail[1]),
      );
      return order ? jsonResponse(mapOrder(order)) : NextResponse.json(errorEnvelope('Order not found.'), { status: 404 });
    }

    if (['/faq-categories', '/faqs', '/videos', '/video-categories', '/vlogs', '/stores', '/pages', '/announcements'].some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    )) return jsonResponse([]);

    return NextResponse.json(errorEnvelope('This storefront operation is not supported by the platform API.'), { status: 501 });
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error ? Number(error.status) : 502;
    const message = error instanceof Error ? error.message : 'Platform API request failed.';
    return NextResponse.json(errorEnvelope(message), { status: Number.isFinite(status) ? status : 502 });
  }
}
