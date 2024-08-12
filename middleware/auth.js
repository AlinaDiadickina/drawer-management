const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = "drawer-management-secret"; // Secret key for signing JWT tokens

// @desc   Middleware to protect routes and ensure the user is authenticated
const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // Extract the token from the Authorization header
    try {
      const decoded = jwt.verify(token, JWT_SECRET); // Verify the token
      req.user = await User.findById(decoded.id).select("-password"); // Find the user by decoded ID, exclude password

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }
      next(); // Pass control to the next middleware
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res.status(401).json({ message: "Not authorized" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
