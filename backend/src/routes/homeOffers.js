import { Router } from "express";
import { offers, persistStore } from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function sortOffers(items) {
  return [...items].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));
}

router.get("/", (_req, res) => {
  res.json(sortOffers(offers.filter((offer) => offer.isActive)));
});

router.get("/all", requireAuth, (_req, res) => {
  res.json(sortOffers(offers));
});

router.post("/", requireAuth, (req, res) => {
  const offer = {
    ...req.body,
    id: req.body.id || `offer-${Date.now()}`,
    isActive: req.body.isActive !== false,
  };
  offers.unshift(offer);
  persistStore();
  res.status(201).json(offer);
});

router.put("/:id", requireAuth, (req, res) => {
  const index = offers.findIndex((offer) => offer.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Offer not found." });

  offers[index] = { ...offers[index], ...req.body, id: req.params.id };
  persistStore();
  return res.json(offers[index]);
});

router.delete("/:id", requireAuth, (req, res) => {
  const index = offers.findIndex((offer) => offer.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Offer not found." });

  offers.splice(index, 1);
  persistStore();
  return res.status(204).end();
});

export default router;
