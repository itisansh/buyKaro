import express from "express";
import { users, idCount, increment } from "../data/users.js";
import auth from "../middleware/auth.js";
import bcrypt from "bcrypt";

const router = express.Router();

//1. signUp route
router.post("/signup", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // bcrypt is async in nature, returns a promise, must use await
  const hashedPassword = await bcrypt.hash(password, 10);

  //checking for invalid field
  if (email.length == 0 || !validateEmail(email) || password.length == 0) {
    return res.status(400).send({ ok: false, message: "Invalid field" });
  }

  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return res
      .status(404)
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
router.post("/login", async (req, res) => {
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
});

//3. logout api route
router.post("/logout", (req, res) => {
  req.session.destroy();
  return res.status(200).send({ ok: true, message: "user logged outs" });
});

//4. PROTECTED get User Details (get me) ,  checks middleware auth.js first
router.get("/me", auth, (req, res) => {
  let userID = req.session.userId;
  let user = users.find((user) => user.id == userID);

  if (user == undefined) {
    return res.status(401).send({ ok: false, message: "user not found" });
  } else {
    user.password = 0;
    return res.status(200).send({ ok: true, message: "user found", user });
  }
});

export default router;
