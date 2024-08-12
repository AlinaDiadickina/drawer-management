const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const JWT_SECRET = "drawer-management-secret"; // Secret key used to sign JWT tokens

// @desc   Register a new user and issue a JWT token
// @route  POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Create a new user with the provided username and password
    const user = new User({ username, password });
    await user.save();

    // Generate a JWT token valid for 1 hour
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    // Respond with the JWT token
    res.status(201).json({ token });
  } catch (err) {
    // Handle errors such as duplicate usernames
    res.status(400).json({ message: err.message });
  }
});

// @desc   Log in an existing user and issue a JWT token
// @route  POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token valid for 1 hour
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    // Respond with the JWT token
    res.json({ token });
  } catch (err) {
    // Handle server errors
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
