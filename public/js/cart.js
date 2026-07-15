import { apiRequest } from "./api.js";

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
    emptyMsg.style.display = "block";
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
        <td>${item.name}</td>
        <td>₹${item.price}</td>
        <td>
          <input type="number" class="qty-input" data-id="${item.id}"
                 value="${item.quantity}" min="1" max="${item.stock}">
        </td>
        <td>₹${subtotal}</td>
        <td><button class="remove-btn" data-id="${item.id}">Remove</button></td>
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
    alert(res.message || "Could not update quantity.");
  }
  loadCart();
}

async function removeItem(itemId) {
  const res = await apiRequest(`/cart/remove/${itemId}`, "DELETE");

  if (!res.ok) {
    alert(res.message || "Could not remove item.");
  }
  loadCart();
}

async function checkout() {
  const res = await apiRequest("/orders", "POST");

  if (res.ok) {
    alert("Order placed successfully.");
    window.location.href = "/orders.html";
  } else {
    alert(res.message || "Could not place order.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  document.getElementById("checkout-btn").addEventListener("click", checkout);
});
