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
  RefreshCw,
  Shield,
  Layers,
  Lightbulb,
  HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ----------------------------
// Login Component (enhanced)
// ----------------------------
export function Login({ defaultRole = "" }) {
  // Demo credentials per role
  const demoCredentials = {
    "Management Admin": { email: "admin@example.com", password: "admin123" },
    "Senior Manager": { email: "manager@example.com", password: "manager" },
    "HR Recruiter": { email: "hrr@example.com", password: "hrr" },
    Employee: { email: "employee@example.com", password: "employee" },
  };

  // Initialize from defaultRole if provided, otherwise blank (still editable)
  const [role, setRole] = useState(defaultRole || "");
  const [email, setEmail] = useState(
    defaultRole && demoCredentials[defaultRole]?.email ? demoCredentials[defaultRole].email : ""
  );
  const [password, setPassword] = useState(
    defaultRole && demoCredentials[defaultRole]?.password ? demoCredentials[defaultRole].password : ""
  );
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleQuickFill = (r) => {
    setRole(r);
    if (demoCredentials[r]) {
      setEmail(demoCredentials[r].email);
      setPassword(demoCredentials[r].password);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const detectedRole = res.data.user.role.trim();

      switch (detectedRole) {
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
    <div className="w-full max-w-m p-7 bg-white rounded-3xl shadow-2xl border border-gray-100">
      <div className="text-center mb-3">
        <h2 className="text-2xl font-extrabold">
          <span className="bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
            Login
          </span>
        </h2>
      </div>

      {/* Note + Quick demo pills */}
      <div className="mb-5 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-sky-50 px-4 py-3 shadow-sm">
        <p className="text-xs leading-relaxed text-indigo-800">
          <span className="font-semibold">Tip:</span> Use the quick-fill buttons below for demo credentials,
          or type your own email &amp; password.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Management Admin", "Senior Manager", "HR Recruiter", "Employee"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleQuickFill(r)}
              className="inline-flex items-center gap-2 rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
            >
              ⚡ {r}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4 text-center bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
          <input
            type="email"
            placeholder="you@company.com"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none placeholder-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none placeholder-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {/* Role selection (for clarity in the UI; backend relies on credentials) */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Role</label>
          <select
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-700"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Select your role</option>
            <option value="Management Admin">Management Admin</option>
            <option value="Senior Manager">Senior Manager</option>
            <option value="HR Recruiter">HR Recruiter</option>
            <option value="Employee">Employee</option>
          </select>
        </div>

        <button className="w-full bg-gradient-to-r from-indigo-600 to-sky-600 text-white py-3 rounded-xl hover:opacity-95 transition font-semibold shadow-md">
          Login
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Don’t have an account?{" "}
        <span
          className="text-indigo-600 cursor-pointer hover:underline font-medium"
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
            <span className="font-semibold">HRLoop360</span>
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI‑Native HRMS
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-indigo-600">Features</a>
            <a href="#journey" className="hover:text-indigo-600">AI Journey</a>
            <a href="#ai" className="hover:text-indigo-600">AI Suite</a>
            <a href="#unique" className="hover:text-indigo-600">Why Us</a>
            <a href="#roles" className="hover:text-indigo-600">Roles</a>
            
            <a href="#faq" className="hover:text-indigo-600">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">


  <button
    onClick={() => setOpenLogin(true)}
    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white hover:opacity-95 transition text-sm font-semibold shadow-md inline-flex items-center gap-2"
  >
    Get started <ArrowRight className="h-4 w-4" />
  </button>
</div>

        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 grid md:grid-cols-2 gap-10 items-center">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight">
  The Only AI-Native HRMS That Thinks Like an HR Partner
</motion.h1>
<motion.p variants={fadeUp} className="mt-4 text-lg text-gray-600">
  Unlike traditional HRMS or surface-level AI add-ons, HRLoop360 is built as a true AI-native platform — mapping the full HR–Employee lifecycle from resume to retention. It screens resumes, detects skill gaps, predicts performance, and measures satisfaction, forming a 360° intelligent HR loop that continuously learns and improves workforce decisions.
</motion.p>

<div className="mt-8 grid md:grid-cols-2 gap-6">
  <div className={`p-6 rounded-2xl ${glass}`}>
    <h3 className="text-xl font-semibold text-indigo-700 mb-2">HRLoop360 (AI-Native)</h3>
    <ul className="text-sm text-gray-700 space-y-2">
      <li> Unified AI across all HR functions — recruitment to retention</li>
      <li> Predictive analytics: offer acceptance, performance, satisfaction</li>
      <li> Explainable outputs with data-driven actions</li>
      <li> Adaptive learning — every cycle improves the next</li>
  
    </ul>
  </div>

  <div className={`p-6 rounded-2xl bg-white/60 border border-gray-200`}>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">Other AI-HR Suites</h3>
    <ul className="text-sm text-gray-600 space-y-2">
      <li> Isolated AI features — resume parsing or chatbots only</li>
      <li> Limited explainability — black-box predictions</li>
      <li> No feedback loop between hiring, learning, and retention</li>

      <li> Workflow automation without strategic intelligence</li>
    </ul>
  </div>
</div>
            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setOpenLogin(true)}
                className="px-5 py-3 rounded-xl bg-gray-900 text-white hover:bg-black transition inline-flex items-center gap-2"
              >
                Try the demo <ChevronRight className="h-4 w-4" />
              </button>
              <a href="#journey" className="px-5 py-3 rounded-xl border border-gray-300 hover:border-gray-400 transition">
                See the AI Journey
              </a>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> SOC2‑ready</div>
              <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4" /> Role‑based SSO</div>
              <div className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Real‑time Dashboard</div>
            </motion.div>
          </motion.div>

    {/* Hero visual — AI HR Lifecycle Diagram */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
  className={`relative ${glass} rounded-3xl p-8 flex flex-col items-center justify-center text-center`}
>
  <h3 className="text-xl font-bold text-indigo-700 mb-4">
    The 360° AI-Powered HR–Employee Journey
  </h3>

  <div className="relative flex flex-wrap justify-center items-center gap-6 text-sm text-gray-700">
    <div className="flex flex-col items-center">
      <Fingerprint className="h-8 w-8 text-indigo-600 mb-1" />
      <span className="font-medium">AI Resume Screening</span>
      <span className="text-xs text-gray-500">Smart candidate matching</span>
    </div>

    <ArrowRight className="h-5 w-5 text-gray-400 hidden sm:block" />

    <div className="flex flex-col items-center">
      <Gauge className="h-8 w-8 text-sky-600 mb-1" />
      <span className="font-medium">Skill Gaps Analyzer</span>
      <span className="text-xs text-gray-500">Personalized learning plans</span>
    </div>

    <ArrowRight className="h-5 w-5 text-gray-400 hidden sm:block" />

    <div className="flex flex-col items-center">
      <BadgeCheck className="h-8 w-8 text-emerald-600 mb-1" />
      <span className="font-medium">Offer Optimizer</span>
      <span className="text-xs text-gray-500">Predict acceptance likelihood</span>
    </div>

    <ArrowRight className="h-5 w-5 text-gray-400 hidden sm:block" />

    <div className="flex flex-col items-center">
      <BrainCircuit className="h-8 w-8 text-purple-600 mb-1" />
      <span className="font-medium">Performance Prediction</span>
      <span className="text-xs text-gray-500">Data-driven employee insights</span>
    </div>

    <ArrowRight className="h-5 w-5 text-gray-400 hidden sm:block" />

    <div className="flex flex-col items-center">
      <LayoutDashboard className="h-8 w-8 text-pink-600 mb-1" />
      <span className="font-medium">Satisfaction Prediction</span>
      <span className="text-xs text-gray-500">Engagement & retention signals</span>
    </div>
  </div>

  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-gray-500">
    <RefreshCw className="h-4 w-4 text-indigo-500" />
    <span>Each stage feeds the next — forming a continuous AI learning loop.</span>
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
            <FeatureCard icon={Fingerprint} title="AI Resume Screener" desc="Automatically extract, score, and rank resumes against job descriptions with zero human screening." />
            <FeatureCard icon={Gauge} title="Skill Gaps Analyzer" desc="Compare current employee skills with role requirements and generate personalized AI upskilling plans." />
            <FeatureCard icon={BadgeCheck} title="Offer Acceptance Optimizer" desc="Predict offer acceptance probability using compensation, benefits, and reputation data to reduce rejections." />
            <FeatureCard icon={BrainCircuit} title="Performance Prediction" desc="Continuously monitor KPIs and predict employee performance with explainable AI insights." />
            <FeatureCard icon={LayoutDashboard} title="Satisfaction Prediction" desc="Analyze micro‑surveys and comments to forecast team morale and prevent burnout." />
            <FeatureCard icon={RefreshCw} title="Continuous AI HR Loop" desc="Each AI stage feeds the next — creating a learning HR ecosystem that improves every hiring and retention cycle." />

          </div>
        </motion.div>
      </section>

      {/* AI‑Driven HR–Employee Journey (CYCLE) */}
      <section id="journey" className="mx-auto max-w-7xl px-4 pb-4">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-indigo-600" /> The AI‑Driven HR–Employee Journey
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-2 text-gray-600 max-w-3xl">
            A continuous loop that improves every cycle: Resume Screening → Skill Alignment → Offer Optimization → Performance Prediction → Satisfaction Analytics → back to Hiring Insights.
          </motion.p>

          <div className="mt-8 grid lg:grid-cols-2 gap-10 items-center">
            {/* Left: Cycle graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`relative ${glass} rounded-3xl p-6 min-h-[28rem]`}
            >
              <JourneyCycle />
            </motion.div>

            {/* Right: Step details */}
            <div className="space-y-4">
              <JourneyStep
                index={1}
                title="Recruitment & Talent Acquisition — AI Resume Screener"
                icon={Fingerprint}
                points={[
                  "Upload JD + multiple resumes; we parse multi‑format (PDF/DOCX).",
                  "Extract entities & skill embeddings; score & auto‑rank candidates.",
                  "Generate strengths, gaps & tailored interview questions.",
                ]}
                outcome="Efficient, bias‑aware, data‑driven shortlisting."
              />
              <JourneyStep
                index={2}
                title="Skill Alignment & Learning Readiness — Skill Gaps Analyzer"
                icon={Gauge}
                points={[
                  "Compare current skills vs role matrix or project needs.",
                  "Highlight strengths and below‑threshold skills.",
                  "Produce a personalized AI learning roadmap from Day 1.",
                ]}
                outcome="Every employee starts with a clear upskilling path."
              />
              <JourneyStep
                index={3}
                title="Offer Negotiation — Offer Acceptance Optimizer"
                icon={BadgeCheck}
                points={[
                  "Predict acceptance probability using comp, benefits & brand signals.",
                  "Recommend levers: compensation mix, benefits, and turnaround timing.",
                  "What‑if tuning to improve acceptance rates.",
                ]}
                outcome="Reduced offer rejections and optimized acquisition costs."
              />
              <JourneyStep
                index={4}
                title="Employee Development & Performance — Performance Prediction"
                icon={BrainCircuit}
                points={[
                  "Continuously evaluate OKRs, attendance, sentiment, manager ratings.",
                  "Predict performance scores; flag at‑risk employees early.",
                  "Explainable insights with recommended interventions.",
                ]}
                outcome="Proactive performance management, not reactive reviews."
              />
              <JourneyStep
                index={5}
                title="Engagement & Retention — Satisfaction Prediction"
                icon={LayoutDashboard}
                points={[
                  "Micro‑surveys + comment sentiment feed morale models.",
                  "Team happiness metrics, heatmaps & improvement actions.",
                  "Early warnings for burnout or disengagement.",
                ]}
                outcome="Intervene before attrition; feed insights back to hiring."
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* AI Suite */}
      <section id="ai" className="mx-auto max-w-7xl px-4 pb-16">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-indigo-600" /> AI Recruiting & People Analytics
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-2 text-gray-600 max-w-3xl">
            Automate hiring with AI resume screening and conversational models. Predict performance & satisfaction, spot skill gaps, and optimize offers. 
          </motion.p>

          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AIcard icon={Fingerprint} title="Resume Screening" desc="Parse & rank resumes; match to JDs; generate questions." />

            <AIcard icon={PhoneCall} title="Conversational Chat" desc="Natural chat for candidate Q&A, scheduling & updates." />
            <AIcard icon={BrainCircuit} title="Performance Prediction" desc="Signal‑based outcomes & flight‑risk alerts with reasons." />
            <AIcard icon={BadgeCheck} title="Offer Optimizer" desc="Predict acceptance probability; recommend comp & timing." />
            <AIcard icon={Gauge} title="Skill Gaps Analyzer" desc="Spot gaps vs role matrices; propose learning paths." />
            <AIcard icon={LayoutDashboard} title="Satisfaction Prediction" desc="Model sentiment & pulse surveys to forecast morale." />
          </div>
        </motion.div>
      </section>

      {/* Why We're Different */}
      <section id="unique" className="mx-auto max-w-7xl px-4 pb-16">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold">What makes us unique</motion.h2>
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UniqueCard icon={Lightbulb} title="End‑to‑End AI‑Powered" desc="Not AI‑assisted widgets. Every core HR function uses AI deeply across recruitment, L&D, performance & retention." />
            <UniqueCard icon={Layers} title="Unified AI Layer" desc="Single services/ai abstraction: swap providers, scale safely, add new AI modules fast." />
            <UniqueCard icon={HelpCircle} title="Explainability for HR" desc="Every score shows drivers & actions: why this candidate, what to adjust, how to improve performance." />
            <UniqueCard icon={Shield} title="Enterprise‑grade Access" desc="RBAC with distinct dashboards: Admin, Senior Manager, HR Recruiter, Employee." />
          </div>
        </motion.div>
      </section>

      {/* Roles */}
      <section id="roles" className="mx-auto max-w-7xl px-4 pb-16">
  <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
    <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold">
      Role-based access aligned to your workspace
    </motion.h2>
    <motion.p variants={fadeUp} className="mt-2 text-gray-600 max-w-2xl">
      Each role gets a focused navigation and tools: Admin, Senior Manager, HR Recruiter, and Employee.
    </motion.p>

    <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        {
          role: "Management Admin",
          bullets: ["Dashboard", "Users", "Reports", "Assign Manager"],
        },
        {
          role: "Senior Manager",
          bullets: ["Dashboard", "Leave Approval", "Task Allocation", "Attendance Monitoring"],
        },
        {
          role: "HR Recruiter",
          bullets: ["Pipelines", "Candidates", "Jobs", "Settings"],
        },
        {
          role: "Employee",
          bullets: ["Profile", "Leave Request", "Task Allocated", "Attendance"],
        },
      ].map(({ role, bullets }) => (
        <motion.div
          key={role}
          whileHover={{ y: -4 }}
          className={`p-5 rounded-2xl ${glass}`}
        >
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{role}</h4>
            
          </div>
          <ul className="mt-3 space-y-1 text-sm text-gray-600">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {b}
              </li>
            ))}
          </ul>
          
        </motion.div>
      ))}
    </div>

    <div className="mt-8 flex flex-wrap items-center gap-3">
      <button
        onClick={() => {
          setPrefillRole(""); // let user choose in modal if not coming from a role card
          setOpenLogin(true);
        }}
        className="px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition inline-flex items-center gap-2"
      >
        Log in to your role <ArrowRight className="h-4 w-4" />
      </button>
     
    </div>
  </motion.div>
</section>


      
      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-20">
        <h3 className="text-2xl font-bold">FAQs</h3>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
<FAQ q="How does AI Resume Screening avoid bias?" a="We use skill- and experience-focused features, configurable thresholds, and optional anonymization; plus audit logs of ranking rationale."/>
<FAQ q="What data powers Performance Prediction?" a="Signals like OKRs, attendance patterns, peer/manager feedback sentiment, and tenure. Models are explainable and show drivers behind a score."/>
<FAQ q="Can we customize Skill Gaps role matrices?" a="Yes. Upload role matrices or project requirements; the Skill Gaps Analyzer compares employee skills and produces a personalized learning plan."/>
<FAQ q="How does the Offer Acceptance Optimizer work?" a="It estimates acceptance probability using compensation competitiveness, benefits, company brand signals, and turnaround speed, then suggests levers."/>
<FAQ q="How is Satisfaction Prediction calculated?" a="Micro-surveys (Likert) + comment sentiment create team heatmaps and early-warning alerts for burnout/disengagement, with recommended actions."/>
<FAQ q="How is data secured & who sees what?" a="RBAC by role (Admin, Senior Manager, HR, Employee), encryption in transit/at rest, org-level tenant isolation, and detailed audit trails."/>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Bot className="h-4 w-4 text-indigo-600" />
            <span>HRLoop360 © {new Date().getFullYear()}</span>
          </div>
      <div className="text-sm text-gray-600">An AI‑Driven HR–Employee Journey</div>
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
// Journey Cycle Graphic
// ----------------------
function JourneyCycle() {
  const nodes = [
    {
      label: "Recruitment\nResume Screener",
      icon: <Fingerprint className="h-4 w-4" />, // 1
      pos: "top-2 left-1/2 -translate-x-1/2",
      color: "bg-indigo-600",
    },
    {
      label: "Skill Alignment\nGaps Analyzer",
      icon: <Gauge className="h-4 w-4" />, // 2
      pos: "left-2 top-1/2 -translate-y-1/2",
      color: "bg-sky-600",
    },
    {
      label: "Offer Optimizer\nAcceptance",
      icon: <BadgeCheck className="h-4 w-4" />, // 3
      pos: "bottom-2 left-1/4 -translate-x-1/2",
      color: "bg-emerald-600",
    },
    {
      label: "Performance\nPrediction",
      icon: <BrainCircuit className="h-4 w-4" />, // 4
      pos: "bottom-2 right-1/4 translate-x-1/2",
      color: "bg-violet-600",
    },
    {
      label: "Satisfaction\nPrediction",
      icon: <LayoutDashboard className="h-4 w-4" />, // 5
      pos: "right-2 top-1/2 -translate-y-1/2",
      color: "bg-fuchsia-600",
    },
  ];

  return (
    <div className="relative w-full h-[22rem] md:h-[24rem]">
      {/* Outer ring */}
      <div className="absolute inset-6 rounded-full" style={{
        background: "conic-gradient(from 0deg, rgba(99,102,241,.18), rgba(14,165,233,.18), rgba(16,185,129,.18), rgba(139,92,246,.18), rgba(217,70,239,.18), rgba(99,102,241,.18))",
        boxShadow: "inset 0 0 40px rgba(0,0,0,.04)",
      }} />

      {/* Animated arrow circle */}
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 m-auto h-[80%] w-[80%]"
        initial={{ rotate: -90 }}
        animate={{ rotate: 270 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(79,70,229,0.6)" />
          </marker>
        </defs>
        <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(79,70,229,.35)" strokeWidth="2" markerEnd="url(#arrow)" />
      </motion.svg>

      {/* Center text */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider text-gray-500">Continuous</div>
          <div className="text-lg font-bold">AI HR Loop</div>
          <div className="text-xs text-gray-500">Insights → Actions → Outcomes</div>
        </div>
      </div>

      {/* Nodes around the ring */}
      {nodes.map((n, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className={`absolute ${n.pos}`}
        >
          <div className={`px-3 py-2 rounded-xl text-white shadow-lg border border-white/20 ${n.color} whitespace-pre leading-tight text-xs flex items-center gap-2`}
          >
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-white/20">{n.icon}</span>
            {n.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ----------------------
// Journey Step Card
// ----------------------
function JourneyStep({ index, title, icon: Icon, points = [], outcome }) {
  return (
    <motion.div whileHover={{ y: -2 }} className={`p-5 rounded-2xl ${glass}`}>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 grid place-items-center rounded-xl bg-indigo-600 text-white flex-shrink-0">
          <span className="font-bold">{index}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-indigo-600" />
            <h4 className="font-semibold">{title}</h4>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          {outcome && (
            <div className="mt-3 text-sm rounded-lg bg-emerald-50 text-emerald-700 px-3 py-2 border border-emerald-200 inline-flex items-center gap-2">
              <BadgeCheck className="h-4 w-4" />
              <span className="font-medium">Outcome:</span>
              <span>{outcome}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
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

function UniqueCard({ icon: Icon, title, desc }) {
  return (
    <motion.div whileHover={{ y: -4 }} className={`p-5 rounded-2xl ${glass}`}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 grid place-items-center rounded-xl bg-indigo-600 text-white">
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