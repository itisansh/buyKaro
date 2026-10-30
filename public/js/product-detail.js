import { apiRequest } from "./api.js";
import { showToast } from "./toast.js";

function getProductId() {
  return window.location.pathname.split("/").filter(Boolean).at(-1);
}

async function loadProduct() {
  const id = getProductId();
  const res = await apiRequest(`/products/${id}`);
  const container = document.getElementById("product-detail");

  if (!res.ok || !res.productObj) {
    console.warn("Product lookup failed for id:", id, "response:", res);
    container.innerHTML = `<p>${res.message || "Product not found."}</p>`;
    return;
  }

  const p = res.productObj;
  container.innerHTML = `
    <img src="${p.image}" alt="${p.name}" class="detail-image" decoding="async" width="260" height="220" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 260 220%22%3E%3Crect width=%22260%22 height=%22220%22 fill=%22%23F0EDFC%22/%3E%3C/svg%3E'">
    <div class="detail-copy"><span class="eyebrow">${p.category}</span><h1>${p.name}</h1>
    <p class="price">₹${p.price}</p>
    <p class="stock">${p.stock > 0 ? `${p.stock} available` : "Currently unavailable"}</p>
    <button id="add-to-cart-btn" ${p.stock === 0 ? "disabled" : ""}>${p.stock === 0 ? "Out of stock" : "Add to Cart"}</button></div>
  `;

  document
    .getElementById("add-to-cart-btn")
    .addEventListener("click", () => addToCart(p.id));
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

document.addEventListener("DOMContentLoaded", loadProduct);
