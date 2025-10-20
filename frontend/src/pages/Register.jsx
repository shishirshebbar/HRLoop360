// src/pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        ...form,
        role: "Employee", // server should still enforce this
      });
      navigate("/", {
        state: { message: "✅ Registration successful! Please login." },
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-gray-100 transition-transform hover:scale-[1.01]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-extrabold text-indigo-700">
            Create your account
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-indigo-600 transition"
          >
            ← Back
          </button>
        </div>

        {/* Bright highlighted note */}
        <div className="bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-200 rounded-xl p-3 mb-5 shadow-sm">
          <p className="text-sm text-indigo-700 font-medium leading-relaxed">
            💡 <span className="font-semibold">Note:</span> Only{" "}
            <span className="font-semibold text-indigo-800">Employees</span> can
            self-register. Other roles (Management Admin, Senior Manager, HR
            Recruiter) are added by the{" "}
            <span className="font-semibold text-indigo-800">Management Admin</span>.
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm font-medium mb-4 text-center bg-red-50 border border-red-200 p-2 rounded-lg">
            {error}
          </p>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none placeholder-gray-400"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none placeholder-gray-400"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none placeholder-gray-400"
              value={form.password}
              onChange={(e) =>
                setForm((s) => ({ ...s, password: e.target.value }))
              }
              required
            />
          </div>

          {/* Hidden enforced role */}
          <input type="hidden" value="Employee" />

          <button
            disabled={loading}
            className={`w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-semibold shadow-md ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            className="text-indigo-600 cursor-pointer font-medium hover:underline"
            onClick={() => navigate("/")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
