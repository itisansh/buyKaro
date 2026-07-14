# E-Commerce Project — Build Guide

Stack: Node.js + Express (ES6 modules) + in-memory data (no MongoDB) + vanilla HTML/CSS/JS frontend.
Auth: express-session (cookie-based) + bcrypt for password hashing. No JWT.

Rule for using this guide: don't move to the next phase until the current one is tested and working. Test backend routes with curl/Postman/Thunder Client *before* touching frontend code for that feature.

---

## Phase 0 — Project Setup

- [ ] `mkdir ecommerce-project && cd ecommerce-project`
- [ ] `npm init -y`
- [ ] `npm install express express-session bcrypt dotenv`
- [ ] `npm install -D nodemon`
- [ ] In `package.json`: add `"type": "module"`, and scripts:
  - `"dev": "nodemon server.js"`
  - `"start": "node server.js"` (needed later for deployment)
- [ ] Create `.env` with `SESSION_SECRET=` (any random string) and `PORT=3000`
- [ ] Create `.gitignore` with `node_modules` and `.env`
- [ ] Create empty folders: `data/`, `routes/`, `middleware/`, `public/`, `public/css/`, `public/js/`
- [ ] `git init`, first commit

**Checkpoint:** `npm run dev` starts without errors (even with an empty `server.js` that just does `app.listen()`).

---

## Phase 1 — Backend: Products (build this first, no auth needed)

- [ ] `data/products.js` — export an array of ~15-20 dummy product objects (id, name, price, category, stock, createdAt)
- [ ] `routes/products.js` — two routes:
  - `GET /` — list with query params: `page`, `limit`, `search`, `sort`, `category`, `minPrice`, `maxPrice`
  - `GET /:id` — single product by id
- [ ] Wire into `server.js`: `app.use('/api/products', productRoutes)`

**Checkpoint (test with curl/Postman, not browser):**
- [ ] `GET /api/products` returns all products with pagination metadata
- [ ] `GET /api/products?page=2&limit=5` returns correct slice
- [ ] `GET /api/products?search=mouse` filters correctly
- [ ] `GET /api/products?sort=price_asc` sorts correctly
- [ ] `GET /api/products/1` returns single product
- [ ] `GET /api/products/999` (non-existent id) returns 404, not a crash

Don't proceed to Phase 2 until every box above is checked.

---

## Phase 2 — Backend: Auth (sessions + bcrypt)

- [ ] `data/users.js` — empty array + a way to generate incrementing ids
- [ ] In `server.js`, set up `express-session` middleware **before** mounting any routes:
  ```
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }));
  ```
- [ ] `routes/auth.js`:
  - `POST /signup` — validate fields, check duplicate email, `bcrypt.hash(password, 10)`, save user with `cart: []`
  - `POST /login` — find user by email, `bcrypt.compare(password, user.password)`, if match set `req.session.userId = user.id`
  - `POST /logout` — `req.session.destroy()`
  - `GET /me` — protected, reads `req.session.userId`, looks up and returns that user (never send back the hashed password)
- [ ] `middleware/auth.js` — checks `req.session.userId`; if missing, respond 401; else call `next()`
- [ ] Wire into `server.js`: `app.use('/api/auth', authRoutes)`

**Checkpoint (curl/Postman — for sessions, your tool needs to persist cookies between requests; Postman does this automatically per collection, curl needs `-c cookies.txt -b cookies.txt`):**
- [ ] Signup with valid data → 201 success
- [ ] Signup with duplicate email → proper error, not a crash
- [ ] Signup with missing field → 400 error
- [ ] Confirm the stored password is a bcrypt hash, NOT plain text
- [ ] Login with correct credentials → success, cookie set
- [ ] Login with wrong password → 401 error, not a crash
- [ ] `GET /api/auth/me` using the same cookie session → returns user
- [ ] `GET /api/auth/me` with no session → 401
- [ ] `POST /api/auth/logout` then `GET /api/auth/me` again → 401 (session cleared)

---

## Phase 3 — Backend: Cart

- [ ] Confirm every signed-up user object has `cart: []`
- [ ] `routes/cart.js`, all routes behind `middleware/auth.js`:
  - `GET /` — return current user's cart, with product details joined in (manual `.find()` lookup against `data/products.js`)
  - `POST /add` — add item or increment quantity if it already exists in cart
  - `PUT /update` — change quantity of an existing item
  - `DELETE /remove/:productId` — remove item from cart
- [ ] Wire into `server.js`: `app.use('/api/cart', cartRoutes)`

**Checkpoint:**
- [ ] Add item to cart → success, appears in `GET /cart`
- [ ] Add same item again → quantity increments, not duplicated
- [ ] Update quantity → reflects correctly
- [ ] Remove item → gone from cart
- [ ] Try any cart route with no active session → 401, not a crash

---

## Phase 4 — Backend: Orders

- [ ] `data/orders.js` — empty array + id counter
- [ ] `routes/orders.js`, behind auth middleware:
  - `POST /` — read user's current cart, build order object, calculate total, push to orders array, empty the user's cart
  - `GET /` — return only the logged-in user's past orders
  - `GET /:id` — single order detail (check it belongs to the logged-in user)
- [ ] Wire into `server.js`: `app.use('/api/orders', orderRoutes)`

**Checkpoint:**
- [ ] Place order with items in cart → success, cart is now empty, order shows in order history
- [ ] Place order with empty cart → proper error, not a crash
- [ ] `GET /orders` only shows that user's orders, not everyone's

**By end of Phase 4, your entire backend works — provable by curl/Postman alone, with zero frontend code written yet.**

---

## Phase 5 — Backend: Error Handling

- [ ] Add a catch-all 404 handler (after all routes)
- [ ] Add a global error-handling middleware (4-argument function: `(err, req, res, next)`)
- [ ] Wrap async route handlers in try/catch so unexpected errors don't crash the server

---

## Phase 6 — Frontend: Static Setup

- [ ] `app.use(express.static('public'))` in `server.js`
- [ ] Build `public/js/api.js` — one shared function that wraps `fetch()`. **Important with sessions:** every fetch call needs `credentials: 'include'` so the browser sends the session cookie along with the request.
- [ ] Confirm: visiting `localhost:3000` in browser loads `public/index.html`

---

## Phase 7 — Frontend: Product Pages (no auth required for this part)

- [ ] `public/index.html` — search box, sort dropdown, category/price filters, product grid container, pagination container
- [ ] `public/js/products.js` — fetch products on page load, render into the grid, wire up search/sort/filter/pagination controls to re-fetch with new query params
- [ ] `public/product.html` — single product detail page, reads `id` from URL query string

**Checkpoint:** open in browser, confirm products render, search/sort/filter/pagination all visibly work.

---

## Phase 8 — Frontend: Auth Pages

- [ ] `public/login.html` + `public/signup.html` — plain divs/inputs, no `<form>` tag, button with click handler
- [ ] `public/js/auth.js` — signup/login functions calling your API (`credentials: 'include'` on every call), redirect to home on success
- [ ] Also in `auth.js`: on every page load, call `GET /api/auth/me` to check if a session is active → toggle navbar between "Login/Signup" and "Welcome, [name] / Logout"
- [ ] Logout function: call `POST /api/auth/logout`, then redirect

**Checkpoint:** signup → login → navbar updates to show logged-in state → refresh page → still logged in (session persists) → logout → navbar reverts.

---

## Phase 9 — Frontend: Cart & Checkout

- [ ] "Add to Cart" buttons on product list/detail pages call your cart API (`credentials: 'include'`, no manual token needed — cookie handles it automatically)
- [ ] `public/cart.html` + `public/js/cart.js` — render cart items, quantity controls, remove buttons, running total
- [ ] Checkout button → calls `POST /api/orders` → redirect to a confirmation view or orders page
- [ ] `public/orders.html` + `public/js/orders.js` — list past orders

**Checkpoint:** full flow works end to end — browse → search/filter → add to cart → view cart → checkout → see it in order history.

---

## Phase 10 — Polish

- [ ] Handle empty states in UI (empty cart, no orders yet, no search results)
- [ ] Handle "not logged in" gracefully on frontend — redirect to login instead of breaking silently if a protected fetch returns 401
- [ ] Basic responsive CSS (flexbox/grid) so it doesn't look broken on mobile widths
- [ ] Write a README: what the project does, how to run it locally, and a note that data is in-memory and resets on server restart

---

## Phase 11 — Deploy

- [ ] Push to GitHub (source control, not hosting)
- [ ] Create a Render account, connect the GitHub repo
- [ ] Set environment variables (`SESSION_SECRET`, `PORT`) in Render's dashboard
- [ ] Build command: `npm install` — Start command: `npm run start`
- [ ] Test the live URL end to end (first load may be slow — free tier cold start, not a bug)
- [ ] One thing to watch on Render specifically: cookies may need `secure: true` / `sameSite` settings adjusted for production HTTPS — if login seems to "not stick" after deploying, this session-cookie config is the first place to check

---

## Auth decisions made (for reference)

- **express-session over JWT** — chosen because your frontend and backend are served from the same origin (Express serves both), so you get automatic cookie handling with no manual token attachment on every fetch call. JWT is a valid alternative but adds complexity you don't need for this architecture. Worth learning JWT separately later, deliberately, once this project ships.
- **bcrypt kept, not skipped** — hashing passwords isn't optional the way JWT-vs-sessions was. Storing plain-text passwords is a bug, not a simpler design choice. The code is only 2 function calls (`bcrypt.hash`, `bcrypt.compare`), so there's no real complexity tradeoff here.

---

## When you get stuck

Come back with the **specific error message or specific behavior**, not "it's not working." Good questions to bring back:
- "My `POST /cart/add` returns 401 even though I logged in first, here's my curl command and my auth middleware"
- "My pagination shows the right count but the same products on every page"
- "Login works in Postman but my frontend fetch doesn't seem to keep the session — is this a credentials/cookie issue?"

That keeps you in the driver's seat — you write it, I help you debug or explain the *why* behind a fix rather than handing you replacement code.