import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { Users, AlertCircle, Loader2 } from "lucide-react";

const glass =
  "bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ManagerDashboard() {
  const [directReports, setDirectReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  useEffect(() => {
    const fetchDirectReports = async () => {
      setLoading(true);
      setError("");
      try {
        // Calls the new backend route
        const res = await axios.get(`${BASE_URL}/api/users/direct-reports`, {
          headers,
        });
        setDirectReports(res.data || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load your team data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDirectReports();
  }, [headers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pt-8 pb-16">
        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl md:text-3xl font-bold text-gray-800"
        >
          Manager Dashboard 📊
        </motion.h1>
        <p className="text-gray-600 mt-1">
          Welcome, {user?.name}. Here are your direct reports and key data.
        </p>

        {error && (
          <div className="mt-4 text-sm rounded-xl px-4 py-3 border bg-red-50 text-red-700 border-red-200 inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <div className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`p-6 rounded-3xl ${glass}`}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
              <Users className="h-5 w-5 text-amber-600" /> My Team (
              {directReports.length})
            </h2>

            {loading ? (
              <div className="text-center p-8 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading team data...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-white/60 border-b">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                        Employee Name
                      </th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                        Email
                      </th>
                      {/* Placeholder for other data */}
                      <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {directReports.map((emp) => (
                      <tr key={emp._id} className="border-t hover:bg-white/60">
                        <td className="px-4 py-3 font-medium">{emp.name}</td>
                        <td className="px-4 py-3 text-gray-700">{emp.email}</td>
                        {/* Placeholder for real data (e.g., pending leave count) */}
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!directReports.length && (
                      <tr>
                        <td
                          className="px-4 py-10 text-center text-gray-500"
                          colSpan={3}
                        >
                          You currently have no direct reports assigned.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
          {/* You would add Task, Attendance, Performance, and Leave Request components/sections here */}
        </div>
      </div>
    </div>
  );
}
