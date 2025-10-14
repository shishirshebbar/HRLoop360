import { useState } from "react";
import axios from "axios";
import CloseButton from "../components/CloseButton";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "HR Recruiter",
  });
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/admin/create-user", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ User created successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
        <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-md relative">
          {/* Close button inside the container */}
          <CloseButton />
          <h2 className="text-xl font-semibold mb-4 text-center">
            Admin Dashboard
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              className="w-full border p-2 rounded-lg"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border p-2 rounded-lg"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border p-2 rounded-lg"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <select
              className="w-full border p-2 rounded-lg"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option>HR Recruiter</option>
              <option>Senior Manager</option>
              <option>Management Admin</option>
            </select>
            <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
              Create User
            </button>
          </form>
          {message && (
            <p className="text-center text-green-600 mt-3">{message}</p>
          )}
        </div>
      </div>
    </>
  );
}
