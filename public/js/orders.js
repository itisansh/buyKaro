import { apiRequest } from "./api.js";

async function loadOrders() {
  const res = await apiRequest("/orders");
  const container = document.getElementById("orders-list");
  const noOrdersMsg = document.getElementById("no-orders-message");

  if (res.status === 401) {
    window.location.href = "/login.html";
    return;
  }

  if (!res.ok || !res.userOrders || res.userOrders.length === 0) {
    container.innerHTML = "";
    noOrdersMsg.style.display = "block";
    return;
  }

  noOrdersMsg.style.display = "none";

  container.innerHTML = res.userOrders
    .map(
      (order) => `
    <div class="order-card">
      <h3>Order #${order.id}</h3>
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
