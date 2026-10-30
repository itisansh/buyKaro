import "./select.js";
import { apiRequest } from "./api.js";
import { showToast } from "./toast.js";

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

  if (!res.ok) { showToast(res.message || "Could not load products.", "error"); return; }
  if (!res.productArray || res.productArray.length === 0) {
    list.innerHTML = `
      <div id="no-results" class="empty-state" style="display:flex; grid-column: 1 / -1;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.3-4.3"/><path d="M8 8l5 5"/></svg>
        <p>No products found. Try adjusting your search or filters.</p>
      </div>`;
    updatePaginationButtons(page, 0);
    return;
  }

  list.innerHTML = res.productArray
    .map(
      (p) => `
    <div class="product-card">
      <a href="/products/${p.id}">
        <img src="${p.image}" alt="${p.name}" class="product-image" loading="lazy" decoding="async" width="300" height="160" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 160%22%3E%3Crect width=%22300%22 height=%22160%22 fill=%22%23F0EDFC%22/%3E%3C/svg%3E'">
      </a>
      <h3><a href="/products/${p.id}">${p.name}</a></h3>
      <p class="price">₹${p.price}</p>
      <p class="category">${p.category}</p>
      <button class="add-cart-btn" data-id="${p.id}" ${p.stock === 0 ? "disabled" : ""}>${p.stock === 0 ? "Out of stock" : "Add to Cart"}</button>
    </div>
  `,
    )
    .join("");

  document.querySelectorAll(".add-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.id));
  });

  updatePaginationButtons(page, res.productArray.length, res.totalPages);
}

function updatePaginationButtons(page, resultCount, totalPages = 0) {
  document.getElementById("page-label").textContent = `Page ${page}`;
  document.getElementById("prev-btn").disabled = page <= 1;
  document.getElementById("next-btn").disabled = page >= totalPages;
}

async function addToCart(itemId) {
  const res = await apiRequest("/cart/add", "POST", { itemId: Number(itemId) });

  if (res.status === 401) {
    showToast("Please login to add items to your cart.", "info");
    setTimeout(() => {
      window.location.href = "/login";
    }, 700);
    return;
  }

  if (res.ok) {
    showToast("Added to cart.", "success");
  } else {
    showToast(res.message || "Could not add to cart.", "error");
  }
}

// Keeps the "Filters" button badge in sync with how many advanced filters are active.
function updateFilterBadge() {
  const minPrice = document.getElementById("min-price").value;
  const maxPrice = document.getElementById("max-price").value;
  const activeCount = (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  const filterBtn = document.getElementById("advanced-filter-btn");
  const filterCount = document.getElementById("filter-count");

  filterCount.textContent = activeCount;
  filterBtn.classList.toggle("has-filters", activeCount > 0);
}

function closeFilterPanel() {
  document.getElementById("advanced-filter-panel").classList.remove("open");
  document.getElementById("advanced-filter-btn").setAttribute("aria-expanded", "false");
}

document.addEventListener("DOMContentLoaded", () => {
  // Old hash bookmarks also resolve to the new shop route.
  if (window.location.hash === "#shop") history.replaceState(null, "", "/shop");
  if (window.location.pathname.replace(/\/$/, "") === "/shop") {
    document.querySelector(".store-hero").hidden = true;
    document.title = "Shop — buyKaro.";
  }
  loadProducts(1);

  const filterBtn = document.getElementById("advanced-filter-btn");
  const filterPanel = document.getElementById("advanced-filter-panel");

  filterBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = filterPanel.classList.toggle("open");
    filterBtn.setAttribute("aria-expanded", String(isOpen));
  });

  // Clicking anywhere outside the panel closes it.
  document.addEventListener("click", (e) => {
    if (!filterPanel.contains(e.target) && e.target !== filterBtn) {
      closeFilterPanel();
    }
  });

  filterPanel.addEventListener("click", (e) => e.stopPropagation());

  document.getElementById("apply-filters-btn").addEventListener("click", () => {
    updateFilterBadge();
    closeFilterPanel();
    loadProducts(1);
  });

  document.getElementById("clear-filters-btn").addEventListener("click", () => {
    document.getElementById("min-price").value = "";
    document.getElementById("max-price").value = "";
    updateFilterBadge();
    closeFilterPanel();
    loadProducts(1);
  });

  document.getElementById("search-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") loadProducts(1);
  });

  document.getElementById("search-icon-btn").addEventListener("click", () => loadProducts(1));
  document.getElementById("search-icon-btn").addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      loadProducts(1);
    }
  });

  document.getElementById("sort-select").addEventListener("change", () => loadProducts(1));
  document.getElementById("category-select").addEventListener("change", () => loadProducts(1));

  document
    .getElementById("prev-btn")
    .addEventListener("click", () => loadProducts(currentPage - 1));

  document
    .getElementById("next-btn")
    .addEventListener("click", () => loadProducts(currentPage + 1));
});
