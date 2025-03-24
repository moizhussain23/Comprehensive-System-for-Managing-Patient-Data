import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [viewPatients, setViewPatients] = useState(false);
  const [modifyPatientTab, setModifyPatientTab] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchPatient, setSearchPatient] = useState({ id: "", name: "" });
  const [fieldToEdit, setFieldToEdit] = useState(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [ageError, setAgeError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [newPatient, setNewPatient] = useState({
    name: "",
    email: "",
    phone: "",
    age: null,
    gender: "",
    address: "",
    medical_history: "",
    password: "",
  });

  const downloadQRCode = () => {
    if (!selectedPatient.qr_code) {
      alert("QR code not found!");
      return;
    }
  
    // Create a temporary anchor element to trigger download
    const link = document.createElement("a");
    link.href = selectedPatient.qr_code; // Ensure this contains the correct Base64 QR code
    link.download = `QR_${selectedPatient.name}.png`; // File name for the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const [showPassword, setShowPassword] = useState({
    newPatientPassword: false,
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  
  // For password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Mock receptionist data (would come from auth context in a real app)
  const [receptionist, setReceptionist] = useState({
    name: "",
    email: "",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg", // Default avatar
  });
  
  
  useEffect(() => {
    fetchReceptionistDetails();
  }, []);

  const fetchReceptionistDetails = async () => {
    try {
      const response = await fetch(`https://${process.env.REACT_APP_SERVER_IP}/api/receptionist`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch details");

      setReceptionist({
        name: data.name,
        email: data.email,
        avatar: data.avatar || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIf4R5qPKHPNMyAqV-FjS_OTBB8pfUV29Phg&s",
      });
    } catch (error) {
      console.error("Error fetching receptionist details:", error);
    }
  };

  const navigate = useNavigate();

  // Fetch Patients from Backend on Page Load
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`https://${process.env.REACT_APP_SERVER_IP}/api/patients`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch patients");

      setPatients(data); // Update UI with all patients
    } catch (error) {
      console.error("Error fetching patients:", error);
      alert("Failed to load patients. Please try again.");
    }
  };

  // Password validation function
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    return passwordRegex.test(password);
  };

  // Age validation function
  const validateAge = (age) => {
    const ageNum = parseInt(age, 10);
    return !isNaN(ageNum) && ageNum >= 0;
  };

  // Phone validation function
  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Reset Form & View
  const resetView = () => {
    setViewPatients(false);
    setModifyPatientTab(false);
    setEditingPatient(null);
    setSelectedPatient(null);
    setFieldToEdit(null);
    setSearchPatient({ id: "", name: "" });
    setPasswordError("");
    setAgeError("");
    setPhoneError("");
    setEmailError("");
    setNewPatient({
      name: "",
      email: "",
      phone: "",
      age: null,
      gender: "",
      address: "",
      medical_history: "",
      password: "",
    });
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const openModifyPatientTab = () => {
    resetView(); // Ensures View Patients is NOT active
    setModifyPatientTab(true);
  };

  // Ensure Form Inputs Are Captured Properly
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "password") {
      if (value && !validatePassword(value)) {
        setPasswordError("Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character");
      } else {
        setPasswordError("");
      }
    }

    if (name === "age") {
      if (value && !validateAge(value)) {
        setAgeError("Age must be 0 or greater");
      } else {
        setAgeError("");
      }
    }

    if (name === "phone") {
      if (value && !validatePhone(value)) {
        setPhoneError("Phone number must be exactly 10 digits");
      } else {
        setPhoneError("");
      }
    }

    if (name === "email") {
      if (value && !validateEmail(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    }

    setNewPatient((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  // Create Patient (with validation)
  const createPatient = async () => {
    try {
      // Validate all fields
      let hasErrors = false;

      // Validate age
      if (newPatient.age !== null && !validateAge(newPatient.age)) {
        setAgeError("Age must be 0 or greater");
        hasErrors = true;
      }

      // Validate email
      if (newPatient.email && !validateEmail(newPatient.email)) {
        setEmailError("Please enter a valid email address");
        hasErrors = true;
      }

      // Validate phone
      if (newPatient.phone && !validatePhone(newPatient.phone)) {
        setPhoneError("Phone number must be exactly 10 digits");
        hasErrors = true;
      }

      // Validate password
      if (!newPatient.password) {
        setPasswordError("Password is required!");
        hasErrors = true;
      } else if (!validatePassword(newPatient.password)) {
        setPasswordError("Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character");
        hasErrors = true;
      }

      if (hasErrors) {
        return;
      }

      const formattedAge = newPatient.age === "" || newPatient.age === null ? null : parseInt(newPatient.age, 10);

      const response = await fetch(`https://${process.env.REACT_APP_SERVER_IP}/api/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...newPatient, age: formattedAge }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add patient");

      fetchPatients(); // Refresh patients list
      resetView();
      alert("Patient added successfully!");
    } catch (error) {
      console.error("Error creating patient:", error);
      alert("Failed to add patient. Please try again.");
    }
  };

  // Modify Patient - Find Patient by ID and Name
  const searchForPatient = () => {
    const foundPatient = patients.find(
      (p) => p.id.toString() === searchPatient.id && p.name.toLowerCase() === searchPatient.name.toLowerCase()
    );

    if (foundPatient) {
      setEditingPatient(foundPatient);
    } else {
      alert("No patient found with this ID and Name.");
    }
  };

  // Handle field value change when editing patient
  const handleEditingFieldChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "age") {
      if (value && !validateAge(value)) {
        setAgeError("Age must be 0 or greater");
      } else {
        setAgeError("");
      }
    }
    
    if (name === "phone") {
      if (value && !validatePhone(value)) {
        setPhoneError("Phone number must be exactly 10 digits");
      } else {
        setPhoneError("");
      }
    }

    if (name === "email") {
      if (value && !validateEmail(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    }
    
    setEditingPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password change fields
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "newPassword" || name === "confirmPassword") {
      if (value && !validatePassword(value)) {
        setPasswordError("Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character");
      } else if (name === "confirmPassword" && passwordData.newPassword !== value) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError("");
      }
    }
    
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Modify Patient (with validation)
  const updatePatient = async () => {
    try {
      let hasErrors = false;

      // Validate based on which field is being edited
      if (fieldToEdit === "age" && !validateAge(editingPatient.age)) {
        setAgeError("Age must be 0 or greater");
        hasErrors = true;
      }
      
      if (fieldToEdit === "phone" && !validatePhone(editingPatient.phone)) {
        setPhoneError("Phone number must be exactly 10 digits");
        hasErrors = true;
      }
      
      if (fieldToEdit === "email" && !validateEmail(editingPatient.email)) {
        setEmailError("Please enter a valid email address");
        hasErrors = true;
      }
      
      if (hasErrors) {
        return;
      }
      
      const formattedAge = editingPatient.age ? parseInt(editingPatient.age, 10) : null;
      const response = await fetch(`https://${process.env.REACT_APP_SERVER_IP}/api/patients/${editingPatient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...editingPatient, age: formattedAge }),
      });

      if (!response.ok) throw new Error("Failed to update patient");

      fetchPatients();
      resetView();
      alert("Patient updated successfully!");
    } catch (error) {
      console.error("Error updating patient:", error);
      alert("Failed to update patient.");
    }
  };

  // Change patient password (with validation)
  const updatePatientPassword = async () => {
    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError("New passwords don't match!");
        return;
      }

      if (!passwordData.newPassword || !passwordData.currentPassword) {
        setPasswordError("All password fields are required!");
        return;
      }

      if (!validatePassword(passwordData.newPassword)) {
        setPasswordError("Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character");
        return;
      }

      const response = await fetch(`https://${process.env.REACT_APP_SERVER_IP}/api/patients/${editingPatient.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update password");
      }

      resetView();
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      alert(error.message || "Failed to update password. Please try again.");
    }
  };

  // List of patient fields that can be modified
  const patientFields = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "age", label: "Age" },
    { key: "gender", label: "Gender" },
    { key: "address", label: "Address" },
    { key: "medical_history", label: "Medical History" },
    { key: "password", label: "Change Password" }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar with improved styling */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src="/logo.png" alt="Hospital Logo" className="w-15 h-10" />
                <span className="px-3 py-2 text-2xl font-medium text-gray-900">Dashboard</span>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0 relative">
                <div className="flex items-center">
                  <div className="mr-3 text-right">
                    <p className="text-m font-medium text-gray-900">{receptionist.name}</p>
                    <p className="text-xs text-gray-500">{receptionist.email}</p>
                  </div>
                  <div className="relative flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border-2 border-blue-500">
                    {receptionist.name ? receptionist.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowLogoutConfirmation(true)}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 ml-5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2 " xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Receptionist Dashboard</h1>
          
          {/* Action Buttons Card with improved styling */}
          <div className="w-full md:w-auto bg-white rounded-lg shadow-sm p-3 flex flex-wrap gap-3">
            <button 
              onClick={resetView} 
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center"
            >
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Patient
            </button>
            <button 
              onClick={() => {
                resetView();
                setViewPatients(true);
              }} 
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center"
            >
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              View Patients
            </button>
            <button 
              onClick={openModifyPatientTab} 
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center"
            >
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Modify Patient
            </button>
          </div>
        </div>

        {/* Create Patient Form with validation */}
        {!viewPatients && !modifyPatientTab && !editingPatient && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Create New Patient</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Name" 
                  value={newPatient.name || ""} 
                  onChange={handleInputChange} 
                  className="w-full p-2 border rounded mb-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all" 
                />
              </div>
              <div>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email" 
                  value={newPatient.email || ""} 
                  onChange={handleInputChange} 
                  className="w-full p-2 border rounded mb-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all" 
                />
                {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
              </div>
              <div>
                <input 
                  type="text" 
                  name="phone" 
                  placeholder="Phone (10 digits)" 
                  value={newPatient.phone || ""} 
                  onChange={handleInputChange} 
                  className="w-full p-2 border rounded mb-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all" 
                />
                {phoneError && <p className="text-red-500 text-xs">{phoneError}</p>}
              </div>
              <div>
                <input 
                  type="number" 
                  name="age" 
                  placeholder="Age" 
                  min="0"
                  value={newPatient.age || ""} 
                  onChange={handleInputChange} 
                  className="w-full p-2 border rounded mb-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all" 
                />
                {ageError && <p className="text-red-500 text-xs">{ageError}</p>}
              </div>
              <div>
                <select 
                  name="gender" 
                  value={newPatient.gender || ""} 
                  onChange={handleInputChange} 
                  className={`w-full p-2 border rounded mb-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all ${newPatient.gender ? "text-black" : "text-gray-400"}`}
                >
                  <option value="" className="text-grey-400">Select Gender</option>
                  <option value="Male" className="text-black">Male</option>
                  <option value="Female" className="text-black">Female</option>
                  <option value="Other" className="text-black">Other</option>
                </select>
              </div>
              <div>
                <input 
                  type="text" 
                  name="address" 
                  placeholder="Address" 
                  value={newPatient.address || ""} 
                  onChange={handleInputChange} 
                  className="w-full p-2 border rounded mb-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all" 
                />
              </div>
              <div>
              <div className="relative">
                <input 
                  type={showPassword.newPatientPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="Password" 
                  value={newPatient.password || ""} 
                  onChange={handleInputChange} 
                  className="w-full p-2 border rounded pr-10 mb-1"
                />
                
                {/* Eye Icon for Password Visibility Toggle */}
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-500"
                  onMouseDown={() => setShowPassword({ ...showPassword, newPatientPassword: true })}
                  onMouseUp={() => setShowPassword({ ...showPassword, newPatientPassword: false })}
                  onMouseLeave={() => setShowPassword({ ...showPassword, newPatientPassword: false })}
                  onTouchStart={() => setShowPassword({ ...showPassword, newPatientPassword: true })}  // 
                  onTouchEnd={() => setShowPassword({ ...showPassword, newPatientPassword: false })}  // 
                >
                  {showPassword.newPatientPassword ? (
                    // Eye Open (Password Visible)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5c-5.8 0-10.5 4.5-10.5 7s4.7 7 10.5 7 10.5-4.5 10.5-7-4.7-7-10.5-7zm0 3c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z" />
                    </svg>
                  ) : (
                    // Eye Closed (Password Hidden)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7zm9-3c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm-6.5 0L3 12m6 6l8.5-8.5m-3.5 3.5L21 12" />
                    </svg>
                  )}
                </button>
              </div>

                {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}
                <p className="text-gray-500 text-xs">Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character</p>
              </div>
            </div>
            <textarea 
              name="medical_history" 
              placeholder="Medical History" 
              value={newPatient.medical_history || ""} 
              onChange={handleInputChange} 
              className="w-full p-2 border rounded mb-5 mt-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all" 
              rows="4"
            />
            <button 
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg shadow hover:shadow-lg transition-all"
              onClick={createPatient}
            >
              Save Patient
            </button>
          </div>
        )}

        {/* View Patients Table with improved styling */}
        {viewPatients && !selectedPatient && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Registered Patients</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="border p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="border p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="border p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Medical History</th>
                    <th className="border p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-blue-50 cursor-pointer transition-colors" onClick={() => setSelectedPatient(patient)}>
                      <td className="border p-2 whitespace-nowrap">{patient.id}</td>
                      <td className="border p-2 whitespace-nowrap font-medium text-gray-900">{patient.name}</td>
                      <td className="border p-2 whitespace-nowrap">{patient.phone || "N/A"}</td>
                      <td className="border p-2 truncate max-w-xs">{patient.medical_history || "N/A"}</td>
                      <td className="border p-2 text-blue-600 hover:text-blue-800 font-medium">View</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Patient View with improved styling */}
        {selectedPatient && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Patient Details</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">ID: {selectedPatient.id}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedPatient.name}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedPatient.email || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedPatient.phone || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{selectedPatient.age || "N/A"}</p>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{selectedPatient.gender || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedPatient.address || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Medical History</p>
                  <p className="font-medium">{selectedPatient.medical_history || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex justify-center mb-6">
              <div className="p-4 border rounded-lg text-center bg-gray-50 w-48">
                <p className="text-gray-700 mb-2 font-medium">Patient QR Code</p>
                <div className="w-32 h-32 bg-white border mx-auto flex items-center justify-center">
                  <img 
                  src={selectedPatient.qr_code} 
                  alt="Patient QR Code" 
                  className="w-32 h-32 mx-auto"
                  />
                </div>
		<div className="text-sm mt-2 text-gray-700">Scan to access patient data</div>
              </div>
            </div>
            

            <div className="flex flex-col items-center">
              {/* Download QR Button (Now Properly Aligned Left) */}
              <button
                onClick={downloadQRCode}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Download QR
              </button>

              <div className="flex justify-end w-full">
                {/* Back to List Button */}
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-200 transition-colors"
                >
                  Back to List
                </button>

                {/* Edit Patient Button */}
                <button
                  onClick={() => {
                    setEditingPatient(selectedPatient);
                    setSelectedPatient(null);
                    setModifyPatientTab(true);
                  }}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded hover:shadow-md transition-all"
                >
                  Edit Patient
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modify Patient Search */}
        {modifyPatientTab && !editingPatient && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Modify Patient</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                <input
                  type="text"
                  value={searchPatient.id}
                  onChange={(e) => setSearchPatient({ ...searchPatient, id: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter patient ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={searchPatient.name}
                  onChange={(e) => setSearchPatient({ ...searchPatient, name: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter patient name"
                />
              </div>
            </div>
            <button
              onClick={searchForPatient}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition-all"
            >
              Search
            </button>
          </div>
        )}

        {/* Modify Patient Form */}
        {editingPatient && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Edit Patient</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">ID: {editingPatient.id}</span>
            </div>

            {fieldToEdit === null ? (
              <>
                <p className="mb-4 text-gray-700">Select a field to edit:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
                  {patientFields.map((field) => (
                    <button
                      key={field.key}
                      onClick={() => setFieldToEdit(field.key)}
                      className="bg-white border border-gray-300 rounded-lg p-3 text-left hover:bg-blue-50 hover:border-blue-300 transition-all"
                    >
                      <span className="block text-gray-700 font-medium">{field.label}</span>
                      <span className="block text-gray-500 truncate">
                        {field.key === "password" ? "••••••••" : editingPatient[field.key] || "Not set"}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={resetView}
                    className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : fieldToEdit === "password" ? (
              // Password Change Form
              <div>
                <p className="mb-4 text-gray-700">Change Password for {editingPatient.name}</p>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword.currentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 border rounded pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-gray-500"
                        onMouseDown={() => setShowPassword({ ...showPassword, currentPassword: true })}
                        onMouseUp={() => setShowPassword({ ...showPassword, currentPassword: false })}
                        onMouseLeave={() => setShowPassword({ ...showPassword, currentPassword: false })}
                      >
                        {showPassword.currentPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword.newPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 border rounded pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-gray-500"
                        onMouseDown={() => setShowPassword({ ...showPassword, newPassword: true })}
                        onMouseUp={() => setShowPassword({ ...showPassword, newPassword: false })}
                        onMouseLeave={() => setShowPassword({ ...showPassword, newPassword: false })}
                      >
                        {showPassword.newPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword.confirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 border rounded pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-gray-500"
                        onMouseDown={() => setShowPassword({ ...showPassword, confirmPassword: true })}
                        onMouseUp={() => setShowPassword({ ...showPassword, confirmPassword: false })}
                        onMouseLeave={() => setShowPassword({ ...showPassword, confirmPassword: false })}
                      >
                        {showPassword.confirmPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                    {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}
                    <p className="text-gray-500 text-xs">Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setFieldToEdit(null)}
                    className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={updatePatientPassword}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded hover:shadow-md transition-all"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            ) : (
              // Other Fields Edit Form
              <div>
                <p className="mb-4 text-gray-700">
                  Editing <span className="font-medium">{patientFields.find((f) => f.key === fieldToEdit)?.label}</span>
                </p>
                {fieldToEdit === "gender" ? (
                  <select
                    name="gender"
                    value={editingPatient.gender || ""}
                    onChange={handleEditingFieldChange}
                    className="w-full p-2 border rounded mb-4 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : fieldToEdit === "medical_history" ? (
                  <textarea
                    name="medical_history"
                    value={editingPatient.medical_history || ""}
                    onChange={handleEditingFieldChange}
                    className="w-full p-2 border rounded mb-4 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                    rows="4"
                  />
                ) : (
                  <div>
                    <input
                      type={fieldToEdit === "age" ? "number" : "text"}
                      name={fieldToEdit}
                      value={editingPatient[fieldToEdit] || ""}
                      onChange={handleEditingFieldChange}
                      className="w-full p-2 border rounded mb-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                    />
                    {(fieldToEdit === "email" && emailError) && <p className="text-red-500 text-xs">{emailError}</p>}
                    {(fieldToEdit === "phone" && phoneError) && <p className="text-red-500 text-xs">{phoneError}</p>}
                    {(fieldToEdit === "age" && ageError) && <p className="text-red-500 text-xs">{ageError}</p>}
                  </div>
                )}
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => setFieldToEdit(null)}
                    className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={updatePatient}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded hover:shadow-md transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-3">Confirm Logout</h3>
            <p className="text-gray-600 mb-5">Are you sure you want to logout from the system?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutConfirmation(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded hover:shadow-md transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Comprehensive System for Managing Patient Data. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
  
}