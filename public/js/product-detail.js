import { apiRequest } from "./api.js";

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadProduct() {
  const id = getProductId();
  const res = await apiRequest(`/products/${id}`);
  const container = document.getElementById("product-detail");

  if (!res.ok || !res.productObj) {
    container.innerHTML = `<p>Product not found.</p>`;
    return;
  }

  const p = res.productObj;
  container.innerHTML = `
    <img src="${p.image}" alt="${p.name}" class="detail-image">
    <h1>${p.name}</h1>
    <p class="price">₹${p.price}</p>
    <p class="category">Category: ${p.category}</p>
    <p class="stock">In stock: ${p.stock}</p>
    <button id="add-to-cart-btn">Add to Cart</button>
  `;

  document
    .getElementById("add-to-cart-btn")
    .addEventListener("click", () => addToCart(p.id));
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

document.addEventListener("DOMContentLoaded", loadProduct);
