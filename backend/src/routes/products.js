import { Router } from "express";
import { persistStore, productCatalog } from "../data/store.js";

const router = Router();

function normalizeProduct(product) {
  const image = product.image || "/images/products/product-placeholder.svg";
  const hoverImage =
    product.hoverImage ||
    product.secondaryImage ||
    product.gallery?.[1] ||
    "";

  return {
    ...product,
    image,
    hoverImage,
    fallbackImage: product.fallbackImage || "/images/products/product-placeholder.svg",
  };
}

router.get("/", (_req, res) => {
  res.json(productCatalog.map(normalizeProduct));
});

router.post("/", (req, res) => {
  const product = normalizeProduct({
    ...req.body,
    id: req.body.id || `product-${Date.now()}`,
    slug: req.body.slug || `product-${Date.now()}`,
  });
  productCatalog.unshift(product);
  persistStore();
  res.status(201).json(product);
});

router.put("/:id", (req, res) => {
  const index = productCatalog.findIndex((product) => product.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found." });
  }
  productCatalog[index] = normalizeProduct({
    ...productCatalog[index],
    ...req.body,
    id: req.params.id,
  });
  persistStore();
  return res.json(productCatalog[index]);
});

router.delete("/:id", (req, res) => {
  const index = productCatalog.findIndex((product) => product.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found." });
  }
  productCatalog.splice(index, 1);
  persistStore();
  return res.status(204).end();
});

export default router;
