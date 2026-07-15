import express from "express";
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
app.use(express.json());

//1. get product route
app.use("/api/products", productRoutes);

// middleware setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
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
  console.error(err);

  res.status(500).send({
    ok: false,
    message: "Internal Server Error",
  });
});

// server starts from here
app.listen(process.env.PORT, () => {
  console.log("Server has started....");
});
