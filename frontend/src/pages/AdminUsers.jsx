import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Mail, UserCircle2 } from "lucide-react";
import Navbar from "../components/Navbar"; // ✅ Include Navbar

const glass =
  "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

const roleStyles = {
  "Management Admin": "bg-purple-100 text-purple-700 border-purple-200",
  "Senior Manager": "bg-amber-100 text-amber-700 border-amber-200",
  "HR Recruiter": "bg-sky-100 text-sky-700 border-sky-200",
  Employee: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function AdminUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");

  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
    setLoading(true);
    setErr("");
    axios
      .get("http://localhost:5000/api/users", { headers })
      .then((res) => setAllUsers(res.data || []))
      .catch((e) => setErr(e.response?.data?.message || "Failed to fetch users"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let data = allUsers;
    if (role !== "All") data = data.filter((u) => u.role?.trim() === role);
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [allUsers, role, query]);

  return (
    <>
      <Navbar /> {/* ✅ Navbar included */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
          <p className="text-gray-600">
            Search, filter, and review all users across roles.
          </p>
        </div>

        <div className={`p-5 rounded-3xl ${glass}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {["All", "Management Admin", "Senior Manager", "HR Recruiter", "Employee"].map(
                (r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`px-3 py-1.5 rounded-full border text-sm transition ${
                      role === r
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white/70 border-white/60"
                    }`}
                  >
                    {r}
                  </button>
                )
              )}
            </div>

            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                placeholder="Search name, email, role..."
                className="pl-9 pr-10 py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Filter className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-white/60 border-b">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">Email</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">Role</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {loading && (
                    <tr>
                      <td className="px-4 py-5" colSpan={3}>
                        <div className="h-6 w-full animate-pulse rounded bg-gray-200/70" />
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filtered.map((u) => (
                      <motion.tr
                        key={u._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-t hover:bg-white/60"
                      >
                        <td className="px-4 py-3 font-medium flex items-center gap-2">
                          <UserCircle2 className="h-5 w-5 text-gray-400" /> {u.name}
                        </td>
                        <td className="px-4 py-3 text-gray-700 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" /> {u.email}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${
                              roleStyles[u.role] ||
                              "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                      </motion.tr>
                    ))}

                  {!loading && !filtered.length && (
                    <tr>
                      <td
                        className="px-4 py-10 text-center text-gray-500"
                        colSpan={3}
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {err && (
            <div className="mt-4 text-sm rounded-xl px-3 py-2 border bg-red-50 text-red-700 border-red-200 inline-flex items-center gap-2">
              {err}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
