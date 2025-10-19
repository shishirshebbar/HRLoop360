import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Users,
  LineChart,
  Clock,
  FileText,
  BadgeCheck,
  Building2,
  Mic,
  PhoneCall,
  BrainCircuit,
  Fingerprint,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Gauge,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ----------------------------
// Login Component (as provided)
// ----------------------------
export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const role = res.data.user.role.trim();

      switch (role) {
        case "Management Admin":
          navigate("/admin");
          break;
        case "Senior Manager":
          navigate("/manager");
          break;
        case "HR Recruiter":
          navigate("/hr");
          break;
        case "Employee":
          navigate("/employee");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-center mb-2">Login</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">
        Sign in to your role-based workspace
      </p>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-medium">
          Login
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Don’t have an account?{" "}
        <span
          className="text-indigo-600 cursor-pointer hover:underline"
          onClick={() => navigate("/register")}
        >
          Create one
        </span>
      </p>
    </div>
  );
}

// -----------------------------------
// Decorative utilities & motion config
// -----------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const glass =
  "bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

// -----------------------
// Main Landing Page Export
// -----------------------
export default function LandingHRMS() {
  const [openLogin, setOpenLogin] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 text-gray-900">
      {/* Floating gradient blobs */}
      <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-sky-300/30 blur-3xl" />
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-[20rem] w-[20rem] rounded-full bg-purple-300/20 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-white/50">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div initial={{ rotate: -8 }} animate={{ rotate: 0 }}>
              <Bot className="h-7 w-7 text-indigo-600" />
            </motion.div>
            <span className="font-semibold">AetherHR</span>
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI‑powered HRMS
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-indigo-600">Features</a>
            <a href="#ai" className="hover:text-indigo-600">AI Suite</a>
            <a href="#roles" className="hover:text-indigo-600">Roles</a>
            <a href="#pricing" className="hover:text-indigo-600">Pricing</a>
            <a href="#faq" className="hover:text-indigo-600">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenLogin(true)}
              className="px-4 py-2 rounded-xl border border-gray-300 hover:border-indigo-400 hover:text-indigo-700 transition text-sm"
            >
              Log in
            </button>
            <a
              href="#cta"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition text-sm inline-flex items-center gap-2"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 grid md:grid-cols-2 gap-10 items-center">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight">
              AI‑powered HRMS Platform for modern teams
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-gray-600">
              Centralize employee data, automate payroll, track performance, and hire faster with conversational AI & voice models. Multi‑role access for Admins, Managers, Recruiters and Employees.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setOpenLogin(true)}
                className="px-5 py-3 rounded-xl bg-gray-900 text-white hover:bg-black transition inline-flex items-center gap-2"
              >
                Try the demo <ChevronRight className="h-4 w-4" />
              </button>
              <a href="#features" className="px-5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 transition">
                Explore features
              </a>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-6 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> SOC2-ready</div>
              <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4" /> Role-based SSO</div>
              <div className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Realtime Dashboard</div>
            </motion.div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className={`relative ${glass} rounded-3xl p-6`}
          >
            <div className="grid grid-cols-3 gap-4">
              <MetricCard icon={<Users />} label="Employees" value="1,284" trend="▲ 3.2%" />
              <MetricCard icon={<Clock />} label="Attendance" value="97.4%" trend="▲ 1.1%" />
              <MetricCard icon={<LineChart />} label="Payroll" value="$2.1M" trend="▼ 0.4%" />
              <MetricCard icon={<BarChart3 />} label="Performance" value="82/100" trend="▲ 4.8%" />
              <MetricCard icon={<BrainCircuit />} label="Predictions" value="High" trend="" />
              <MetricCard icon={<LayoutDashboard />} label="Satisfaction" value="8.6/10" trend="▲ 0.6" />
            </div>
            <div className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
              <Badge text="Employee data mgmt" icon={<FileText className="h-3.5 w-3.5" />} />
              <Badge text="Attendance & leave" icon={<Clock className="h-3.5 w-3.5" />} />
              <Badge text="Payroll & taxes" icon={<LineChart className="h-3.5 w-3.5" />} />
              <Badge text="Performance tracking" icon={<BadgeCheck className="h-3.5 w-3.5" />} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core HRMS Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold">All core HRMS in one place</motion.h2>
          <motion.p variants={fadeUp} className="mt-2 text-gray-600 max-w-2xl">
            Employee data management, attendance tracking, payroll automation, performance reviews, and more—designed to scale.
          </motion.p>
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Users} title="Employee Data Mgmt" desc="Unified records, docs & compliance with audit trails." />
            <FeatureCard icon={Clock} title="Attendance & Leave" desc="Shifts, PTO, geo‑fencing, biometric & web check‑ins." />
            <FeatureCard icon={LineChart} title="Payroll & Taxes" desc="Run payroll in minutes with auto TDS/EPF/ESI." />
            <FeatureCard icon={BadgeCheck} title="Performance" desc="OKRs, 360° reviews, goals, and continuous feedback." />
            <FeatureCard icon={Building2} title="Org Structure" desc="Teams, locations, cost centers & reporting lines." />
            <FeatureCard icon={FileText} title="Documents" desc="Letters, offers, contracts & policy acknowledgements." />
          </div>
        </motion.div>
      </section>

      {/* AI Suite */}
      <section id="ai" className="mx-auto max-w-7xl px-4 pb-16">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-indigo-600" /> AI Recruiting & People Analytics
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-2 text-gray-600 max-w-2xl">
            Automate hiring with AI‑driven resume screening, zero‑touch candidate evaluation, and conversational/voice interview models. Predict performance & satisfaction, spot skill gaps, and optimize offer acceptance.
          </motion.p>

          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AIcard icon={Fingerprint} title="Resume Screening" desc="Parse & rank resumes, match to roles, auto‑shortlist—no human intervention." />
            <AIcard icon={Mic} title="Voice Interviews" desc="AI interviewer conducts calls, scores responses, and summarizes fit." />
            <AIcard icon={PhoneCall} title="Conversational Chat" desc="Natural chat for candidate Q&A, scheduling & updates." />
            <AIcard icon={BrainCircuit} title="Performance Prediction" desc="Signal‑based prediction of employee outcomes & flight risk." />
            <AIcard icon={BadgeCheck} title="Offer Optimizer" desc="Predict acceptance probability; recommend comp & timing." />
            <AIcard icon={Gauge} title="Skill Gaps Analyzer" desc="Spot gaps vs. role matrices; propose learning paths." />
            <AIcard icon={LayoutDashboard} title="Satisfaction Prediction" desc="Model sentiment & pulse surveys to forecast morale." />
          </div>
        </motion.div>
      </section>

      {/* Roles */}
      <section id="roles" className="mx-auto max-w-7xl px-4 pb-16">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold">Multi‑role login & access</motion.h2>
          <motion.p variants={fadeUp} className="mt-2 text-gray-600 max-w-2xl">
            Tailored workspaces for Management Admin, Senior Manager, HR Recruiter, and Employee.
          </motion.p>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <RoleCard label="Management Admin" bullets={["Company‑wide controls", "Policies & security", "Finance & payroll"]} />
            <RoleCard label="Senior Manager" bullets={["Team dashboards", "Approvals & budgets", "Headcount planning"]} />
            <RoleCard label="HR Recruiter" bullets={["Pipelines & sourcing", "AI screening", "Scheduling"]} />
            <RoleCard label="Employee" bullets={["Self‑service", "Leaves & payslips", "Feedback & goals"]} />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setOpenLogin(true)}
              className="px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition inline-flex items-center gap-2"
            >
              Log in to your role <ArrowRight className="h-4 w-4" />
            </button>
            <a href="#cta" className="px-5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 transition">
              Request a demo
            </a>
          </div>
        </motion.div>
      </section>

      {/* CTA & Pricing teaser */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 pb-16">
        <div className={`rounded-3xl p-8 md:p-10 ${glass}`}>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl md:text-2xl font-bold">Transparent pricing that scales</h3>
              <p className="mt-2 text-gray-600">Start free, upgrade when you grow. Only pay for active employees.</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> Unlimited roles & SSO</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> Payroll automation & filings</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> AI recruiting & analytics suite</li>
              </ul>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <PriceCard tier="Starter" price="$0" sub="up to 25 employees"/>
              <PriceCard tier="Growth" price="$4" sub="per employee / mo" highlight/>
              <PriceCard tier="Enterprise" price="Custom" sub="SLA & controls"/>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-20">
        <h3 className="text-2xl font-bold">FAQs</h3>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <FAQ q="How does AI resume screening work?" a="We parse resumes, extract entities and skills, and rank candidates against job matrices. You control fairness & thresholds."/>
          <FAQ q="Do you support biometric attendance?" a="Yes, via integrations and web/mobile check‑ins with geofencing & photo verification."/>
          <FAQ q="Is data secure?" a="We apply role‑based access, encryption at rest & in transit, and detailed audit logging."/>
          <FAQ q="Can I migrate from another HRMS?" a="We offer assisted migration for employees, payroll history, and policies."/>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Bot className="h-4 w-4 text-indigo-600" />
            <span>AetherHR © {new Date().getFullYear()}</span>
          </div>
          <div className="text-sm text-gray-600">Made with ❤️ for people ops</div>
        </div>
      </footer>

      {/* Login Modal */}
      {openLogin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpenLogin(false)}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpenLogin(false)}
              className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-white shadow border border-gray-200 grid place-items-center text-gray-600 hover:text-gray-900"
              aria-label="Close login"
            >
              ✕
            </button>
            <Login />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// ----------------------
// Small presentational UI
// ----------------------
function MetricCard({ icon, label, value, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl p-4 ${glass}`}
    >
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">{icon}</div>
        {trend && (
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-gray-500 mt-1">{label}</div>
      </div>
    </motion.div>
  );
}

function Badge({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-white/60 text-gray-700 text-xs">
      {icon} {text}
    </span>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`p-5 rounded-2xl ${glass} h-full`}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 grid place-items-center rounded-xl bg-indigo-600 text-white">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-gray-600">{desc}</p>
    </motion.div>
  );
}

function AIcard({ icon: Icon, title, desc }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className={`p-5 rounded-2xl ${glass}`}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 grid place-items-center rounded-xl bg-sky-600 text-white">
          <Icon className="h-5 w-5" />
        </div>
        <h4 className="font-semibold">{title}</h4>
      </div>
      <p className="mt-3 text-sm text-gray-600">{desc}</p>
    </motion.div>
  );
}

function RoleCard({ label, bullets = [] }) {
  return (
    <motion.div whileHover={{ y: -4 }} className={`p-5 rounded-2xl ${glass}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{label}</h4>
        <ChevronRight className="h-4 w-4 text-gray-500" />
      </div>
      <ul className="mt-3 space-y-1 text-sm text-gray-600">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {b}
          </li>
        ))}
      </ul>
      <button className="mt-4 w-full rounded-xl border border-gray-300 hover:border-indigo-400 py-2 text-sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        Log in as {label}
      </button>
    </motion.div>
  );
}

function PriceCard({ tier, price, sub, highlight = false }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className={`p-5 rounded-2xl border ${highlight ? "bg-indigo-600 text-white border-indigo-600" : "bg-white/70 border-white/60"}`}
    >
      <div className="flex items-baseline justify-between">
        <h4 className={`font-semibold ${highlight ? "text-white" : ""}`}>{tier}</h4>
        {highlight && (
          <span className="text-xs px-2 py-1 rounded-full bg-white/20 border border-white/30">Popular</span>
        )}
      </div>
      <div className="mt-4 text-3xl font-extrabold">{price}</div>
      <div className={`text-sm mt-1 ${highlight ? "text-white/90" : "text-gray-600"}`}>{sub}</div>
      <button className={`mt-5 w-full rounded-xl py-2 font-medium transition ${highlight ? "bg-white text-indigo-700 hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-black"}`}>
        Choose {tier}
      </button>
    </motion.div>
  );
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`p-5 rounded-2xl ${glass}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-medium">{q}</span>
        <ChevronRight className={`h-4 w-4 transition ${open ? "rotate-90" : ""}`} />
      </button>
      {open && <p className="mt-3 text-sm text-gray-600">{a}</p>}
    </div>
  );
}
