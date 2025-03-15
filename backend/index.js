const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const db = require("./db");
const patientsRoutes = require("./routes/patients");
const authRoutes = require("./routes/authRoutes");
const receptionistRoutes = require("./routes/receptionist"); // Import the new route
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctors");

// Load environment variables
dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors({
  origin: "*",  // ✅ Allows requests from any device
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(bodyParser.json());

// ✅ API Routes
app.use("/api/patients", patientsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/patients", require("./routes/patients"));
app.use("/api/receptionist", receptionistRoutes); // Register the API endpoint
app.use("/api/patient", patientRoutes);
app.use("/api/doctors", doctorRoutes);

// ✅ Test API Route
app.get("/", (req, res) => {
  res.send("✅ API is running!");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
