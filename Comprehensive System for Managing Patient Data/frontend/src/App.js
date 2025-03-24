import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import PatientLogin from "./pages/PatientLogin"; // ✅ Import Patient Login component
import DoctorLogin from "./pages/DoctorLogin";
import Dashboard from "./pages/Dashboard";
import PatientDashboard from "./pages/PatientDashboard"; // ✅ Import Patient Dashboard component
import DoctorDashboard from "./pages/DoctorDashboard";
const role = process.env.REACT_APP_ROLE;
function App() {
  return (
    <Router>
      <Routes>
        {/* Receptionist Routes */}
        {role === "receptionist" && (
          <>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </>
        )}

        {/* Patient Routes */}
        {role === "patient" && (
          <>
            <Route path="/" element={<PatientLogin />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
          </>
        )}

        {/* Doctor Routes */}
        {role === "doctor" && (
          <>
            <Route path="/" element={<DoctorLogin />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          </>
        )}

        
      </Routes>
    </Router>
  );
}

export default App;
