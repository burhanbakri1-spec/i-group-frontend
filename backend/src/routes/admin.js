import { Router } from "express";
import { orders, productCatalog, users, workSessions } from "../data/store.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/summary", (_req, res) => {
  res.json({
    products: productCatalog.length,
    orders: orders.length,
    employees: users.filter((user) => user.role === "employee").length,
    customers: users.filter((user) => user.role === "customer").length,
    workSessions: workSessions.length,
  });
});

export default router;
