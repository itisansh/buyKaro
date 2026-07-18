import { apiRequest } from "./api.js";
import { showToast } from "./toast.js";

async function loadCart() {
  const res = await apiRequest("/cart");
  const tbody = document.getElementById("cart-items");
  const emptyMsg = document.getElementById("cart-empty-message");
  const totalSpan = document.getElementById("cart-total");

  if (res.status === 401) {
    window.location.href = "/login.html";
    return;
  }

  if (!res.ok || !res.cart || res.cart.length === 0) {
    tbody.innerHTML = "";
    emptyMsg.style.display = "flex";
    totalSpan.textContent = "0";
    return;
  }

  emptyMsg.style.display = "none";

  let total = 0;
  tbody.innerHTML = res.cart
    .map((item) => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      return `
      <tr>
        <td data-label="Product">${item.name}</td>
        <td data-label="Price">₹${item.price}</td>
        <td data-label="Quantity">
          <input type="number" class="qty-input" data-id="${item.id}"
                 value="${item.quantity}" min="1" max="${item.stock}">
        </td>
        <td data-label="Subtotal">₹${subtotal}</td>
        <td data-label=""><button class="remove-btn" data-id="${item.id}">Remove</button></td>
      </tr>
    `;
    })
    .join("");

  totalSpan.textContent = total;

  document.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", () =>
      updateQuantity(input.dataset.id, input.value),
    );
  });

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => removeItem(btn.dataset.id));
  });
}

async function updateQuantity(itemId, quantity) {
  const res = await apiRequest("/cart/update", "PUT", {
    itemId: Number(itemId),
    quantity: Number(quantity),
  });

  if (!res.ok) {
    showToast(res.message || "Could not update quantity.", "error");
  }
  loadCart();
}

async function removeItem(itemId) {
  const res = await apiRequest(`/cart/remove/${itemId}`, "DELETE");

  if (!res.ok) {
    showToast(res.message || "Could not remove item.", "error");
  }
  loadCart();
}

async function checkout() {
  const res = await apiRequest("/orders", "POST");

  if (res.ok) {
    showToast("Order placed successfully.", "success");
    setTimeout(() => {
      window.location.href = "/orders.html";
    }, 700);
  } else {
    showToast(res.message || "Could not place order.", "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  document.getElementById("checkout-btn").addEventListener("click", checkout);
});
