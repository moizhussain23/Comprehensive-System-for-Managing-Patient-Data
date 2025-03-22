const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/authenticate");
const bcrypt = require("bcryptjs"); // 
const QRCode = require("qrcode");

// Fetch patient data
router.get("/", authenticate, (req, res) => {
  const sql = "SELECT * FROM patients";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Failed to fetch patients:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    res.json(result);
  });
});


//  Create a new patient
router.post("/", authenticate, async (req, res) => {
  const { name, email, phone, age, gender, address, medical_history, password } = req.body;

  const processedAge = age && !isNaN(age) ? parseInt(age, 10) : null;
  const processedPhone = phone === "" ? null : phone;
  const processedAddress = address === "" ? null : address;

  if (!name || !email || !password || !medical_history) {
    return res.status(400).json({ error: "Name, Email, Password, and Medical History are required" });
  }

  try {
    // Hash the password before saving to DB
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO patients (name, email, phone, age, gender, address, medical_history, hashed_password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(sql, [name, email, processedPhone, processedAge, gender, processedAddress, medical_history, hashedPassword], async (err, result) => {
      if (err) {
        console.error("SQL Insert Error:", err);
        return res.status(500).json({ error: "Database error", details: err.message });
      }

      const patientId = result.insertId;

      // Generate QR Code with email & patient ID
      const patientLoginURL = `https://${process.env.REACT_APP_SERVER_IP}/?email=${email}&id=${patientId}`;
      const qrCodeBase64 = await QRCode.toDataURL(patientLoginURL);

      // Store QR Code in the database
      db.query("UPDATE patients SET qr_code = ? WHERE id = ?", [qrCodeBase64, patientId], (qrErr) => {
        if (qrErr) {
          console.error("Error storing QR Code:", qrErr);
          return res.status(500).json({ error: "QR Code generation failed" });
        }

        res.status(201).json({ 
          success: true, 
          message: "Patient registered successfully", 
          patientId, 
          qr_code: qrCodeBase64 
        });
      });
    });
  } catch (error) {
    console.error("Error adding patient:", error);
    res.status(500).json({ error: "Failed to add patient" });
  }
});


// NEW ROUTE: Update patient password
router.put("/:id", authenticate, async (req, res) => {
  const patientId = req.params.id;
  const { name, email, phone, age, gender, address, medical_history } = req.body;

  if (!patientId) {
    return res.status(400).json({ error: "Patient ID is required" });
  }

  const sql = "UPDATE patients SET name=?, email=?, phone=?, age=?, gender=?, address=?, medical_history=? WHERE id=?";
  db.query(sql, [name, email, phone, age, gender, address, medical_history, patientId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database update failed" });
    }
    res.json({ success: true, message: "Patient updated successfully!" });
  });
});


router.put("/:id/password", authenticate, async (req, res) => {
  const patientId = req.params.id;
  const { currentPassword, newPassword } = req.body;
  

  if (!patientId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "Patient ID, current password, and new password are required" });
  }

  try {
    // First, get the current hashed password from the database
    const getPasswordSql = "SELECT hashed_password FROM patients WHERE id = ?";
    db.query(getPasswordSql, [patientId], async (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to verify password" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Patient not found" });
      }

      const storedHashedPassword = result[0].hashed_password;
      
      // Compare the current password with the stored hash
      const passwordMatch = await bcrypt.compare(currentPassword, storedHashedPassword);
      
      if (!passwordMatch) {
        console.log("Current password doesn't match");
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      
      // Hash the new password
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update the password in the database
      const updatePasswordSql = "UPDATE patients SET hashed_password = ? WHERE id = ?";
      db.query(updatePasswordSql, [newHashedPassword, patientId], (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Failed to update password:", updateErr);
          return res.status(500).json({ error: "Failed to update password" });
        }
        
        res.json({ success: true, message: "Password updated successfully" });
      });
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Failed to update password", message: error.message });
  }
});

module.exports = router;