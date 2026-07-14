import express from "express";
import { products } from "../data/products.js";

const router = express.Router();

// Matches: http://localhost:3000/getProducts?search=apple&page=2
//1. get data list using query filters by client
router.get("/", (req, res) => {
  let productArray = [...products];
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const search = req.query.search || "";
  const sort = req.query.sort || "";
  const category = req.query.category || "";
  const minPrice = Number(req.query.minPrice) || 0;
  const maxPrice = Number(req.query.maxPrice) || Infinity;

  productArray = sortByPrice(sort, productArray);
  productArray = filterCategory(category, productArray);
  productArray = filterMinPrice(minPrice, productArray);
  productArray = filterMaxPrice(maxPrice, productArray);
  productArray = searchProduct(search, productArray);
  productArray = productPagination(page, limit, productArray);

  return res.status(200).send({
    ok: true,
    message: "succesful",
    productArray,
  });
});

function sortByPrice(sort, productArray) {
  if (sort == "low") productArray.sort((a, b) => a.price - b.price);
  else if (sort == "high") productArray.sort((a, b) => b.price - a.price);
  return productArray;
}
function filterCategory(category, productArray) {
  if (category.length !== 0)
    productArray = productArray.filter(
      (product) => product.category == category,
    );
  return productArray;
}
function filterMinPrice(minPrice, productArray) {
  productArray = productArray.filter((product) => product.price >= minPrice);
  return productArray;
}
function filterMaxPrice(maxPrice, productArray) {
  productArray = productArray.filter((product) => product.price <= maxPrice);
  return productArray;
}
function searchProduct(search, productArray) {
  return productArray.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()),
  );
}
function productPagination(page, limit, productArray) {
  return productArray.slice((page - 1) * limit, page * limit);
}

// 2. get single product using id
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const productObj = products.find((product) => product.id === id);
  if (productObj !== undefined)
    return res.status(200).send({ ok: true, productObj });
  else return res.status(404).send({ ok: false, message: "product not found" });
});

export default router;
