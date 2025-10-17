import React, { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import { apiPostForm } from "../../lib/api.js";
import {
  UploadCloud,
  FileText,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Mail,
  User2,
  Star,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const glass =
  "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]";

const SAMPLE_JD = `We are hiring a Senior Frontend Engineer with 4-7 years of experience.
Must have React, Next.js, TypeScript, performance optimization, testing with Jest/Cypress, CI/CD, accessibility, and design systems (MUI/Tailwind). Bonus: AWS, Docker, Kubernetes.`;

export default function AIResumeScreener() {
  const [jdText, setJdText] = useState(SAMPLE_JD);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(
    () => !!jdText.trim() && files.length > 0 && !loading,
    [jdText, files, loading]
  );

  const onFileChange = (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setFiles((prev) => dedupeFiles([...prev, ...list]));
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const list = Array.from(e.dataTransfer?.files || []);
    if (!list.length) return;
    setFiles((prev) => dedupeFiles([...prev, ...list]));
  }, []);

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  async function submit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setErr("");
    setRes(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("jdText", jdText);
      fd.append("title", "AI Resume Screen");
      files.forEach((f) => fd.append("resumes", f, f.name));
      const out = await apiPostForm("/api/ai/resume/screen", fd);
      const data = out?.data?.data ?? out?.data ?? out;
      setRes(data || null);
    } catch (e) {
      setErr(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

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
              AI Resume Screener
            </motion.h1>
            <p className="text-gray-600">
              Upload a job description and multiple resumes (PDF/DOCX). The system screens automatically.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4 text-indigo-600" /> AI powered
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: JD + Upload */}
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`lg:col-span-3 p-6 rounded-3xl ${glass}`}
          >
            {/* JD */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Description</label>
              <textarea
                rows={10}
                className="w-full rounded-2xl border px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the JD here…"
              />
            </div>

            {/* Uploader */}
            <div
              className={`mt-4 rounded-2xl border border-dashed p-6 transition ${
                dragOver ? "bg-indigo-50 border-indigo-300" : "bg-white/70"
              }`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white grid place-items-center shrink-0">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Resumes (PDF/DOCX)</div>
                  <p className="text-sm text-gray-600">
                    Drag & drop files here, or click to browse. You can add multiple files.
                  </p>
                  <label className="mt-3 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:border-indigo-400 cursor-pointer">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={onFileChange}
                    />
                    <FileText className="h-4 w-4" />
                    Choose files
                  </label>

                  {/* Selected file chips */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <AnimatePresence>
                      {files.map((f, i) => (
                        <motion.span
                          key={f.name + i}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm bg-white"
                          title={f.name}
                        >
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="max-w-[14rem] truncate">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="text-gray-500 hover:text-red-600"
                            aria-label="Remove file"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-xl border px-4 py-2 hover:border-indigo-400"
                onClick={() => {
                  setJdText(SAMPLE_JD);
                  setFiles([]);
                }}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className={`rounded-xl px-4 py-2 inline-flex items-center gap-2 text-white ${
                  canSubmit ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Screening...
                  </>
                ) : (
                  <>Screen Now</>
                )}
              </button>
            </div>

            {err && (
              <div className="mt-4 text-sm rounded-xl px-3 py-2 border bg-red-50 text-red-700 border-red-200 inline-flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {err}
              </div>
            )}
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
                <Star className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Screening Results</h2>
                <p className="text-sm text-gray-600">Job parsing & candidate ranking</p>
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
                  Upload your JD and resumes, then click <b>Screen Now</b>.
                </motion.div>
              )}

              {res && (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Job card */}
                  <div className="p-4 rounded-2xl bg-white/70 border border-white/60">
                    <div className="text-sm text-gray-600 mb-1">Job</div>
                    <div className="text-sm text-gray-800">
                      <div>Title: {res.job?.title || "-"}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(res.job?.skills || []).map((s, i) => (
                          <Tag key={i}>{s}</Tag>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Candidates table */}
                  {Array.isArray(res.candidates) && res.candidates.length > 0 && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/70 border border-white/60">
                      <div className="font-semibold mb-2">Candidates</div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left border-b">
                              <th className="py-2 pr-4">File</th>
                              <th className="py-2 pr-4">Name</th>
                              <th className="py-2 pr-4">Email</th>
                              <th className="py-2 pr-4">Years</th>
                              <th className="py-2 pr-4">Fit</th>
                              <th className="py-2 pr-4">Decision</th>
                              <th className="py-2 pr-4">Strengths</th>
                              <th className="py-2 pr-4">Gaps</th>
                            </tr>
                          </thead>
                          <tbody>
                            {res.candidates.map((c, i) => (
                              <tr key={i} className="border-b last:border-0 align-top">
                                <td className="py-2 pr-4">{c.originalFilename}</td>

                                {c.status === "error" ? (
                                  <td className="py-2 pr-4 text-red-700" colSpan={7}>
                                    Unable to parse this file ({c.error || "unknown_error"}). Try a text-based PDF or DOCX.
                                  </td>
                                ) : (
                                  <>
                                    <td className="py-2 pr-4">
                                      <InlineIconText icon={<User2 className="h-4 w-4" />} text={c.extracted?.name || "-"} />
                                    </td>
                                    <td className="py-2 pr-4">
                                      <InlineIconText icon={<Mail className="h-4 w-4" />} text={c.extracted?.email || "-"} />
                                    </td>
                                    <td className="py-2 pr-4">{c.extracted?.yearsExperience ?? "-"}</td>
                                    <td className="py-2 pr-4">
                                      <ScorePill value={normalizePercent(c.scores?.final)} />
                                      <Progress className="mt-1 w-32" value={normalizePercent(c.scores?.final)} />
                                    </td>
                                    <td className="py-2 pr-4 capitalize">
                                      <DecisionBadge decision={c.evaluation?.decision} />
                                    </td>
                                    <td className="py-2 pr-4">
                                      <ul className="list-disc ml-4 space-y-0.5">
                                        {(c.evaluation?.strengths || []).map((s, j) => (
                                          <li key={j}>{s}</li>
                                        ))}
                                      </ul>
                                    </td>
                                    <td className="py-2 pr-4">
                                      <ul className="list-disc ml-4 space-y-0.5">
                                        {(c.evaluation?.gaps || []).map((g, j) => (
                                          <li key={j}>{g}</li>
                                        ))}
                                      </ul>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Per-candidate summaries */}
                      {res.candidates.map((c, i) =>
                        c.evaluation?.summary ? (
                          <details key={i} className="mt-3">
                            <summary className="cursor-pointer text-sm text-gray-700">
                              Summary: {c.originalFilename}
                            </summary>
                            <div className="mt-2 text-gray-800 whitespace-pre-wrap">{c.evaluation.summary}</div>
                          </details>
                        ) : null
                      )}
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

/* --------------- Helpers & UI --------------- */

function dedupeFiles(arr) {
  // Deduplicate by name+size
  const seen = new Set();
  const out = [];
  for (const f of arr) {
    const key = `${f.name}-${f.size}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(f);
    }
  }
  return out;
}

function normalizePercent(raw) {
  // Accept: 0..1, 0..100, "61", "61%", "0.61", "61/100"
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

function ScorePill({ value = 0 }) {
  const tone =
    value >= 85 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    value >= 70 ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-red-50 text-red-700 border-red-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs border ${tone}`}>
      Fit {value}%
    </span>
  );
}

function DecisionBadge({ decision }) {
  const d = (decision || "").toLowerCase();
  const map = {
    hire: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="h-4 w-4" /> },
    consider: { cls: "bg-amber-50 text-amber-700 border-amber-200", icon: <Star className="h-4 w-4" /> },
    reject: { cls: "bg-red-50 text-red-700 border-red-200", icon: <XCircle className="h-4 w-4" /> },
  };
  const pick = map[d] || { cls: "bg-gray-100 text-gray-800 border-gray-200", icon: <Star className="h-4 w-4" /> };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs border ${pick.cls}`}>
      {pick.icon} {decision || "-"}
    </span>
  );
}

function Progress({ value = 0, className = "" }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={`h-2 rounded-full bg-gray-200 ${className}`}>
      <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${clamped}%` }} />
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-flex items-center rounded-full px-3 py-1 text-sm border bg-gray-100 text-gray-800 border-gray-200">
      {children}
    </span>
  );
}

function InlineIconText({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-gray-500">{icon}</span>
      <span>{text}</span>
    </span>
  );
}
