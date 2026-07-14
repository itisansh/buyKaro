import express from "express";
// Configure session middleware to manage user login sessions
import session from "express-session";

//importing routes
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";

import dotenv from "dotenv";
dotenv.config();

let app = express();
app.use(express.json());

//1. get product route
app.use("/api/products", productRoutes);

//2. middleware setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
// user auth route connect with app
app.use("/api/auth", authRoutes);

// server starts from here
app.listen(process.env.PORT, () => {
  console.log("Server has started....");
});
