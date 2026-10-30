import express from "express";
import { orders, orderIdCount, incrementOrderIdCount } from "../data/orders.js";
import { products } from "../data/products.js";
import auth from "../middleware/auth.js";
const router = express.Router();
router.use(auth);
router.post("/", (req, res) => {
  const cart = req.user.cart;
  if (!cart.length) return res.status(400).json({ ok: false, message: "Your cart is empty." });
  // Validate every item before changing any stock. No awaits between validation and commit.
  for (const item of cart) {
    const product = products.find(p => p.id === item.id);
    if (!product || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > product.stock) {
      return res.status(409).json({ ok: false, message: `${item.name} is no longer available in that quantity. Please update your cart.` });
    }
  }
  const items = cart.map(item => ({ ...products.find(p => p.id === item.id), quantity: item.quantity }));
  const orderObj = { id: orderIdCount, userId: req.user.id, items, total: items.reduce((sum, item) => sum + item.price * item.quantity, 0) };
  for (const item of items) products.find(p => p.id === item.id).stock -= item.quantity;
  incrementOrderIdCount();
  orders.push(orderObj);
  req.user.cart.length = 0;
  res.status(201).json({ ok: true, message: "Order placed successfully.", orderObj });
});
router.get("/", (req, res) => res.json({ ok: true, userOrders: orders.filter(order => order.userId === req.user.id) }));
router.get("/:id", (req, res) => {
  const order = orders.find(order => order.id === Number(req.params.id) && order.userId === req.user.id);
  if (!order) return res.status(404).json({ ok: false, message: "Order not found." });
  res.json({ ok: true, order });
});
export default router;
