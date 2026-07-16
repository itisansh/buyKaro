# Frontend Documentation — ShopEase

Vanilla HTML/CSS/JS, no React, no build step. Served directly by Express via `app.use(express.static("public"))`. Every JS file uses ES6 modules (`import`/`export`), loaded in HTML via `<script type="module" src="...">`.

Core pattern used everywhere: **read the DOM → call the backend → render the response back into the DOM.** No framework re-rendering — pages regenerate chunks of HTML manually via `innerHTML` whenever data changes.

---

## File structure

```
public/
├── index.html          Home page — product list, search/sort/filter, pagination
├── product.html         Single product detail page
├── cart.html             Cart page
├── login.html             Login page
├── signup.html            Signup page
├── orders.html            Order history page
├── css/
│   └── style.css          All styling, one file
└── js/
    ├── api.js              Shared fetch wrapper — every API call goes through this
    ├── auth.js              Login state, signup, login, logout — runs on every page
    ├── products.js          Home page logic
    ├── product-detail.js    Single product page logic
    ├── cart.js               Cart page logic
    └── orders.js              Orders page logic
```

---

## `js/api.js` — the single doorway to the backend

```javascript
const BASE_URL = "/api";

async function apiRequest(endpoint, method = "GET", body = null) {
  const options = {
    method,
    credentials: "include",
    headers: {},
  };

  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json();
  return { status: res.status, ...data };
}

export { apiRequest };
```

Every fetch call in the entire app routes through this one function instead of each file writing its own `fetch()` boilerplate.

- **`credentials: "include"`** — the most important line in the whole file. Ensures the session cookie is sent with every request. Without it, every "protected" route (cart, orders, `/auth/me`) would behave as if you're logged out, since the backend uses `express-session`, not JWT — cookies aren't attached to fetch calls automatically unless explicitly told to.
- **`if (body)`** — only attaches a JSON body and `Content-Type` header when one is passed. Lets the same function serve GET requests (no body) and POST/PUT/DELETE requests (with body) without duplicating logic.
- **`return { status: res.status, ...data }`** — merges the raw HTTP status code into the same object as the backend's own JSON response (`{ok, message, ...}`). Calling code can check either `res.ok` (backend's success flag) or `res.status === 401` (raw HTTP status), both live on the same object.

---

## `js/auth.js` — login state, signup, login, logout

Runs on **every page** — every page's navbar needs to know whether a session is active.

### `checkAuth()` — runs automatically on every page load
```javascript
async function checkAuth() {
  const res = await apiRequest("/auth/me");
  if (res.ok && res.userWithoutPassword) {
    // show email + logout button, hide login/signup links
  } else {
    // show login/signup links, hide logged-in state
  }
}
```
Calls `GET /api/auth/me`. If the session cookie is valid, the backend responds with `userWithoutPassword` (matches the backend's exact variable name — there's no `name` field in the user schema, so **email** is what's displayed in the navbar, not a name). If there's no valid session, the navbar falls back to Login/Signup links. This runs fresh on every page load, which is why the navbar state stays correct across navigation without needing to be manually synced.

### `handleLogin()` / `handleSignup()`
Only attached to buttons that actually exist on the current page:
```javascript
const loginBtn = document.getElementById("login-btn");
if (loginBtn) loginBtn.addEventListener("click", handleLogin);
```
`login-btn` only exists in the DOM on `login.html`. On every other page, `getElementById` returns `null`, the `if` fails silently, nothing breaks. This is how one shared file safely handles page-specific buttons without needing separate files per page.

Inside `handleLogin()`: reads the email/password inputs, calls `POST /auth/login` with `{email, password}` (matches the backend exactly — no extra fields, since signup/login don't use a `name` field), and either redirects to `/index.html` on success or displays the backend's actual error message (e.g. `"wrong password"`, `"email not found"`) inside the red error box.

### `handleLogout()`
Calls `POST /auth/logout` (triggers `req.session.destroy()` on the backend), then redirects to `/login.html`.

---

## `js/products.js` — home page

One main function, `loadProducts(page)`, does everything: reads filter values, builds the query string, fetches, re-renders the grid. Triggered on page load and re-triggered by every filter interaction.

### Reading filters and building the query string
```javascript
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
```
`page` and `limit` are always sent. Everything else is conditional — only appended if the user actually typed/selected something, keeping the URL clean. `encodeURIComponent()` is used on `search` and `category` since they're free-text/label values that could contain spaces or special characters (e.g. "office chair" → `office%20chair`).

`limit` is hardcoded to `8` in this file — separate from the backend's own default of `5` (`parseInt(req.query.limit) || 5`), but since the frontend always sends an explicit `limit` value, the backend default never actually triggers from the UI. Purely a "cards per page" cosmetic choice; change the `const limit = 8;` line if you want it to match the backend default instead.

Sort values are `"low"` / `"high"` (matching the backend's `sortByPrice` function), **not** `"price_asc"` / `"price_desc"`.

### Fetching
```javascript
const res = await apiRequest(`/products${query}`);
```
Hits `GET /api/products?page=1&limit=8&search=...`, landing on the backend's `routes/products.js` handler.

### Rendering
```javascript
list.innerHTML = res.productArray.map((p) => `
    <div class="product-card">
      ...
      <button class="add-cart-btn" data-id="${p.id}">Add to Cart</button>
    </div>
`).join("");
```
`res.productArray` matches the backend's exact response key (not `products`). `.map()` turns the array of product objects into an array of HTML strings, `.join("")` glues them together, and the result replaces the grid's `innerHTML` wholesale — the core vanilla-JS rendering pattern used everywhere in this app: regenerate a chunk of HTML, don't diff/patch individual elements.

`data-id="${p.id}"` is a custom attribute smuggling the product id onto the button so it can be read back out after rendering:
```javascript
document.querySelectorAll(".add-cart-btn").forEach((btn) => {
  btn.addEventListener("click", () => addToCart(btn.dataset.id));
});
```
This re-attach step has to run after every single render — replacing `innerHTML` destroys and recreates DOM elements, so any previously attached click listeners are gone and must be re-wired each time.

### Pagination
No total-page-count metadata comes back from the backend, so pagination is Prev/Next only, not numbered pages:
```javascript
function updatePaginationButtons(page, resultCount) {
  document.getElementById("prev-btn").disabled = page <= 1;
  document.getElementById("next-btn").disabled = resultCount < limit;
}
```
"Next" gets disabled once a page returns fewer results than the limit — a heuristic for "this is probably the last page," since there's no real total to check against.

### Triggers
```javascript
document.addEventListener("DOMContentLoaded", () => {
  loadProducts(1);
  document.getElementById("apply-filters-btn").addEventListener("click", () => loadProducts(1));
  document.getElementById("search-input").addEventListener("keypress", (e) => { if (e.key === "Enter") loadProducts(1); });
  document.getElementById("prev-btn").addEventListener("click", () => loadProducts(currentPage - 1));
  document.getElementById("next-btn").addEventListener("click", () => loadProducts(currentPage + 1));
});
```
Changing a dropdown alone doesn't refetch — only clicking Apply, pressing Enter in search, or clicking Prev/Next triggers a new request. Deliberate, so the app isn't firing network calls on every keystroke or dropdown hover.

---

## `js/product-detail.js` — single product page

### Reading the product id from the URL
```javascript
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}
```
Product cards link to `/product.html?id=5`. `URLSearchParams` is a built-in browser API that parses query strings without manually splitting on `?` and `&`.

### Fetching and rendering
Calls `GET /products/:id`, reads the response under `res.productObj` (matches the backend's exact key — **not** `res.product`). Renders name, price, category, stock, image, and an "Add to Cart" button that calls the same `addToCart()` logic used on the home page (duplicated in this file rather than imported across files, since there's no shared cart-button module — small, acceptable duplication for a project this size).

---

## `js/cart.js` — busiest file, three operations on one page

### Loading the cart
```javascript
const res = await apiRequest("/cart");
if (res.status === 401) {
  window.location.href = "/login.html";
  return;
}
```
Checks `res.status === 401` specifically (not just `res.ok`) — if there's no valid session, the backend's `auth` middleware rejects with 401, and instead of rendering a broken/empty cart, the page immediately redirects to login. This same guard pattern appears at the top of `orders.js` too, since both are protected pages.

### Rendering rows
```javascript
<input type="number" class="qty-input" data-id="${item.id}" value="${item.quantity}" min="1" max="${item.stock}">
```
`max="${item.stock}"` uses the `stock` field already bundled inside each cart item — the backend's `POST /cart/add` route spreads the full product object plus `quantity` into the cart array, so `item.stock` is available with no extra lookup needed on the frontend. This gives a basic browser-level constraint against entering more than available stock, using native HTML5 input validation rather than custom JS.

### Updating quantity
```javascript
input.addEventListener("change", () => updateQuantity(input.dataset.id, input.value));
```
Fires on `change` (when you edit the number and click/tab away), not on every keystroke — avoids firing a network request per digit typed. Calls `PUT /cart/update` with `{itemId, quantity}`, then calls `loadCart()` again to refresh the whole table including the recalculated total.

### Checkout
```javascript
async function checkout() {
  const res = await apiRequest("/orders", "POST");
  if (res.ok) window.location.href = "/orders.html";
}
```
No body sent — the backend's `POST /orders` route reads the cart directly from the session server-side, so the frontend only needs to trigger the action, not send any data.

---

## `js/orders.js` — simplest file, read-only

Fetches `GET /orders`, reads the response under `res.userOrders` (matches the backend's exact key), loops through and renders each order as a card listing its items and total. No buttons, no interactivity — this page only displays order history.

---

## HTML files

Every page has an identical `<header class="navbar">` block, copy-pasted at the top of each file rather than shared as a component — deliberate, since there's no framework here to share components with; duplicating a static navbar across 6 files is the correct tradeoff for a vanilla JS project this size.

Below the navbar, each page mostly contains **empty containers with specific `id`s** (`product-list`, `cart-items`, `login-btn`, `product-detail`, etc.) that exist purely as hooks for the JS files to grab via `getElementById`/`querySelector`. The HTML itself renders almost nothing on its own — it's scaffolding that JS fills in after the page loads.

No `<form>` tags anywhere in the project — every "submit" is a plain `<button>` with a `click` listener. This avoids native browser form submission (which would cause a full page reload and wipe JS state) without needing `e.preventDefault()` boilerplate.

---

## `css/style.css`

One shared stylesheet, plain CSS (no Tailwind, no framework). Organized by section: navbar, buttons/inputs, product grid, product detail, auth forms, cart table, orders. Uses flexbox for the navbar and form layouts, CSS grid (`repeat(auto-fill, minmax(200px, 1fr))`) for the responsive product grid so card count per row adjusts automatically to screen width without media queries.

---

## Known gaps (not bugs, just unhandled edge cases)

Left out deliberately to keep scope manageable for the deadline — none of these break core functionality, they're just missing polish:

- **Min/max price inputs accept negative numbers.** No frontend validation blocking it. If `minPrice > maxPrice`, the backend just returns an empty result set silently — no error message shown to the user.
- **Cart quantity input relies on native HTML `min`/`max` attributes only.** The actual validation happens backend-side (`quantity <= 0 || quantity > product.stock || isNaN(quantity)` in `routes/cart.js`), and the frontend just displays whatever error message the backend sends back via `alert(res.message)`. It doesn't preemptively block a bad value before the request is sent.

Cheapest fix if there's time before submission: add `min="0"` to the two price `<input>` elements in `index.html` — blocks negative numbers at the browser level, one attribute each, no JS required.
