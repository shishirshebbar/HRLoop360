import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Users,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const glass =
  "bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// --- CONFIGURATION CONSTANT ---
const EMPLOYEES_PER_PAGE = 5;

// =========================================================================
// ✅ FIX: MOVE EmployeeListCard OUTSIDE THE MAIN COMPONENT
// This stabilizes the component reference, preventing the input's DOM node
// from being replaced on every keystroke and losing focus.
// =========================================================================
const EmployeeListCard = ({
  glass,
  filteredEmployees,
  searchTerm,
  setSearchTerm,
  paginatedEmployees,
  selectedEmployee,
  handleEmployeeSelect,
  managers,
  totalPages,
  currentPage,
  setCurrentPage,
}) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className={`lg:col-span-1 p-5 rounded-3xl ${glass}`}
  >
    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
      <Users className="h-5 w-5" /> Employees ({filteredEmployees.length})
    </h2>

    {/* Search Input */}
    <div className="relative mb-4">
      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
      <input
        type="search"
        placeholder="Search employee name or email..."
        className="w-full pl-9 pr-3 py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        // Prevent form submission on 'Enter' key
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
      />
    </div>

    {/* Employee List */}
    <div className="space-y-2 overflow-y-auto max-h-[60vh] pb-2">
      {paginatedEmployees.map((emp) => {
        // Determine the currently assigned manager's name
        const currentManager = managers.find(
          (m) => m._id === (emp.manager || emp.managerDetails?._id)
        );

        return (
          <div
            key={emp._id}
            onClick={() => handleEmployeeSelect(emp)}
            className={`p-3 rounded-xl cursor-pointer transition flex justify-between items-center ${
              selectedEmployee?._id === emp._id
                ? "bg-indigo-100 ring-2 ring-indigo-400"
                : "hover:bg-gray-50 border border-gray-100"
            }`}
          >
            <div>
              <p className="font-medium text-gray-800">{emp.name}</p>
              <p className="text-xs text-gray-500">
                {currentManager
                  ? `Manager: ${currentManager.name}`
                  : "Manager: None Assigned"}
              </p>
            </div>
            {currentManager && (
              <span className="text-xs text-indigo-600 px-2 py-1 bg-indigo-50 rounded-full">
                Assigned
              </span>
            )}
          </div>
        );
      })}

      {!paginatedEmployees.length && (
        <p className="text-center text-gray-500 py-10">
          {searchTerm
            ? "No employees match your search."
            : "No employees found."}
        </p>
      )}
    </div>

    {/* Pagination Controls */}
    {totalPages > 1 && (
      <div className="flex justify-center items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-full border bg-white disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-full border bg-white disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )}
  </motion.div>
);
// =========================================================================

export default function AdminAssignManager() {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [assignedManagerId, setAssignedManagerId] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NEW STATE FOR SEARCH AND PAGINATION ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // -------------------------------------------

  const token = localStorage.getItem("token");

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [empRes, mgrRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/users?roles=Employee`, { headers }),
          axios.get(`${BASE_URL}/api/admin/managers`, { headers }),
        ]);
        setEmployees(empRes.data || []);
        setManagers(mgrRes.data || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [headers]);

  useEffect(() => {
    if (selectedEmployee) {
      setAssignedManagerId(
        selectedEmployee.manager?._id || selectedEmployee.manager || ""
      );
    }
  }, [selectedEmployee]);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setMessage(""); // Clear message on new selection
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      await axios.patch(
        `${BASE_URL}/api/admin/assign-manager/${selectedEmployee._id}`,
        { managerId: assignedManagerId || null }, // Pass null if unassigned
        { headers }
      );

      const managerDetails = assignedManagerId
        ? managers.find((m) => m._id === assignedManagerId)
        : null;

      // Update the local employee list with the new data
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === selectedEmployee._id
            ? {
                ...emp,
                manager: assignedManagerId,
                managerDetails: managerDetails,
              }
            : emp
        )
      );

      // Update selected employee's data
      setSelectedEmployee((prev) => ({
        ...prev,
        manager: assignedManagerId,
        managerDetails: managerDetails,
      }));

      setMessage(
        `Manager successfully ${assignedManagerId ? "assigned" : "unassigned"}!`
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign manager.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase();

    const filtered = employees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term)
    );

    return filtered;
  }, [employees, searchTerm]);

  // Reset page to 1 when the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredEmployees.length / EMPLOYEES_PER_PAGE);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * EMPLOYEES_PER_PAGE;
    const endIndex = startIndex + EMPLOYEES_PER_PAGE;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-8 text-center text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
          Loading user data...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pt-8 pb-16">
        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl md:text-3xl font-bold"
        >
          Assign Manager 👨‍💼
        </motion.h1>
        <p className="text-gray-600 mt-1">
          Select an employee and assign them to a Senior Manager.
        </p>

        {error && (
          <div className="mt-4 text-sm rounded-xl px-4 py-3 border bg-red-50 text-red-700 border-red-200 inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          {/* Employee List (Left Column) */}
          <EmployeeListCard
            glass={glass}
            filteredEmployees={filteredEmployees}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            paginatedEmployees={paginatedEmployees}
            selectedEmployee={selectedEmployee}
            handleEmployeeSelect={handleEmployeeSelect}
            managers={managers}
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />

          {/* Assignment Form (Right Column) */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`lg:col-span-2 p-6 rounded-3xl ${glass}`}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5" /> Assign/Update Manager
            </h2>

            {!selectedEmployee ? (
              <div className="p-10 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-200">
                <p>
                  ← Select an employee from the list to assign or change their
                  manager.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAssign} className="space-y-4">
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <p className="font-bold text-indigo-700">
                    Selected Employee:
                  </p>
                  <p className="text-sm text-indigo-600">
                    {selectedEmployee.name} ({selectedEmployee.email})
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="manager-select"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Select Senior Manager
                  </label>
                  <div className="relative">
                    <select
                      id="manager-select"
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none appearance-none bg-white"
                      value={assignedManagerId}
                      onChange={(e) => setAssignedManagerId(e.target.value)}
                    >
                      <option value="">-- Unassign Manager --</option>
                      {managers.map((mgr) => (
                        <option key={mgr._id} value={mgr._id}>
                          {mgr.name} ({mgr.email})
                        </option>
                      ))}
                    </select>
                    <UserCheck className="h-5 w-5 absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                  {isSubmitting ? "Saving..." : "Save Manager Assignment"}
                </motion.button>

                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-2 text-sm rounded-xl px-3 py-2 border bg-emerald-50 text-emerald-700 border-emerald-200 inline-flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" /> {message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
