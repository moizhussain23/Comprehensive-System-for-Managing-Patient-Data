import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const [patientData, setPatientData] = useState(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // "profile", "medical", "prescriptions"

  // Fetch Patient Data
  const fetchPatientData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/patient-login");
        return;
      }

      // Fetch profile data
      const profileResponse = await fetch(`http://${process.env.REACT_APP_SERVER_IP}:5000/api/patient/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.error || "Failed to fetch profile data");
      }

      const profileData = await profileResponse.json();
      setPatientData(profileData);

      // Fetch prescription data
      const prescriptionsResponse = await fetch(`http://${process.env.REACT_APP_SERVER_IP}:5000/api/patient/prescriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (prescriptionsResponse.ok) {
        const prescriptionsData = await prescriptionsResponse.json();
        console.log("Prescriptions data:", prescriptionsData);
        
        if (prescriptionsData && prescriptionsData.prescriptions) {
          setPrescriptions(prescriptionsData.prescriptions);
        } else {
          setPrescriptions([]);
          console.error("Invalid prescriptions data format:", prescriptionsData);
        }
      }

      // Fetch upcoming visit
      const visitsResponse = await fetch(`http://${process.env.REACT_APP_SERVER_IP}:5000/api/patient/visits`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (visitsResponse.ok) {
        const visitsData = await visitsResponse.json();
        setUpcomingAppointment(visitsData.upcomingVisit);
      }

    } catch (error) {
      console.error("Error fetching patient data:", error);
      alert("Failed to load patient data.");
      navigate("/patient-login");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  // Logout Functions
  const initiateLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Prescription component to display details
  const PrescriptionDetails = ({ prescription }) => {
    if (!prescription) return null;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="mb-4 pb-2 border-b">
          <h4 className="font-medium text-lg">Prescription: {prescription.formatted_date}</h4>
          <p className="text-sm text-gray-600">Prescribed by Dr. {prescription.doctor_name}</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600 border-b">Medication</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600 border-b">Dosage</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600 border-b">Frequency</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600 border-b">Duration</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600 border-b">Instructions</th>
              </tr>
            </thead>
            <tbody>
              {prescription && prescription.medicines && prescription.medicines.length > 0 ? (
                prescription.medicines.map((medicine, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium">{medicine.medication}</td>
                    <td className="py-3 px-4 text-sm">{medicine.dosage}</td>
                    <td className="py-3 px-4 text-sm">{medicine.frequency}</td>
                    <td className="py-3 px-4 text-sm">{medicine.duration}</td>
                    <td className="py-3 px-4 text-sm">{medicine.instructions}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">
                    No medications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Show Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your information...</p>
        </div>
      </div>
    );
  }

  // Show Error Message if No Data is Fetched
  if (!patientData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-red-600 font-medium mb-4">Unable to load patient data</p>
          <button onClick={fetchPatientData} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4">
            Retry
          </button>
          <button onClick={() => navigate("/patient-login")} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Logout</h3>
            <p className="mb-6">Are you sure you want to logout from your account?</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={cancelLogout}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Patient Dashboard</h1>
          <div className="flex items-center">
            {patientData && (
              <span className="text-gray-600 mr-4">
                Welcome, {patientData.name}
              </span>
            )}
            <button
              onClick={initiateLogout}
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
          {/* Left sidebar - Patient Information */}
          <div className="bg-white shadow-md rounded-lg p-4 md:col-span-1">
            <div className="bg-blue-500 p-4 rounded-t-lg mb-4">
              <h2 className="text-xl font-bold text-white">My Information</h2>
            </div>
            
            {/* Patient Basic Info */}
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-2xl font-bold">
                  {patientData.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium">{patientData.name}</h3>
                <p className="text-gray-500">{patientData.email}</p>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Age:</span>
                  <span>{patientData.age} years</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Gender:</span>
                  <span>{patientData.gender}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Phone:</span>
                  <span>{patientData.phone}</span>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="mt-6">
              <button 
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left p-3 rounded-md mb-2 ${
                  activeTab === "profile" 
                    ? 'bg-blue-100 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-100 border-l-4 border-transparent'
                }`}
              >
                Personal Information
              </button>
              <button 
                onClick={() => setActiveTab("medical")}
                className={`w-full text-left p-3 rounded-md mb-2 ${
                  activeTab === "medical" 
                    ? 'bg-green-100 border-l-4 border-green-500' 
                    : 'hover:bg-gray-100 border-l-4 border-transparent'
                }`}
              >
                Medical Information
              </button>
              <button 
                onClick={() => setActiveTab("prescriptions")}
                className={`w-full text-left p-3 rounded-md mb-2 ${
                  activeTab === "prescriptions" 
                    ? 'bg-purple-100 border-l-4 border-purple-500' 
                    : 'hover:bg-gray-100 border-l-4 border-transparent'
                }`}
              >
                Prescriptions
              </button>
            </nav>
          </div>

          {/* Main content area */}
          <div className="bg-white shadow-md rounded-lg p-4 md:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-t-lg">
                  <h3 className="text-xl font-semibold text-white">Personal Information</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="mt-1 font-medium">{patientData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email Address</p>
                      <p className="mt-1 font-medium">{patientData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="mt-1 font-medium">{patientData.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="mt-1 font-medium">{patientData.address || "No address provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Age</p>
                      <p className="mt-1 font-medium">{patientData.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Gender</p>
                      <p className="mt-1 font-medium">{patientData.gender}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Medical Info Tab */}
            {activeTab === "medical" && (
              <div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-t-lg">
                  <h3 className="text-xl font-semibold text-white">Medical Information</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                     <h4 className="text-lg font-medium text-gray-800 mb-3">Medical History</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {patientData.medical_history ? (
                          <p>{patientData.medical_history}</p>
                        ) : (
                          <p className="text-gray-500 italic">No medical history available</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-gray-800 mb-3">Upcoming Appointment</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {upcomingAppointment ? (
                          <div>
                            <p className="font-medium">Date: {upcomingAppointment.formatted_visit_date}</p>
                            <p>Doctor: Dr. {upcomingAppointment.doctor_name}</p>
                            <p>Purpose: {upcomingAppointment.purpose || "Regular checkup"}</p>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No upcoming appointments scheduled</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Prescriptions Tab */}
            {activeTab === "prescriptions" && (
              <div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-t-lg">
                  <h3 className="text-xl font-semibold text-white">Prescriptions</h3>
                </div>
                <div className="p-6">
                  {prescriptions.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {prescriptions.map((prescription) => (
                          <div 
                            key={prescription.id} 
                            className={`p-4 border rounded-lg cursor-pointer ${
                              selectedPrescription && selectedPrescription.id === prescription.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedPrescription(prescription)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{prescription.formatted_date}</h4>
                                <p className="text-sm text-gray-500">Dr. {prescription.doctor_name}</p>
                              </div>
                              <div className="text-purple-500">
                                {prescription.medicines.length} {prescription.medicines.length === 1 ? 'medicine' : 'medicines'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-8">
                        {selectedPrescription ? (
                          <PrescriptionDetails prescription={selectedPrescription} />
                        ) : (
                          <div className="text-center p-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Select a prescription to view details</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No prescription records found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

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