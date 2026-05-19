import { products as frontendProducts } from "../../../src/data/products.js";

export const products = frontendProducts.map((product) => ({
  ...product,
  sizes: product.sizes.map((size) => ({ ...size })),
  badge: { ...product.badge },
  name: { ...product.name },
  shortDescription: { ...product.shortDescription },
  longDescription: { ...product.longDescription },
  usageNotes: { ...product.usageNotes },
}));
