import { orders, orderIdCount, incrementOrderIdCount } from "../data/orders.js";
import { products } from "../data/products.js";
import { users, emptyCart } from "../data/users.js";
import auth from "../middleware/auth.js";
import express from "express";

const router = express.Router();

//1. Place order with items in cart
router.post("/", auth, (req, res, next) => {
  try {
    const userID = req.session.userId;

    let user = users.find((user) => user.id == userID);
    let cart = user.cart;
    if (cart.length === 0) {
      return res.status(400).send({
        ok: false,
        message: "Cart is empty",
      });
    }
    products.forEach((product) => {
      cart.forEach((cartItem) => {
        if (cartItem.id == product.id) {
          product.stock = product.stock - cartItem.quantity;
        }
      });
    });
    let totalPrice = cart.reduce((sum, i) => {
      return sum + i.price * i.quantity;
    }, 0);

    let orderObj = {
      id: orderIdCount,
      userId: userID,
      items: [...cart],
      total: totalPrice,
    };
    incrementOrderIdCount();

    orders.push(orderObj);
    emptyCart(user);
    return res.status(201).send({
      ok: true,
      message: "order placed successfully",
      orderObj,
    });
  } catch (err) {
    next(err);
  }
});

//2. get only logged in users order history
router.get("/", auth, (req, res, next) => {
  try {
    const userID = req.session.userId;

    let userOrders = orders.filter((order) => order.userId == userID);
    return res.status(200).send({
      ok: true,
      message: "orders retrieved",
      userOrders,
    });
  } catch (err) {
    next(err);
  }
});

//3. get logged in user's specific order
router.get("/:id", auth, (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userID = req.session.userId;

    let userOrders = orders.filter((order) => order.userId == userID);
    let order = userOrders.find((order) => order.id == orderId);
    if (!order) {
      return res.status(400).send({
        ok: false,
        message: `order not found with id: ${orderId}`,
      });
    }

    return res.status(200).send({
      ok: true,
      message: `order with ${orderId} retrieved`,
      order,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
