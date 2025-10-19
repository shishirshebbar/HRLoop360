import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  UserCheck,
  X,
} from "lucide-react";
import Navbar from "../../components/Navbar";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const glass =
  "bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

export default function LeaveApprovalPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const token = localStorage.getItem("token");
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchPendingRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}/api/hr/leave/approvals`, {
        headers,
      });
      setRequests(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch pending leave requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [headers]);

  const handleProcessRequest = async (requestId, status) => {
    setProcessingId(requestId);
    setError("");
    try {
      await axios.patch(
        `${BASE_URL}/api/hr/leave/approve/${requestId}`,
        {
          status,
        },
        { headers }
      );

      // Remove the processed request from the list
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${status.toLowerCase()} request.`
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <Navbar />
      <div className="mx-auto max-w-6xl p-8">
        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold mb-8 flex items-center gap-3"
        >
          <UserCheck className="h-7 w-7 text-indigo-600" /> Leave Approval
          Center
        </motion.h1>

        {error && (
          <div className="mb-4 text-sm rounded-xl px-4 py-3 border bg-red-50 text-red-700 border-red-200 inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {loading ? (
          <div
            className={`p-10 rounded-3xl ${glass} text-center text-gray-500 flex items-center justify-center gap-2`}
          >
            <Loader2 className="h-5 w-5 animate-spin" /> Loading pending
            requests...
          </div>
        ) : requests.length === 0 ? (
          <div
            className={`p-10 rounded-3xl ${glass} text-center text-gray-500`}
          >
            No pending leave requests require your attention!
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-2xl border ${glass}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {request.employee.name}
                    </h3>
                    <p className="text-sm text-gray-600 italic">
                      ({request.employee.email})
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full border text-yellow-700 bg-yellow-100 border-yellow-200`}
                  >
                    Pending
                  </span>
                </div>

                <div className="mt-3 p-3 bg-indigo-50 rounded-xl">
                  <p className="font-medium text-indigo-800 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {request.type} Leave
                  </p>
                  <p className="text-sm mt-1">
                    Period: {new Date(request.startDate).toLocaleDateString()} -{" "}
                    {new Date(request.endDate).toLocaleDateString()}
                  </p>
                </div>

                <p className="text-sm text-gray-700 mt-3 font-semibold">
                  Reason:
                </p>
                <p className="text-sm text-gray-600 mt-1 p-2 border rounded-lg bg-gray-50">
                  {request.reason}
                </p>

                <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                  <motion.button
                    onClick={() =>
                      handleProcessRequest(request._id, "Approved")
                    }
                    disabled={processingId !== null}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 transition font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {processingId === request._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Approve
                  </motion.button>
                  <motion.button
                    onClick={() =>
                      handleProcessRequest(request._id, "Rejected")
                    }
                    disabled={processingId !== null}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {processingId === request._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Reject
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
