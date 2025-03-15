const express = require("express");
const authenticate = require("../middleware/authenticate");
const db = require("../db");
const authenticatePatient = require("../middleware/authPatient");
const router = express.Router();

// Get Patient Profile
router.get("/profile", authenticatePatient, async (req, res) => {
  try {
    const patientId = req.user.id; // Extract patient ID from JWT
    const sql = "SELECT id, name, email, phone, age, gender, address, medical_history FROM patients WHERE id = ?";
    
    db.query(sql, [patientId], (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.json(results[0]); // Return patient data
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Patient Prescriptions
// Get Patient Prescriptions
// Get Patient Prescriptions
router.get("/prescriptions", authenticatePatient, async (req, res) => {
  try {
    const patientId = req.user.id;
    
    // First, get all prescriptions for this patient
    const prescriptionsQuery = `
      SELECT 
        p.id as prescription_id,
        DATE_FORMAT(p.date, '%d-%m-%Y') as formatted_date,
        p.date,
        p.doctor_id,
        u.name as doctor_name
      FROM prescriptions p
      JOIN users u ON p.doctor_id = u.id AND u.role = 'doctor'
      WHERE p.patient_id = ?
      ORDER BY p.date DESC
    `;
    
    db.query(prescriptionsQuery, [patientId], (err, prescriptions) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      // If no prescriptions found, return empty array
      if (prescriptions.length === 0) {
        return res.json({ prescriptions: [] });
      }
      
      // Get all prescription IDs
      const prescriptionIds = prescriptions.map(p => p.prescription_id);
      
      // Second, get all medicines for these prescriptions
      const medicinesQuery = `
        SELECT 
          prescription_id,
          medication,
          dosage,
          frequency,
          duration,
          notes as instructions
        FROM prescription_medicines
        WHERE prescription_id IN (?)
      `;
      
      db.query(medicinesQuery, [prescriptionIds], (err, medicines) => {
        if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ error: "Database error" });
        }
        
        // Group medicines by prescription_id
        const medicinesByPrescription = {};
        medicines.forEach(medicine => {
          if (!medicinesByPrescription[medicine.prescription_id]) {
            medicinesByPrescription[medicine.prescription_id] = [];
          }
          medicinesByPrescription[medicine.prescription_id].push(medicine);
        });
        
        // Add medicines to each prescription
        prescriptions.forEach(prescription => {
          prescription.medicines = medicinesByPrescription[prescription.prescription_id] || [];
        });
        
        res.json({ prescriptions });
      });
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Get Patient Upcoming Visits
router.get("/visits", authenticatePatient, (req, res) => {
  const patientId = req.user.id;
  const currentDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format

  const sql = `
    SELECT 
      v.id, 
      DATE_FORMAT(v.visit_date, '%d-%m-%Y') AS formatted_visit_date,
      v.visit_date,
      u.id AS doctor_id,
      u.name AS doctor_name,
      u.email AS doctor_email
    FROM visits v
    JOIN users u ON v.doctor_id = u.id
    WHERE v.patient_id = ? 
      AND v.visit_date >= ? 
      AND u.role = 'doctor'
    ORDER BY v.visit_date ASC
    LIMIT 1;
  `;

  db.query(sql, [patientId, currentDate], (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Database query failed", details: err.sqlMessage });
    }

    res.json({
      success: true,
      upcomingVisit: results.length > 0 ? results[0] : null
    });
  });
});

module.exports = router;
