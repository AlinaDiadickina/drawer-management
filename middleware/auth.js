const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = "drawer-management-secret";

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }
      next();
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res.status(401).json({ message: "Not authorized" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
