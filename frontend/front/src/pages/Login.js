import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ Toggle State for Password Visibility
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/receptionist-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);


      // ✅ Redirect to Receptionist Dashboard
      if (data.user.role === "receptionist") {
        navigate("/dashboard");
      } else if (data.user.role === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        throw new Error("Invalid role");
      }
    } catch (err) {
      setError(err.message);
    }

  };

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Circular Gradient */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] rounded-full border-[60px] border-blue-500/30"></div>
      </div>

      {/* Login Card */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md z-10 flex flex-col items-center">
        {/* Logo */}
        <img src="/logo.png" alt="Hospital Logo" className="w-20 h-20 mb-4" />

        <h1 className="text-blue-600 text-xl font-medium mb-8">Receptionist Login</h1>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Login Form */}
        <form className="w-full space-y-6" onSubmit={handleLogin}>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-600"
              required
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} // ✅ Toggle Password Visibility
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gray-300 py-2 pr-10 focus:outline-none focus:border-blue-600"
              required
            />
            
            {/* ✅ Eye Icon for Toggle Password Visibility */}
            <button
              type="button"
              className="absolute right-2 top-2 text-gray-500"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              onTouchStart={() => setShowPassword(true)}  // ✅ Mobile Support
              onTouchEnd={() => setShowPassword(false)}  // ✅ Mobile Support
            >
              {showPassword ? (
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

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 uppercase font-medium hover:bg-blue-700 transition"
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
          Securely manage patient records and streamline operations.
        </p>
      </div>
    </div>
  );
}
