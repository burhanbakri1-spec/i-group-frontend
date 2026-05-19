import { Router } from "express";
import { orders, persistStore } from "../data/store.js";
import { publicUser, requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", (req, res) => {
  if (req.user.role === "admin" || req.user.permissions?.includes("orders.view")) {
    if (req.user.role === "employee") {
      return res.json(
        orders.filter(
          (order) =>
            order.handledByEmployeeId === req.user.id ||
            order.assignedToEmployeeId === req.user.id ||
            order.createdByEmployeeId === req.user.id,
        ),
      );
    }
    return res.json(orders);
  }
  return res.status(403).json({ message: "Orders access denied." });
});

router.get("/my-orders", (req, res) => {
  res.json(orders.filter((order) => order.customerUserId === req.user.id));
});

router.post("/", (req, res) => {
  const order = {
    id: `ORD-${Date.now()}`,
    customer: req.body.customer || {},
    customerUserId: req.user.role === "customer" ? req.user.id : req.body.customerUserId || null,
    items: req.body.items || [],
    subtotal: Number(req.body.subtotal || req.body.total || 0),
    total: Number(req.body.total || req.body.subtotal || 0),
    paymentMethod: req.body.paymentMethod || "Cash on delivery",
    status: "Pending",
    handledByEmployeeId: req.user.role === "employee" ? req.user.id : "",
    assignedToEmployeeId: req.user.role === "employee" ? req.user.id : "",
    createdByEmployeeId:
      req.user.role === "employee" ? req.user.id : req.body.createdByEmployeeId || "",
    createdByEmployeeName:
      req.user.role === "employee" ? req.user.name : req.body.createdByEmployeeName || "",
    createdBy: publicUser(req.user),
    lastUpdatedBy: publicUser(req.user),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.unshift(order);
  persistStore();
  res.status(201).json(order);
});

router.put("/:id/status", (req, res) => {
  const order = orders.find((entry) => entry.id === req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found." });

  order.status = req.body.status || order.status;
  order.lastUpdatedBy = publicUser(req.user);
  order.updatedAt = new Date().toISOString();
  persistStore();
  return res.json(order);
});

router.put("/:id/assign-employee", (req, res) => {
  const order = orders.find((entry) => entry.id === req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found." });

  order.handledByEmployeeId = req.body.employeeId || "";
  order.assignedToEmployeeId = req.body.employeeId || "";
  order.lastUpdatedBy = publicUser(req.user);
  order.updatedAt = new Date().toISOString();
  persistStore();
  return res.json(order);
});

router.delete("/:id", (req, res) => {
  const index = orders.findIndex((entry) => entry.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Order not found." });

  orders.splice(index, 1);
  persistStore();
  return res.status(204).end();
});

export default router;
