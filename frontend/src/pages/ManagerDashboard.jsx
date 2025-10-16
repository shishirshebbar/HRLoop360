// src/pages/ManagerDashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function ManagerDashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/users?roles=Employee",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees(res.data);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load employees");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Manager Dashboard</h1>
        {loading && <p>Loading…</p>}
        {err && <p className="text-red-600">{err}</p>}
        {!loading && !err && (
          <div className="bg-white rounded-2xl shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((u) => (
                    <tr key={u._id} className="border-t">
                      <td className="px-4 py-3">{u.name}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">{u.role}</td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td className="px-4 py-4" colSpan="3">
                        No employees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
