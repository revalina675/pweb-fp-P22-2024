const express = require("express");
const router = express.Router(); // INI WAJIB ADA
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register route
router.post("/register", async (req, res) => {
  const { username, password, email, role } = req.body;

  if (!["USER", "ADMIN"].includes(role)) {
    return res
      .status(400)
      .json({ message: "Role must be either 'USER' or 'ADMIN'" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      email,
      role,
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Cari user berdasarkan username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cek password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Validasi role
    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }
    if (user.role !== role) {
      return res.status(403).json({ message: "Role mismatch" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
