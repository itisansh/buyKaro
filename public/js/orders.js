import { showToast } from "./toast.js";
import { apiRequest } from "./api.js";

async function loadOrders() {
  const res = await apiRequest("/orders");
  const container = document.getElementById("orders-list");
  const noOrdersMsg = document.getElementById("no-orders-message");

  if (res.status === 401) {
    window.location.href = "/login";
    return;
  }

  if (!res.ok) { showToast(res.message || "Could not load orders.", "error"); return; }
  if (!res.userOrders || res.userOrders.length === 0) {
    container.innerHTML = "";
    noOrdersMsg.style.display = "flex";
    return;
  }

  noOrdersMsg.style.display = "none";

  container.innerHTML = res.userOrders
    .map(
      (order) => `
    <div class="order-card">
      <h3>Order #${order.id}</h3><button class="order-detail-btn btn-secondary" data-id="${order.id}">View order details ↗</button>
      <p>Total: ₹${order.total}</p>
      <ul>
        ${order.items
          .map(
            (item) =>
              `<li>${item.name} x ${item.quantity} — ₹${item.price * item.quantity}</li>`,
          )
          .join("")}
      </ul>
    </div>
  `,
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", loadOrders);

document.addEventListener("click", async (event) => {
  const button = event.target.closest(".order-detail-btn");
  if (!button) return;
  button.disabled = true;
  const res = await apiRequest(`/orders/${button.dataset.id}`);
  button.disabled = false;
  if (!res.ok) { button.textContent = res.message || "Try again"; return; }
  button.textContent = `Order #${res.order.id} · ${res.order.items.reduce((n, item) => n + item.quantity, 0)} items · ₹${res.order.total}`;
});
