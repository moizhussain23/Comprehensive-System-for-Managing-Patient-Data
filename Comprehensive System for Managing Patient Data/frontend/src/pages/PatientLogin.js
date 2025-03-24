import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PatientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromQR = params.get("email");

    if (emailFromQR) {
      setEmail(emailFromQR);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`https://${process.env.REACT_APP_SERVER_IP}/api/auth/patient-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      navigate("/patient-dashboard"); // Redirect to patient dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Circular Gradient - Using a slightly different blue than the receptionist */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] rounded-full border-[60px] border-indigo-500/30"></div>
      </div>

      {/* Login Card */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md z-10 flex flex-col items-center">
        {/* Logo */}
        <img src="/logo.png" alt="Hospital Logo" className="w-20 h-20 mb-4" />

        <h1 className="text-indigo-600 text-xl font-medium mb-8">Patient Login</h1>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Login Form */}
        <form className="w-full space-y-6" onSubmit={handleLogin}>
          <div>
            <input
              type="password"
              placeholder="ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-indigo-600"
              required
            />
          </div>
          <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-indigo-600 pr-10"
                required
              />
              
              {/* Eye Icon for Showing Password */}
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                onTouchStart={() => setShowPassword(true)}  // Mobile support
                onTouchEnd={() => setShowPassword(false)}  // Mobile support
              >
                {showPassword ? (
                  // Eye Open (Visible)
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
                  // Eye Closed (Hidden)
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
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 uppercase font-medium hover:bg-indigo-700 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-white text-center mt-8 max-w-md px-4 z-10">
        <p className="text-sm">© 2025 Comprehensive System for Managing Patient Data</p>
        <p className="text-sm mt-1">
          Access your medical records securely.
        </p>
      </div>
    </div>
  );
}