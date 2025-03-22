const express = require("express");
const db = require("../db"); // Database connection
const authenticate = require("../middleware/authenticate"); // Ensure user is logged in

const router = express.Router();

// GET Receptionist Details API
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from token

    // Query the database to get receptionist details
    const sql = "SELECT name, email FROM users WHERE id = ? AND role = 'receptionist'";
    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database query failed" });
      }
      if (result.length === 0) {
        return res.status(404).json({ error: "Receptionist not found" });
      }

      // Send receptionist details
      res.json(result[0]);
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
