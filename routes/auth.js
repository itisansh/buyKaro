import express from "express";
import bcrypt from "bcrypt";
import { users, idCount, increment } from "../data/users.js";
import auth from "../middleware/auth.js";
const router = express.Router();
function credentials(body) {
  if (typeof body?.email !== "string" || typeof body?.password !== "string") return null;
  const email = body.email.trim().toLowerCase();
  if (!email || email.length > 254 || !body.password.length || Buffer.byteLength(body.password) > 72) return null;
  return { email, password: body.password };
}
router.post("/signup", async (req, res) => {
  const input = credentials(req.body);
  if (!input || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return res.status(400).json({ ok: false, message: "Enter a valid email and a password of at most 72 bytes." });
  const password = await bcrypt.hash(input.password, 10);
  // Check after hashing so concurrent signups cannot create duplicate emails.
  if (users.some(user => user.email === input.email)) return res.status(409).json({ ok: false, message: "An account with that email already exists." });
  users.push({ id: idCount, email: input.email, password, cart: [] });
  increment();
  res.status(201).json({ ok: true, message: "Account created. Please log in." });
});
router.post("/login", async (req, res, next) => {
  const input = credentials(req.body);
  if (!input) return res.status(400).json({ ok: false, message: "Enter your username or email and password." });
  const user = users.find(user => user.email === input.email);
  if (!user || !await bcrypt.compare(input.password, user.password)) return res.status(401).json({ ok: false, message: "Incorrect username, email, or password." });
  req.session.regenerate(err => {
    if (err) return next(err);
    req.session.userId = user.id;
    req.session.save(err => {
      if (err) return next(err);
      res.json({ ok: true, message: "Logged in.", session: user.id });
    });
  });
});
router.post("/logout", (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.json({ ok: true, message: "Logged out." });
  });
});
router.get("/me", auth, (req, res) => {
  const { password, ...userWithoutPassword } = req.user;
  res.json({ ok: true, userWithoutPassword });
});
export default router;
