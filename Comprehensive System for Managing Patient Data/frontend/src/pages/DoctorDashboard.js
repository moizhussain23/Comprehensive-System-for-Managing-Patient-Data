import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    notes: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [doctorData, setDoctorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [editingMedicines, setEditingMedicines] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  
  // Visit management state
  const [visits, setVisits] = useState([]);
  const [editingVisit, setEditingVisit] = useState(null);
  const [newVisitDate, setNewVisitDate] = useState("");
  const [showAddVisitForm, setShowAddVisitForm] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // "details", "visits", "prescriptions"
  
  // Fixed: PrescriptionTable component definition outside of the main component
  const PrescriptionTable = ({ prescriptions = [] }) => {
    const [expandedPrescription, setExpandedPrescription] = useState(null);
  
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-2 px-3 font-semibold text-sm text-gray-600 border-b">Date</th>
              <th className="text-left py-2 px-3 font-semibold text-sm text-gray-600 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(prescriptions) && prescriptions.length > 0 ? (
              prescriptions.map((prescription) => (
                <React.Fragment key={prescription.prescription_id}>
                  {/* Prescription Row */}
                  <tr
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => 
                      setExpandedPrescription(prev =>
                        prev === prescription.prescription_id ? null : prescription.prescription_id
                      )
                    }
                  >
                    {/* Display Date as received from the backend */}
                    <td className="py-2 px-3 font-medium">
                      {prescription.date}
                    </td>
                    <td className="py-2 px-3">
                      <button
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click from triggering
                          setEditingPrescription(prescription);
                          setEditingMedicines([...prescription.medicines]);
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
  
                  {/* Medicines List (Expanded View) */}
                  {expandedPrescription === prescription.prescription_id && (
                    <tr>
                      <td colSpan="2" className="p-4 bg-gray-100">
                        <h4 className="font-semibold text-gray-700 mb-2">Medicines:</h4>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="text-left py-2 px-3 font-semibold text-sm text-gray-700">Medication</th>
                              <th className="text-left py-2 px-3 font-semibold text-sm text-gray-700">Dosage</th>
                              <th className="text-left py-2 px-3 font-semibold text-sm text-gray-700">Frequency</th>
                              <th className="text-left py-2 px-3 font-semibold text-sm text-gray-700">Duration</th>
                              <th className="text-left py-2 px-3 font-semibold text-sm text-gray-700">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prescription.medicines && prescription.medicines.length > 0 ? (
                              prescription.medicines.map((medicine, index) => (
                                <tr key={index} className="border-b">
                                  <td className="py-2 px-3">{medicine.medication}</td>
                                  <td className="py-2 px-3">{medicine.dosage}</td>
                                  <td className="py-2 px-3">{medicine.frequency}</td>
                                  <td className="py-2 px-3">{medicine.duration}</td>
                                  <td className="py-2 px-3">{medicine.notes}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="py-2 text-center text-gray-500">
                                  No medicines available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="py-4 text-center text-gray-500">No prescriptions available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Handle visit editing
  const handleEditVisit = (visit) => {
    setEditingVisit(visit);
    setNewVisitDate(visit.visit_date.split("T")[0]);
    setShowAddVisitForm(false);
  };
  
  // Handle adding a new visit
  const handleAddVisit = () => {
    setEditingVisit(null);
    setNewVisitDate("");
    setShowAddVisitForm(true);
  };
  
  // Save visit (either new or edited)
  const saveVisit = async () => {
    try {
      if (!selectedPatient || !newVisitDate) {
        alert("Please select a date for the visit.");
        return;
      }
      
      const token = localStorage.getItem("token");
      let url, method, body;
      
      if (editingVisit) {
        // Update existing visit
        url = `https://${process.env.REACT_APP_SERVER_IP}/api/doctors/visit/${editingVisit.id}`;
        method = "PUT";
        body = {
          visit_date: newVisitDate  // Changed from visitDate to match backend
        };
      } else {
        // Add new visit
        url = `https://${process.env.REACT_APP_SERVER_IP}/api/doctors/add-visit`;
        method = "POST";
        body = {
          patientId: selectedPatient.id,  // Changed from patientId to patient_id
          visitDate: newVisitDate  // Make sure this matches what backend expects
        };
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to save visit");
      }
      
      // Reset form states
      setEditingVisit(null);
      setNewVisitDate("");
      setShowAddVisitForm(false);
      
      // Refresh visits list
      fetchVisits(selectedPatient.id);
      
      alert(`Visit successfully ${editingVisit ? "updated" : "scheduled"}!`);
    } catch (error) {
      console.error("Error saving visit:", error);
      alert("Failed to save visit: " + error.message);
    }
  };
  
  // Cancel visit edit/add form
  const cancelVisitForm = () => {
    setEditingVisit(null);
    setNewVisitDate("");
    setShowAddVisitForm(false);
  };
  
  // Fetch doctor profile data
  const fetchDoctorProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/doctor-login");
        return;
      }
      
      const response = await fetch(`https://${process.env.REACT_APP_SERVER_IP}/api/doctors/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch doctor profile");
      }
      
      setDoctorData(data);
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      alert("Failed to load doctor profile.");
      navigate("/doctor-login");
    }
  }, [navigate]);

  // Fetch all assigned patients
  const fetchPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
  
      if (!token) {
        navigate("/doctor-login");
        return;
      }
  
      const response = await fetch(`https://${process.env.REACT_APP_SERVER_IP}/api/doctors/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }
  
      const data = await response.json();
      setPatients(data.patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      alert("Failed to load patients data.");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Fetch prescriptions for a specific patient
  const fetchPrescriptions = useCallback(async (patientId) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
  
      if (!token) {
        navigate("/doctor-login");
        return;
      }
  
      const response = await fetch(`https://${process.env.REACT_APP_SERVER_IP}/api/doctors/patient/${patientId}/prescriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch prescriptions");
      }
  
      setPrescriptions(data.prescriptions);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      alert("Failed to load prescriptions.");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);
  
  // Fetch visits for a specific patient
  const fetchVisits = useCallback(async (patientId) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
  
      if (!token) {
        navigate("/doctor-login");
        return;
      }
  
      const response = await fetch(`https://${process.env.REACT_APP_SERVER_IP}/api/doctors/patient/${patientId}/visits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch visits");
      }
  
      setVisits(data);
    } catch (error) {
      console.error("Error fetching visits:", error);
      alert("Failed to load visits.");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Add a new prescription
  const addPrescription = async () => {
    try {
      if (!selectedPatient || medicines.length === 0) {
        alert("Select a patient and add at least one medicine.");
        return;
      }
  
      const token = localStorage.getItem("token");
      
      const response = await fetch(`https://${process.env.REACT_APP_SERVER_IP}/api/doctors/add-prescription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          medicines: medicines.map(med => ({
            medication: med.medication,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            notes: med.notes || ""
          }))
        })
      });
  
      const data = await response.json();
  
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to add prescription");
      }
  
      setMedicines([]);
      fetchPrescriptions(selectedPatient.id);
      alert("Prescription added successfully!");
    } catch (error) {
      console.error("Error adding prescription:", error);
      alert("Failed to add prescription: " + error.message);
    }
  };

  // Add medicine to the current prescription
  const addMedicine = () => {
    if (
      !newMedicine.medication ||
      !newMedicine.dosage ||
      !newMedicine.frequency ||
      !newMedicine.duration
    ) {
      alert("Please fill all medicine details before adding.");
      return;
    }
  
    setMedicines([...medicines, newMedicine]);
    setNewMedicine({ medication: "", dosage: "", frequency: "", duration: "", notes: "" });
  };

  // Update an existing prescription
  const handlePrescriptionUpdate = async () => {
    try {
      if (!editingPrescription || editingMedicines.length === 0) {
        alert("Please ensure all medicine details are filled.");
        return;
      }
  
      const token = localStorage.getItem("token");
      const response = await fetch(`https://${process.env.REACT_APP_SERVER_IP}/api/doctors/prescription/${editingPrescription.prescription_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          medicines: editingMedicines
        })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update prescription");
      }
      
      setEditingPrescription(null);
      setEditingMedicines([]);
      fetchPrescriptions(selectedPatient.id);
      alert("Prescription updated successfully!");
    } catch (error) {
      console.error("Error updating prescription:", error);
      alert("Failed to update prescription: " + error.message);
    }
  };

  // Filter patients based on search query
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setMedicines([]);
    setActiveTab("details");
    cancelVisitForm();
    setEditingPrescription(null);
    fetchPrescriptions(patient.id);
    fetchVisits(patient.id);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Remove medicine from the current prescription
  const removeMedicine = (index) => {
    const updatedMedicines = [...medicines];
    updatedMedicines.splice(index, 1);
    setMedicines(updatedMedicines);
  };

  // Remove medicine from the editing prescription
  const removeEditingMedicine = (index) => {
    const updatedMedicines = [...editingMedicines];
    updatedMedicines.splice(index, 1);
    setEditingMedicines(updatedMedicines);
  };

  // Add a new medicine to the editing prescription
  const addEditingMedicine = () => {
    setEditingMedicines([
      ...editingMedicines,
      { medication: "", dosage: "", frequency: "", duration: "", notes: "" }
    ]);
  };

  // Update editing medicine details
  const updateEditingMedicine = (index, field, value) => {
    const updatedMedicines = [...editingMedicines];
    updatedMedicines[index][field] = value;
    setEditingMedicines(updatedMedicines);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDoctorProfile();
    fetchPatients();
  }, [fetchDoctorProfile, fetchPatients]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Delete a visit
  const deleteVisit = async (visitId) => {
    if (!window.confirm("Are you sure you want to delete this visit?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://${process.env.REACT_APP_SERVER_IP}/api/doctors/visit/${visitId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete visit");
      }

      fetchVisits(selectedPatient.id);
      alert("Visit deleted successfully!");
    } catch (error) {
      console.error("Error deleting visit:", error);
      alert("Failed to delete visit: " + error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
          <div className="flex items-center">
            {doctorData && (
              <span className="text-gray-600 mr-4">
                Dr. {doctorData.name} | {doctorData.specialization}
              </span>
            )}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Patients List */}
          <div className="bg-white shadow-md rounded-lg p-4 md:col-span-1">
            <div class="bg-blue-500 p-4 rounded-t-lg mb-4">
              <h2 class="text-xl font-bold text-white">My Patients</h2>
            </div>
            
            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search patients..."
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Patients List */}
            <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
              {isLoading ? (
                <div className="text-center py-4">Loading patients...</div>
              ) : (
                filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedPatient && selectedPatient.id === patient.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <h3 className="font-medium text-gray-800">{patient.name}</h3>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                      <p className="text-xs text-gray-400">
                        Age: {patient.age} | Gender: {patient.gender}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">No patients found</div>
                )
              )}
            </div>
          </div>

          {/* Patient Details & Prescriptions */}
          <div className="bg-white shadow-md rounded-lg md:col-span-3">
            {selectedPatient ? (
              <div>
                {/* Patient Info Header */}
                <div className="bg-gray-50 p-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedPatient.name}
                  </h2>
                  <div className="flex flex-wrap gap-x-4 text-sm text-gray-600 mt-1">
                    <p>Age: {selectedPatient.age}</p>
                    <p>Gender: {selectedPatient.gender}</p>
                    <p>Email: {selectedPatient.email}</p>
                    <p>Phone: {selectedPatient.phone}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex">
                    <button
                      className={`px-4 py-3 border-b-2 font-medium text-sm ${
                        activeTab === "details"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab("details")}
                    >
                      Patient Details
                    </button>
                    <button
                      className={`px-4 py-3 border-b-2 font-medium text-sm ${
                        activeTab === "visits"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab("visits")}
                    >
                      Visits
                    </button>
                    <button
                      className={`px-4 py-3 border-b-2 font-medium text-sm ${
                        activeTab === "prescriptions"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab("prescriptions")}
                    >
                      Prescriptions
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-4">
                  {/* Patient Details Tab */}
                  {activeTab === "details" && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Patient Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Full Name</p>
                          <p className="mt-1">{selectedPatient.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="mt-1">{selectedPatient.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="mt-1">{selectedPatient.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Age</p>
                          <p className="mt-1">{selectedPatient.age}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Gender</p>
                          <p className="mt-1">{selectedPatient.gender}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Address</p>
                          <p className="mt-1">{selectedPatient.address || "Not provided"}</p>
                        </div>
                      </div>
                      
                      {/* Medical History */}
                      <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Medical History</h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-gray-700">
                            {selectedPatient.medical_history || "No medical history available"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visits Tab */}
                  {activeTab === "visits" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-800">Patient Visits</h3>
                        <button
                          onClick={handleAddVisit}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Add Visit
                        </button>
                      </div>

                      {/* Add/Edit Visit Form */}
                      {(showAddVisitForm || editingVisit) && (
                        <div className="bg-gray-50 p-4 rounded-md mb-4">
                          <h4 className="font-medium text-gray-700 mb-3">
                            {editingVisit ? "Edit Visit" : "Schedule New Visit"}
                          </h4>
                          <div className="flex items-end gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Visit Date
                              </label>
                              <input
                                type="date"
                                value={newVisitDate}
                                onChange={(e) => setNewVisitDate(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={saveVisit}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm"
                              >
                                {editingVisit ? "Update" : "Save"}
                              </button>
                              <button
                                onClick={cancelVisitForm}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Visits List */}
                      <div>
                        {isLoading ? (
                          <div className="text-center py-4">Loading visits...</div>
                        ) : visits.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Visit Date
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {visits.map((visit) => (
                                  <tr key={visit.id}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      {formatDate(visit.visit_date)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {visit.status || "Scheduled"}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        onClick={() => handleEditVisit(visit)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => deleteVisit(visit.id)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            No visits scheduled for this patient
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Prescriptions Tab */}
                  {activeTab === "prescriptions" && (
                    <div>
                      {/* Edit Prescription Form */}
                      {editingPrescription ? (
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-800">Edit Prescription</h3>
                            <button
                              onClick={() => setEditingPrescription(null)}
                              className="text-sm text-gray-500"
                            >
                              Cancel
                            </button>
                          </div>

                          {/* Medicines List */}
                          <div className="space-y-4 mb-4">
                            {editingMedicines.map((medicine, index) => (
                              <div key={index} className="p-3 border border-gray-200 rounded-md bg-gray-50">
                                <div className="flex justify-between mb-2">
                                  <h4 className="font-medium">Medicine #{index + 1}</h4>
                                  <button
                                    onClick={() => removeEditingMedicine(index)}
                                    className="text-red-500 text-sm"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Medication
                                    </label>
                                    <input
                                      type="text"
                                      value={medicine.medication}
                                      onChange={(e) => updateEditingMedicine(index, "medication", e.target.value)}
                                      className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Dosage
                                    </label>
                                    <input
                                      type="text"
                                      value={medicine.dosage}
                                      onChange={(e) => updateEditingMedicine(index, "dosage", e.target.value)}
                                      className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Frequency
                                    </label>
                                    <input
                                      type="text"
                                      value={medicine.frequency}
                                      onChange={(e) => updateEditingMedicine(index, "frequency", e.target.value)}
                                      className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Duration
                                    </label>
                                    <input
                                      type="text"
                                      value={medicine.duration}
                                      onChange={(e) => updateEditingMedicine(index, "duration", e.target.value)}
                                      className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Notes
                                    </label>
                                    <textarea
                                      value={medicine.notes || ""}
                                      onChange={(e) => updateEditingMedicine(index, "notes", e.target.value)}
                                      className="w-full p-2 border border-gray-300 rounded-md h-20"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2 mb-4">
                            <button
                              onClick={addEditingMedicine}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm"
                            >
                              Add Another Medicine
                            </button>
                            <button
                              onClick={handlePrescriptionUpdate}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm"
                            >
                              Update Prescription
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Add New Prescription Form */}
                          <div className="bg-gray-50 p-4 rounded-md mb-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Prescription</h3>
                            
                            {/* Add Medicine Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Medication
                                </label>
                                <input
                                  type="text"
                                  value={newMedicine.medication}
                                  onChange={(e) => setNewMedicine({ ...newMedicine, medication: e.target.value })}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Dosage
                                </label>
                                <input
                                  type="text"
                                  value={newMedicine.dosage}
                                  onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Frequency
                                </label>
                                <input
                                  type="text"
                                  value={newMedicine.frequency}
                                  onChange={(e) => setNewMedicine({ ...newMedicine, frequency: e.target.value })}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Duration
                                </label>
                                <input
                                  type="text"
                                  value={newMedicine.duration}
                                  onChange={(e) => setNewMedicine({ ...newMedicine, duration: e.target.value })}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Notes (Optional)
                                </label>
                                <textarea
                                  value={newMedicine.notes}
                                  onChange={(e) => setNewMedicine({ ...newMedicine, notes: e.target.value })}
                                  className="w-full p-2 border border-gray-300 rounded-md h-20"
                                />
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={addMedicine}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm"
                              >
                                Add to Prescription
                              </button>
                              {medicines.length > 0 && (
                                <button
                                  onClick={addPrescription}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm"
                                >
                                  Save Prescription
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Medicines List */}
                          {medicines.length > 0 && (
                            <div className="mb-6">
                              <h4 className="font-medium text-gray-700 mb-2">Medicines in Current Prescription:</h4>
                              <div className="space-y-2">
                                {medicines.map((med, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-blue-50 rounded-md">
                                    <div>
                                      <span className="font-medium">{med.medication}</span> - {med.dosage}, {med.frequency}, {med.duration}
                                      {med.notes && <span className="text-gray-500 ml-2">({med.notes})</span>}
                                    </div>
                                    <button
                                      onClick={() => removeMedicine(index)}
                                      className="text-red-500 text-sm"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Prescriptions History */}
                          <div>
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Prescription History</h3>
                            <PrescriptionTable prescriptions={prescriptions} />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Select a patient to view details
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Logout</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
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