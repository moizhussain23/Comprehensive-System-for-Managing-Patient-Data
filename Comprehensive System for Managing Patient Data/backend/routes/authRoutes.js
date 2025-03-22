const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db = require("../db");
require("dotenv").config();

const router = express.Router();

/* ====================================================
    Receptionist Login API (Only for Receptionists)
   ==================================================== */
router.post(
  "/receptionist-login",
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
      //  Fetch only Receptionist Users
      const sql = "SELECT id, name, email, role, password FROM users WHERE email = ? AND role = 'receptionist'";
      db.query(sql, [email], async (err, result) => {
        if (err) return res.status(500).json({ error: "Database query failed" });

        if (result.length === 0) {
          return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = result[0];

        //  Compare Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid password" });

        //  Generate JWT Token
        const token = jwt.sign({ id: user.id, role: "receptionist" }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ success: true, token, user: { id: user.id, name: user.name, role: "receptionist" } });
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

/* ====================================================
    Doctor Login API (Only for Doctors)
   ==================================================== */
router.post(
  "/doctor-login",
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
      // Fetch only Doctor Users
      const sql = "SELECT id, name, email, role, password FROM users WHERE email = ? AND role = 'doctor'";
      db.query(sql, [email], async (err, result) => {
        if (err) return res.status(500).json({ error: "Database query failed" });

        if (result.length === 0) {
          return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = result[0];

        //  Compare Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid password" });

        //  Generate JWT Token
        const token = jwt.sign({ id: user.id, role: "doctor" }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ success: true, token, user: { id: user.id, name: user.name, role: "doctor" } });
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

/* ====================================================
    Patient Login API (Only for Patients)
   ==================================================== */
router.post("/patient-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    //  Fetch only Patient Users
    const sql = "SELECT id, email, hashed_password FROM patients WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const patient = results[0];

      //  Compare Password
      const isMatch = await bcrypt.compare(password, patient.hashed_password);
      if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

      //  Generate JWT Token
      const token = jwt.sign({ id: patient.id, role: "patient" }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.json({ success: true, token, patient: { id: patient.id, email: patient.email } });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
