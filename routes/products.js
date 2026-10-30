import express from "express";
import { products } from "../data/products.js";
const router = express.Router();
router.get("/", (req, res) => {
  const { search = "", category = "", sort = "" } = req.query;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 5);
  const min = Number(req.query.minPrice ?? 0);
  const max = req.query.maxPrice === undefined ? Infinity : Number(req.query.maxPrice);
  if (Object.values(req.query).some(value => typeof value !== "string") || !Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100 || !Number.isFinite(min) || min < 0 || (max !== Infinity && !Number.isFinite(max)) || max < min || !["", "low", "high"].includes(sort)) {
    return res.status(400).json({ ok: false, message: "Check your filters, price range, and page number." });
  }
  let matches = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) && (!category || p.category === category) && p.price >= min && p.price <= max);
  if (sort) matches.sort((a, b) => sort === "low" ? a.price - b.price : b.price - a.price);
  const total = matches.length;
  res.json({ ok: true, productArray: matches.slice((page - 1) * limit, page * limit), total, page, totalPages: Math.ceil(total / limit) });
});
router.get("/:id", (req, res) => {
  const productObj = products.find(p => p.id === Number(req.params.id));
  if (!productObj) return res.status(404).json({ ok: false, message: "Product not found." });
  res.json({ ok: true, productObj });
});
export default router;
