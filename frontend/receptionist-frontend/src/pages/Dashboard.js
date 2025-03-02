import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <h1 className="text-3xl font-bold">Welcome to the Receptionist Dashboard</h1>
    </div>
  );
};

export default Dashboard;
