const logger = (req, res, next) => {
  // if (req.session.email || req.path === "/login") {
  //   next();
  // } else {
  //   res.redirect("/login");
  // }
 
  return next();

};

module.exports = logger;
