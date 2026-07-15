import express from "express";
import { users, idCount, increment } from "../data/users.js";
import auth from "../middleware/auth.js";
import bcrypt from "bcrypt";

const router = express.Router();

//1. signUp route
router.post("/signup", async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    //checking for invalid field
    if (email.length == 0 || !validateEmail(email) || password.length == 0) {
      return res.status(400).send({ ok: false, message: "Invalid field" });
    }
    // bcrypt is async in nature, returns a promise, must use await
    const hashedPassword = await bcrypt.hash(password, 10);

    if (
      users.some((user) => user.email.toLowerCase() === email.toLowerCase())
    ) {
      return res
        .status(409)
        .send({ ok: false, message: "user email already exists" });
    } else {
      // Imported variables are read-only bindings.
      // We can mutate the imported array (users.push()) but cannot reassign it (users = ...).
      // users = saveNewUser(email, hashedPassword, users, idCount);
      // idCount++;
      saveNewUser(email, hashedPassword);
      increment();
      return res.status(201).send({ ok: true, message: "user signed in" });
    }
  } catch (err) {
    next(err);
  }
});
// regex function for validating if email format is correct or not
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function saveNewUser(email, hashedpassword) {
  let user = {
    id: idCount,
    email,
    password: hashedpassword,
    cart: [],
  };
  users.push(user);
  // return users;
}

//2. login route
router.post("/login", async (req, res, next) => {
  try {
    // JSON.parse converts json string into js object
    // let loginUser = JSON.parse(req.body);
    const email = req.body.email;
    const password = req.body.password;

    let user = users.find((user) => user.email == email);

    if (user == undefined) {
      return res.status(404).send({ ok: false, message: "email not found" });
    } else {
      let match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).send({ ok: false, message: "wrong password" });
      } else {
        req.session.userId = user.id;
        return res.status(200).send({
          ok: true,
          message: "user logged in",
          session: req.session.userId,
        });
      }
    }
  } catch (err) {
    next(err);
  }
});

//3. logout api route
router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send({
        ok: false,
        message: "Logout failed",
      });
    }
    return res.status(200).send({
      ok: true,
      message: "User logged out",
    });
  });
});

//4. PROTECTED get User Details (get me) ,  checks middleware auth.js first
router.get("/me", auth, (req, res, next) => {
  try {
    let userID = req.session.userId;
    //the Array.prototype.find() method returns a reference if the element is an object or array, but returns a copy (by value) if the element is a primitive type (like a number, string, or boolean).
    // find() returns a reference to the object.
    // Make a copy only if you want to avoid modifying the original object.    let user = users.find((user) => user.id == userID);

    if (user == undefined) {
      return res.status(401).send({ ok: false, message: "user not found" });
    } else {
      let userWithoutPassword = { ...user, password: undefined };
      return res
        .status(200)
        .send({ ok: true, message: "user found", userWithoutPassword });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
