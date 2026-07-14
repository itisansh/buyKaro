import express from "express";
import { users } from "./data/users.js";
import { products } from "./data/products.js";
import { orders } from "./data/orders.js";
import dotenv from "dotenv";
import productRoutes from "./routes/products.js";

dotenv.config();

let app = express();
app.use(express.json());

app.use("/api/products", productRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server has started....");
});
