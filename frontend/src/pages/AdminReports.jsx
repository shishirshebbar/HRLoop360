import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Briefcase,
  Crown,
  Calendar,
  BarChart3,
  UserCircle2,
} from "lucide-react";
import Navbar from "../components/Navbar"; // ✅ Include Navbar

const glass =
  "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

function Card({ icon, label, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`p-5 rounded-2xl ${glass}`}
    >
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">{icon}</div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-extrabold">{value}</div>
        <div className="text-xs text-gray-600 mt-1">{label}</div>
      </div>
    </motion.div>
  );
}

export default function AdminReports() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
    axios
      .get("http://localhost:5000/api/users", { headers })
      .then((res) => setUsers(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c = { admin: 0, mgr: 0, hr: 0, emp: 0 };
    users.forEach((u) => {
      const r = u.role?.trim();
      if (r === "Management Admin") c.admin++;
      else if (r === "Senior Manager") c.mgr++;
      else if (r === "HR Recruiter") c.hr++;
      else if (r === "Employee") c.emp++;
    });
    return c;
  }, [users]);

  const total = users.length;

  return (
    <>
      <Navbar /> {/* ✅ Navbar included */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Reports</h1>
          <p className="text-gray-600">
            Organization overview and role distribution.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card icon={<Users />} label="Total Users" value={loading ? "…" : total} />
          <Card icon={<Crown />} label="Admins" value={loading ? "…" : counts.admin} />
          <Card icon={<Building2 />} label="Managers" value={loading ? "…" : counts.mgr} />
          <Card icon={<Briefcase />} label="Recruiters" value={loading ? "…" : counts.hr} />
          <Card icon={<Users />} label="Employees" value={loading ? "…" : counts.emp} />
        </div>

        <div className={`mt-6 p-6 rounded-3xl ${glass}`}>
          <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            Role Distribution
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Distribution bars */}
            <div className="space-y-3">
              {[
                ["Management Admin", counts.admin, "bg-purple-500/80"],
                ["Senior Manager", counts.mgr, "bg-amber-500/80"],
                ["HR Recruiter", counts.hr, "bg-sky-500/80"],
                ["Employee", counts.emp, "bg-emerald-500/80"],
              ].map(([label, val, cls]) => {
                const pct = total ? Math.round((val / total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{label}</span>
                      <span>
                        {val} ({pct}%)
                      </span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-3 ${cls}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent signups */}
            <div>
              <div className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600" /> Recent Signups
              </div>
              <div className="space-y-2">
                {users
                  .slice()
                  .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                  .slice(0, 6)
                  .map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center justify-between p-3 rounded-xl border bg-white/70"
                    >
                      <div className="flex items-center gap-2">
                        <UserCircle2 className="h-5 w-5 text-gray-400" />
                        <div className="text-sm">
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full border bg-gray-50">
                        {u.role}
                      </span>
                    </div>
                  ))}
                {!loading && !users.length && (
                  <div className="text-sm text-gray-500">No users yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
