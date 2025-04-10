const authenticate = (req, res, next) => {
  if (!req.session.userId) {
      return res.redirect('/auth/signin');
  }
  next();
};

module.exports = authenticate;
