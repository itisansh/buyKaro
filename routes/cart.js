import express from "express";
import { products } from "../data/products.js";
import {
  users,
  idCount,
  increment,
  incrementQuantity,
  updateQuantity,
  deleteItem,
} from "../data/users.js";
import auth from "../middleware/auth.js";
const router = express.Router();

// ALL CART ROUTES MUST BE BEHIND middleware/auth.js, we check for req.session.userId

//1. get cart of current user
router.get("/", auth, (req, res) => {
  
  const userID = req.session.userId;

  let user = users.find((user) => user.id == userID);
  const cart = user.cart;
  return res.status(200).send({
    ok: true,
    message: "user cart exists",
    cart,
  });
});

//2. add item add item or increment quantity if it already exists in cart
router.post("/add", auth, (req, res) => {
  const itemId = req.body.itemId;
  
  const userID = req.session.userId;

  let user = users.find((user) => user.id == userID);
  let cart = user.cart;

  let item = products.find((product) => product.id == itemId);
  if (!item)
    return res.status(404).send({
      ok: true,
      message: "item not found",
      cart,
    });
  if (cart.some((i) => i.id == item.id)) {
    let itemObj = cart.find((i) => i.id == item.id);
    // ISSUE HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Imported bindings are read-only.
    // We can't reassign them, but we can mutate their objects/arrays (push, pop, property updates). or like their keys' value
    // incrementQuantity(itemObj);
    itemObj.quantity++;
    return res.status(200).send({
      ok: true,
      message: "item has been added again",
      cart,
    });
  }
  let cartItemObj = { ...item, quantity: 1 };
  cart.push(cartItemObj);
  return res.status(200).send({
    ok: true,
    message: "new item added",
    cart,
  });
});

//3. update item
router.put("/update", auth, (req, res) => {
  const quantity = parseInt(req.body.quantity);
  const itemId = req.body.itemId;
  
  const userID = req.session.userId;

  let user = users.find((user) => user.id == userID);

  let cart = user.cart;
  updateItem(itemId, quantity, cart);
  return res.status(200).send({
    ok: true,
    message: "user cart updated",
    cart,
  });
});
function updateItem(itemId, quantity, cart) {
  let item = cart.find((product) => product.id == itemId);
  updateQuantity(item, quantity);
}

//4. delete route
router.delete("/remove/:productId", auth, (req, res) => {
  const id = parseInt(req.params.productId);

  const userID = req.session.userId;

  let user = users.find((u) => u.id == userID);
  let cart = user.cart;
  if (cart.some((item) => item.id == id)) {
    deleteItem(id, user);
    return res.status(200).send({
      ok: true,
      message: "item deleted",
      cart,
    });
  }
  return res.status(400).send({
    ok: false,
    message: "item does not exists",
    cart,
  });
});

export default router;
