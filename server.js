import express from "express";
import { fileURLToPath } from "node:url";
// Configure session middleware to manage user login sessions
import session from "express-session";

//importing routes
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";

import dotenv from "dotenv";
dotenv.config();

let app = express();
app.use(express.json({ limit: "16kb" }));
// Page URLs are independent of the HTML filenames on disk.
const publicDirectory = fileURLToPath(new URL("./public/", import.meta.url));
const pages = { home: "index", shop: "index", cart: "cart", orders: "orders", login: "login", signup: "signup" };
app.get("/", (req, res) => res.redirect(302, "/home"));
for (const [url, file] of Object.entries(pages)) {
  app.get(`/${url}`, (req, res) => res.sendFile(`${file}.html`, { root: publicDirectory }));
}
app.get("/products/:id", (req, res) => res.sendFile("product.html", { root: publicDirectory }));
// Keep old bookmarks working, but redirect them to the clean URLs.
for (const file of ["index", "cart", "orders", "login", "signup"]) {
  app.get(`/${file}.html`, (req, res) => res.redirect(302, file === "index" ? "/home" : `/${file}`));
}
app.get("/product.html", (req, res) => {
  const id = Number(req.query.id);
  res.redirect(302, Number.isSafeInteger(id) && id > 0 ? `/products/${id}` : "/shop");
});
app.use(express.static(publicDirectory, { index: false }));

//1. get product route
app.use("/api/products", productRoutes);

// middleware setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 },
  }),
);
//2. user auth route connect with app
app.use("/api/auth", authRoutes);

//3. user cart route
app.use("/api/cart", cartRoutes);

//4. user orders
app.use("/api/orders", orderRoutes);

// Phase 5 — Backend: Error Handling

// Catch-all 404 handler, This runs only if no previous route matched.
app.use((req, res) => {
  res.status(404).send({
    ok: false,
    message: "Route not found",
  });
});

//next() → Continue.
// next(err) → Go to error handler.
// return res.send(...) → End the request.

//Global error handler, (error-handling middleware)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "Invalid JSON body." });
  if (err.type === "entity.too.large") return res.status(413).json({ ok: false, message: "Request body is too large." });
  console.error(err);

  res.status(500).send({
    ok: false,
    message: "Internal Server Error",
  });
});

// server starts from here
app.listen(process.env.PORT || 3000, () => {
  console.log("Server has started....");
});
