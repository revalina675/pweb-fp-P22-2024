// backend/middleware/adminCheck.js
module.exports = (req, res, next) => {
  if (req.userData.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
