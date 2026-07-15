import { apiRequest } from "./api.js";

let currentPage = 1;
const limit = 8;

async function loadProducts(page = 1) {
  currentPage = page;

  const search = document.getElementById("search-input").value.trim();
  const sort = document.getElementById("sort-select").value;
  const category = document.getElementById("category-select").value;
  const minPrice = document.getElementById("min-price").value;
  const maxPrice = document.getElementById("max-price").value;

  let query = `?page=${page}&limit=${limit}`;
  if (search) query += `&search=${encodeURIComponent(search)}`;
  if (sort) query += `&sort=${sort}`;
  if (category) query += `&category=${encodeURIComponent(category)}`;
  if (minPrice) query += `&minPrice=${minPrice}`;
  if (maxPrice) query += `&maxPrice=${maxPrice}`;

  const res = await apiRequest(`/products${query}`);
  const list = document.getElementById("product-list");

  if (!res.ok || !res.productArray || res.productArray.length === 0) {
    list.innerHTML = `<p id="no-results">No products found.</p>`;
    updatePaginationButtons(page, 0);
    return;
  }

  list.innerHTML = res.productArray
    .map(
      (p) => `
    <div class="product-card">
      <a href="/product.html?id=${p.id}">
        <img src="${p.image}" alt="${p.name}" class="product-image">
      </a>
      <h3><a href="/product.html?id=${p.id}">${p.name}</a></h3>
      <p class="price">₹${p.price}</p>
      <p class="category">${p.category}</p>
      <button class="add-cart-btn" data-id="${p.id}">Add to Cart</button>
    </div>
  `,
    )
    .join("");

  document.querySelectorAll(".add-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.id));
  });

  updatePaginationButtons(page, res.productArray.length);
}

function updatePaginationButtons(page, resultCount) {
  document.getElementById("page-label").textContent = `Page ${page}`;
  document.getElementById("prev-btn").disabled = page <= 1;
  document.getElementById("next-btn").disabled = resultCount < limit;
}

async function addToCart(itemId) {
  const res = await apiRequest("/cart/add", "POST", { itemId: Number(itemId) });

  if (res.status === 401) {
    alert("Please login to add items to your cart.");
    window.location.href = "/login.html";
    return;
  }

  if (res.ok) {
    alert("Added to cart.");
  } else {
    alert(res.message || "Could not add to cart.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadProducts(1);

  document
    .getElementById("apply-filters-btn")
    .addEventListener("click", () => loadProducts(1));

  document.getElementById("search-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") loadProducts(1);
  });

  document
    .getElementById("prev-btn")
    .addEventListener("click", () => loadProducts(currentPage - 1));

  document
    .getElementById("next-btn")
    .addEventListener("click", () => loadProducts(currentPage + 1));
});
