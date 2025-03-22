const express = require("express");
const db = require("../db");
const authenticateDoctor = require("../middleware/authenticateDoctor");
const router = express.Router();


router.get("/profile", authenticateDoctor, async (req, res) => {
  try {
    const sql = "SELECT id, name, email FROM users WHERE id = ? AND role = 'doctor'";
    db.query(sql, [req.user.id], (err, result) => {
      if (err) {
        console.error("Database query failed:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Doctor not found" });
      }

      res.json(result[0]); //  Send doctor data
    });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ====================================================
    Fetch Patients Assigned to the Doctor
   ==================================================== */
   router.get("/patients", authenticateDoctor, async (req, res) => {
    try {
      const sql = "SELECT id, name, email, age, gender, phone, address, medical_history FROM patients";
      
      db.query(sql, (err, results) => {
        if (err) {
          console.error("Error fetching patients:", err);
          return res.status(500).json({ error: "Database query failed" });
        }
        res.json({ success: true, patients: results });
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

/* ====================================================
    Add Prescription for a Patient
   ==================================================== */
   router.post("/add-prescription", authenticateDoctor, (req, res) => {
    const { patient_id, patientId, medicines } = req.body;
    const actual_patient_id = patient_id || patientId; // Use whichever is provided
    const doctor_id = req.user.id;
    const date = new Date(); // Current date
  
    //  Ensure patient_id and medicines array exist
    if (!actual_patient_id || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ error: "Patient ID and at least one medicine are required" });
    }
  
    //   Insert Prescription Record
    const prescriptionSql = "INSERT INTO prescriptions (doctor_id, patient_id, date) VALUES (?, ?, ?)";
    
    db.query(prescriptionSql, [doctor_id, actual_patient_id, date], (err, result) => {
      if (err) {
        console.error("Error adding prescription:", err);
        return res.status(500).json({ error: "Failed to add prescription" });
      }
  
      const prescription_id = result.insertId;
  
      //  Insert Each Medicine into prescription_medicines
      const medicineSql = "INSERT INTO prescription_medicines (prescription_id, medication, dosage, frequency, duration, notes) VALUES ?";
      const medicineValues = medicines.map(med => [prescription_id, med.medication, med.dosage, med.frequency, med.duration, med.notes]);
  
      db.query(medicineSql, [medicineValues], (err, result) => {
        if (err) {
          console.error("Error adding medicines:", err);
          return res.status(500).json({ error: "Failed to add medicines" });
        }
  
        res.json({ success: true, message: "Prescription added successfully!" });
      });
    });
});

/* ====================================================
  Get Prescriptions for a Patient
   ==================================================== */
   router.get("/patient/:id/prescriptions", authenticateDoctor, (req, res) => {
    const patientId = req.params.id;
  
    const sql = `
      SELECT 
        p.id AS prescription_id, DATE_FORMAT(p.date, '%d-%m-%Y') AS date,
        m.medication, m.dosage, m.frequency, m.duration, m.notes
      FROM prescriptions p
      LEFT JOIN prescription_medicines m ON p.id = m.prescription_id
      WHERE p.patient_id = ?
      ORDER BY p.date DESC
    `;
  
    db.query(sql, [patientId], (err, results) => {
      if (err) {
        console.error("Database Query Error:", err.sqlMessage); // Log exact SQL error
        return res.status(500).json({ error: "Database query failed", details: err.sqlMessage });
      }
  
      const prescriptionsMap = new Map();
  
      results.forEach(row => {
        if (!prescriptionsMap.has(row.prescription_id)) {
          prescriptionsMap.set(row.prescription_id, {
            prescription_id: row.prescription_id,
            date: row.date, // Now using the formatted date from SQL
            medicines: []
          });
        }
        
        if (row.medication) {
          prescriptionsMap.get(row.prescription_id).medicines.push({
            medication: row.medication,
            dosage: row.dosage,
            frequency: row.frequency,
            duration: row.duration,
            notes: row.notes
          });
        }
      });
  
      res.json({
        success: true,
        prescriptions: Array.from(prescriptionsMap.values())
      });
    });
  });
  
/* ====================================================
   Schedule an Upcoming Visit
   ==================================================== */
router.post("/add-visit", authenticateDoctor, (req, res) => {
  const { patientId, visitDate } = req.body;
  const doctorId = req.user.id;

  if (!patientId || !visitDate) {
    return res.status(400).json({ error: "Patient ID and Visit Date are required" });
  }

  const sql = "INSERT INTO visits (doctor_id, patient_id, visit_date) VALUES (?, ?, ?)";
  db.query(sql, [doctorId, patientId, visitDate], (err, result) => {
    if (err) {
      console.error("Error scheduling visit:", err);
      return res.status(500).json({ error: "Failed to schedule visit" });
    }
    res.json({ success: true, message: "Visit scheduled successfully" });
  });
});

/* ====================================================
   Fetch all scheduled visits for a Doctor
   ==================================================== */

router.get("/upcoming-visits", authenticateDoctor, (req, res) => {
  const doctor_id = req.user.id;

  const sql = `
    SELECT v.id, v.visit_date, p.id AS patient_id, p.name AS patient_name, p.email 
    FROM visits v
    JOIN patients p ON v.patient_id = p.id
    WHERE v.doctor_id = ? AND v.visit_date >= CURDATE()
    ORDER BY v.visit_date ASC
  `;

  db.query(sql, [doctor_id], (err, results) => {
    if (err) {
      console.error("Error fetching visits:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json({ success: true, visits: results,doctor_id:doctor_id });
  });
});

/* ====================================================
   Modify an already scheduled visit
   ==================================================== */

router.put("/visit/:id", authenticateDoctor, (req, res) => {
  const visit_id = req.params.id;
  const { visit_date } = req.body;
  const doctorId = req.user.id;
  
  if (!visit_date) {
    return res.status(400).json({ error: "Visit date is required" });
  }

  const checkVisitSql = "SELECT * FROM visits WHERE id = ? AND doctor_id = ?";
  db.query(checkVisitSql, [visit_id, doctorId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Visit not found or may have been deleted" });
    }

    // Update visit only if it exists
    const updateSql = "UPDATE visits SET visit_date = ? WHERE id = ? AND doctor_id = ?";
    db.query(updateSql, [visit_date, visit_id, doctorId], (err, result) => {
      if (err) {
        console.error("Update error:", err);
        return res.status(500).json({ error: "Failed to update visit" });
      }

      res.json({ success: true, message: "Visit updated successfully" });
    });
  });
});

/* ====================================================
   Doctor to cancel a visit
   ==================================================== */

router.delete("/visit/:id", authenticateDoctor, (req, res) => {
  const visit_id = req.params.id;

  const sql = "DELETE FROM visits WHERE id = ?";
  db.query(sql, [visit_id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting visit:", err);
      return res.status(500).json({ error: "Failed to delete visit" });
    }
    res.json({ success: true, message: "Visit deleted successfully!" });
  });
});

/* ====================================================
   Fetch Upcoming Visits for a Patient
   ==================================================== */
router.get("/patient/:id/visits", authenticateDoctor, (req, res) => {
  const patientId = req.params.id;
  const sql = "SELECT id, DATE_FORMAT(visit_date, '%Y-%m-%d') AS visit_date FROM visits WHERE patient_id = ? ORDER BY visit_date ASC";

  db.query(sql, [patientId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

/* ====================================================
   Update Prescription
   ==================================================== */
   router.put("/prescription/:id", authenticateDoctor, (req, res) => {
    const prescriptionId = req.params.id;
    const { medicines } = req.body;
    
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ error: "At least one medicine is required" });
    }
    
    // First, delete existing medicines for this prescription
    const deleteSql = "DELETE FROM prescription_medicines WHERE prescription_id = ?";
    
    db.query(deleteSql, [prescriptionId], (err, result) => {
      if (err) {
        console.error("Error deleting existing medicines:", err);
        return res.status(500).json({ error: "Failed to update prescription" });
      }
      
      // Then insert the updated medicines
      const insertSql = "INSERT INTO prescription_medicines (prescription_id, medication, dosage, frequency, duration, notes) VALUES ?";
      const medicineValues = medicines.map(med => [
        prescriptionId, 
        med.medication, 
        med.dosage, 
        med.frequency, 
        med.duration, 
        med.notes || ""
      ]);
      
      db.query(insertSql, [medicineValues], (err, result) => {
        if (err) {
          console.error("Error inserting updated medicines:", err);
          return res.status(500).json({ error: "Failed to update prescription" });
        }
        
        res.json({ success: true, message: "Prescription updated successfully!" });
      });
    });
  });

module.exports = router;