import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all user-related localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/"); // Redirect to login
  };

  return (
    <div className="w-full p-4 bg-gray-800 text-white flex justify-end">
      <button
        onClick={handleLogout}
        className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}
