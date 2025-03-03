const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db = require("../db");
require("dotenv").config();

const router = express.Router();

// 📌 Receptionist Login API
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").not().isEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if receptionist exists
      const sql = "SELECT * FROM users WHERE email = ? AND role = 'receptionist'";
      db.query(sql, [email], async (err, result) => {
        if (err) {
          console.error("Database query failed:", err);
          return res.status(500).json({ error: "Database query failed" });
        }

        if (result.length === 0) {
          return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = result[0];

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ error: "Invalid password" });
        }

        // ✅ Ensure JWT_SECRET is defined
        const jwtSecret = process.env.JWT_SECRET || "fallback_secret"; // Fallback if .env is missing

        // Generate JWT Token
        const token = jwt.sign(
          { id: user.id, role: user.role },
          jwtSecret,
          { expiresIn: "1h" }
        );

        res.json({
          success: true,
          token,
          user: { id: user.id, name: user.name, role: user.role },
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
