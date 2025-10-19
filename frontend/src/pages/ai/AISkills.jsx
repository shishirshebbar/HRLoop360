import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import { apiPost } from "../../lib/api";
import {
  Sparkles,
  ListChecks,
  BookOpen,
  Code2,
  Target,
  RefreshCw,
  AlertCircle,
  SlidersHorizontal,
  PlusCircle,
} from "lucide-react";

const SAMPLE = {
  profileText:
    "Frontend engineer with 3 years using React, Next.js, JavaScript, TypeScript, Node.js, Express, MongoDB, TailwindCSS, Jest, and CI/CD. Comfortable with REST, GraphQL basics, Docker, and AWS. Experience mentoring juniors and running standups.",
  jobText:
    "Senior Frontend Engineer skilled in React, Next.js, TypeScript, GraphQL, performance optimization, testing with Jest/Cypress, CI/CD, accessibility, and design systems (MUI/Tailwind). Bonus: AWS, Docker, and Kubernetes.",
  topK: 6,
};

const glass =
  "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

export default function AISkills() {
  const [form, setForm] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setRes(null);
    setLoading(true);
    try {
      const out = await apiPost("/api/ai/skills", form);
      const data = out?.data?.data ?? out?.data ?? out;
      setRes(data || null);
    } catch (e) {
      setErr(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const kInfo = useMemo(() => {
    const k = Number(form.topK) || 0;
    const tone = k >= 12 ? "amber" : k >= 8 ? "emerald" : "sky";
    return { k, tone };
  }, [form.topK]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <motion.h1
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl md:text-3xl font-bold"
            >
              Skill Gaps Analyzer
            </motion.h1>
            <p className="text-gray-600">
              Compare profile vs JD, see strengths, gaps, and a learning plan.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4 text-indigo-600" /> AI powered
          </div>
        </div>

        {/* Grid */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Form */}
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`lg:col-span-3 p-6 rounded-3xl ${glass}`}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white grid place-items-center">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Inputs</h2>
                <p className="text-sm text-gray-600">Paste candidate profile and job description</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                label="Profile Text"
                icon={<Code2 className="h-4 w-4" />}
                rows={12}
                value={form.profileText}
                onChange={(v) => setField("profileText", v)}
              />
              <Textarea
                label="Job Description"
                icon={<BookOpen className="h-4 w-4" />}
                rows={12}
                value={form.jobText}
                onChange={(v) => setField("jobText", v)}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <InputBox
                label="Top K (3..20)"
                min={3}
                max={20}
                value={form.topK}
                onChange={(v) => setField("topK", v)}
              />

              <KChip k={kInfo.k} tone={kInfo.tone} />

              <div className="flex gap-3 md:justify-end">
                <button
                  type="button"
                  className="rounded-xl border px-4 py-2 hover:border-indigo-400"
                  onClick={() => setForm(SAMPLE)}
                >
                  Use Sample Data
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 inline-flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>Analyze</>
                  )}
                </button>
              </div>
            </div>
          </motion.form>

          {/* Right: Results */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className={`lg:col-span-2 p-6 rounded-3xl ${glass}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white grid place-items-center">
                <ListChecks className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Results</h2>
                <p className="text-sm text-gray-600">Extracted skills, strengths, gaps & plan</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!res && !err && !loading && (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-gray-600"
                >
                  Fill the inputs and hit <b>Analyze</b> to see results.
                </motion.div>
              )}

              {err && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm rounded-xl px-3 py-2 border bg-red-50 text-red-700 border-red-200 inline-flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" /> {err}
                </motion.div>
              )}

              {res && (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Extracted */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/70 border border-white/60">
                      <SectionTitle icon={<Code2 className="h-4 w-4" />}>Profile Skills</SectionTitle>
                      <TagList items={res.profileSkills} empty="No skills parsed from profile." />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/70 border border-white/60">
                      <SectionTitle icon={<BookOpen className="h-4 w-4" />}>Job Skills</SectionTitle>
                      <TagList items={res.jobSkills} empty="No skills parsed from JD." />
                    </div>
                  </div>

                  {/* Strengths */}
                  {Array.isArray(res.strengths) && res.strengths.length > 0 && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/70 border border-white/60">
                      <SectionTitle icon={<Target className="h-4 w-4" />}>Strengths</SectionTitle>
                      <ul className="space-y-2 text-sm">
                        {res.strengths.map((s, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <Tag>{s.skill}</Tag>
                            <span className="text-gray-500">
                              matched with <b>{s.matchedWith}</b>
                            </span>
                            <Similarity value={s.similarity} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Gaps */}
                  {Array.isArray(res.gaps) && res.gaps.length > 0 && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/70 border border-white/60">
                      <SectionTitle icon={<PlusCircle className="h-4 w-4" />}>Gaps</SectionTitle>
                      <ul className="space-y-2 text-sm">
                        {res.gaps.map((g, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <Tag tone="amber">{g.skill}</Tag>
                            <Similarity value={g.similarity} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Learning plan */}
                  {res.explanation && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/70 border border-white/60">
                      <SectionTitle icon={<BookOpen className="h-4 w-4" />}>Learning Plan</SectionTitle>
                      <p className="whitespace-pre-wrap text-sm text-gray-700">{res.explanation}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* -----------------
   Presentational UI
   ----------------- */
function Textarea({ label, value, onChange, rows = 8, icon }) {
  return (
    <label className="text-sm">
      {label}
      <div className="relative mt-1">
        {icon && <span className="absolute left-3 top-2.5 text-gray-400">{icon}</span>}
        <textarea
          rows={rows}
          className="w-full px-3 py-2 pl-9 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}


function InputBox({ label, value, onChange, icon }) {
  return (
    <label className="text-sm">
      {label}
      <div className="relative mt-1">
        {icon && <span className="absolute left-3 top-2.5 text-gray-400">{icon}</span>}
        <input
          type="text"
          className="w-full px-3 py-2 pl-9 rounded-xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}


function KChip({ k, tone = "sky" }) {
  const t =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-sky-50 text-sky-700 border-sky-200";
  return (
    <div className={`rounded-xl border ${t} px-3 py-2 text-sm`}>Top K selected: {k}</div>
  );
}

function SectionTitle({ children, icon }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
      {icon}
      <span>{children}</span>
    </div>
  );
}

function TagList({ items = [], empty = "" }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <div className="text-sm text-gray-500">{empty}</div>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((x, i) => (
        <Tag key={i}>{x}</Tag>
      ))}
    </div>
  );
}

function Tag({ children, tone = "gray" }) {
  const t = {
    gray: "bg-gray-100 text-gray-800 border-gray-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm border ${t}`}>
      {children}
    </span>
  );
}

function Progress({ value = 0 }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
      <div
        className="h-2 rounded-full bg-indigo-600"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function Similarity({ value }) {
  const v = normalizePercent(value);
  const tone = v >= 80 ? "bg-emerald-500" : v >= 60 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">sim {v}%</span>
      <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-2 ${tone}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

function normalizePercent(raw) {
  // Accept 0..1, 0..100, "61", "61%", "0.61", "61/100"
  if (raw == null) return 0;
  let v = raw;
  if (typeof v === "string") {
    const m = v.match(/-?\d+(\.\d+)?/);
    if (!m) return 0;
    v = parseFloat(m[0]);
    if (/%/.test(raw) || /\/\s*100/.test(raw)) return Math.round(v);
  }
  if (typeof v !== "number" || isNaN(v)) return 0;
  if (v <= 1 && v >= -1) return Math.round(v * 100);
  return Math.round(v);
}
