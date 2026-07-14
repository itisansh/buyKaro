const auth = (req, res, next) => {
  //The default value of req.session.userId is undefined. Because undefined is a falsy value in JavaScript
  if (!req.session.userId) {
    return res.status(401).send({
      ok: false,
      message: "Please login first",
    });
  }

  next();
};

export default auth;
