import { users } from "../data/users.js";

export default function auth(req, res, next) {
  const user = users.find(user => user.id === req.session.userId);
  if (!user) return res.status(401).json({ ok: false, message: "Please log in first." });
  req.user = user;
  next();
}
