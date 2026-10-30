import express from "express";
import { products } from "../data/products.js";
import auth from "../middleware/auth.js";
const router = express.Router();
router.use(auth);
const currentCart = user => user.cart.map(item => ({ ...item, stock: products.find(p => p.id === item.id)?.stock ?? 0 }));
router.get("/", (req, res) => res.json({ ok: true, cart: currentCart(req.user) }));
router.post("/add", (req, res) => {
  const id = Number(req.body?.itemId);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ ok: false, message: "Choose a valid product." });
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ ok: false, message: "Product not found." });
  const item = req.user.cart.find(p => p.id === id);
  if ((item?.quantity ?? 0) >= product.stock) return res.status(409).json({ ok: false, message: "No more stock available.", availableStock: product.stock });
  if (item) item.quantity++;
  else req.user.cart.push({ ...product, quantity: 1 });
  res.status(item ? 200 : 201).json({ ok: true, cart: currentCart(req.user) });
});
router.put("/update", (req, res) => {
  const id = Number(req.body?.itemId);
  const quantity = Number(req.body?.quantity);
  if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(quantity) || quantity < 1) return res.status(400).json({ ok: false, message: "Quantity must be a positive whole number." });
  const item = req.user.cart.find(p => p.id === id);
  const product = products.find(p => p.id === id);
  if (!item || !product) return res.status(404).json({ ok: false, message: "Item not found in your cart." });
  if (quantity > product.stock) return res.status(409).json({ ok: false, message: "Quantity exceeds available stock.", availableStock: product.stock });
  item.quantity = quantity;
  res.json({ ok: true, cart: currentCart(req.user) });
});
router.delete("/remove/:productId", (req, res) => {
  const index = req.user.cart.findIndex(item => item.id === Number(req.params.productId));
  if (index < 0) return res.status(404).json({ ok: false, message: "Item not found in your cart." });
  req.user.cart.splice(index, 1);
  res.json({ ok: true, cart: currentCart(req.user) });
});
export default router;
