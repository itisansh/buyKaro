import express from "express";
// Configure session middleware to manage user login sessions
import session from "express-session";

//importing routes
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";

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

// server starts from here
app.listen(process.env.PORT, () => {
  console.log("Server has started....");
});
