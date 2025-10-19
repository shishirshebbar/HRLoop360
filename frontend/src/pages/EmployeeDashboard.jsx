import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle2,
  Loader2,
  AlertCircle,
  Briefcase,
  Mail,
  Calendar,
  UserCheck,
  Code,
} from "lucide-react";
import Navbar from "../components/Navbar";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const glass =
  "bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  useEffect(() => {
    const fetchEmployeeData = async () => {
      setLoading(true);
      setError("");
      try {
        // *** CORRECTED API ENDPOINT ***
        const res = await axios.get(`${BASE_URL}/api/users/profile`, {
          headers,
        });
        setEmployee(res.data);
      } catch (err) {
        // The error message you were seeing
        setError(
          err.response?.data?.message || "Failed to load employee profile data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [headers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading Profile Data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <Navbar />
      <div className="mx-auto max-w-4xl p-8">
        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold mb-8 flex items-center gap-3"
        >
          <UserCircle2 className="h-7 w-7 text-indigo-600" /> My Profile
        </motion.h1>

        <AnimatePresence>
          {error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 rounded-3xl border bg-red-50 text-red-700 border-red-200 flex items-center gap-4"
            >
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`p-8 rounded-3xl ${glass} space-y-6`}
            >
              <div className="text-center pb-4 border-b border-gray-100">
                <UserCircle2 className="h-20 w-20 text-indigo-600 mx-auto" />
                <h2 className="text-3xl font-bold text-gray-800 mt-3">
                  {employee?.name}
                </h2>
                <p className="text-md text-gray-500">{employee?.role}</p>
              </div>

              <div className="space-y-3">
                <ProfileItem
                  icon={Mail}
                  label="Email"
                  value={employee?.email}
                />
                <ProfileItem
                  icon={Briefcase}
                  label="Role"
                  value={employee?.role}
                />
                <ProfileItem
                  icon={UserCheck}
                  label="Manager"
                  value={employee?.manager?.name || "Not Assigned"}
                />
                <ProfileItem
                  icon={Code}
                  label="User ID"
                  value={employee?._id}
                />
                {/* <ProfileItem
                  icon={Calendar}
                  label="Joined"
                  value={new Date(employee?.createdAt).toLocaleDateString()}
                /> */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const ProfileItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
    <Icon className="h-5 w-5 text-indigo-500 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
    </div>
  </div>
);
