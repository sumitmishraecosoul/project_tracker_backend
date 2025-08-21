module.exports = function authorize(allowedRoles = []) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (allowedRoles.length === 0) {
        return next();
      }
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient role' });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}


