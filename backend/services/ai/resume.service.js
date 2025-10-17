let pdfParse;
try {
  // CommonJS require (works if the package exports a function)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  pdfParse = require("pdf-parse");
  // Some environments put the function under .default
  if (pdfParse && typeof pdfParse !== "function" && pdfParse.default) {
    pdfParse = pdfParse.default;
  }
} catch {
  pdfParse = null;
}
const mammoth = require("mammoth");
const { extractSkills, embedStrings, generateExplanation } = require("./provider");

function bufToText(file) {
  const mimetype = (file.mimetype || "").toLowerCase();
  if (mimetype.includes("pdf")) return parsePdf(file.buffer);
  if (mimetype.includes("word") || file.originalname?.toLowerCase().endsWith(".docx")) return parseDocx(file.buffer);
  return Promise.resolve(file.buffer.toString("utf8"));
}
async function parsePdf(buffer) {
  if (!pdfParse || typeof pdfParse !== "function") {
    throw new Error("pdf_parse_unavailable");
  }
  const data = await pdfParse(buffer);
  return (data.text || "").trim();
}

async function parseDocx(buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  return (value || "").trim();
}

function regexEmail(text) {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0] : null;
}
function regexPhone(text) {
  const m = text.match(/(\+?\d[\d\-\s().]{7,}\d)/);
  return m ? m[0] : null;
}
function regexYears(text) {
  const nums = Array.from(text.matchAll(/(\d{1,2})\s*(\+|\b)\s*(years?|yrs?)/gi)).map(m => parseInt(m[1], 10));
  if (nums.length) return Math.max(...nums);
  const single = text.match(/(\d{1,2})\s*(years?|yrs?)/i);
  return single ? parseInt(single[1], 10) : null;
}
function regexEducation(text) {
  const t = text.toLowerCase();
  if (/\bph\.?d|\bdoctorate\b/.test(t)) return "phd";
  if (/\bmaster'?s|msc|m\.tech|mca\b/.test(t)) return "master";
  if (/\bbachelor'?s|bsc|b\.tech|be\b/.test(t)) return "bachelor";
  return "none";
}

async function extractEntitiesLLM(text) {
  const prompt = `
Return ONLY JSON with keys:
{name, email, phone, yearsExperience, educationLevel, skills}
- educationLevel in ["none","bachelor","master","phd"]
- skills is an array of strings, normalized (js->javascript, mongo->mongodb)
Text:
${text}
`.trim();
  const raw = await generateExplanation(prompt);
  try {
    const j = JSON.parse(raw);
    return {
      name: j.name || null,
      email: j.email || null,
      phone: j.phone || null,
      yearsExperience: Number.isFinite(j.yearsExperience) ? j.yearsExperience : null,
      educationLevel: j.educationLevel || "none",
      skills: Array.isArray(j.skills) ? j.skills.map(s => String(s)).filter(Boolean) : []
    };
  } catch {
    return null;
  }
}

function jdExperienceRange(jdText) {
  const r1 = jdText.match(/(\d{1,2})\s*-\s*(\d{1,2})\s*(years?|yrs?)/i);
  if (r1) return { min: parseInt(r1[1], 10), max: parseInt(r1[2], 10) };
  const r2 = jdText.match(/at\s*least\s*(\d{1,2})\s*(years?|yrs?)/i);
  if (r2) return { min: parseInt(r2[1], 10), max: null };
  const r3 = jdText.match(/(\d{1,2})\s*(\+)\s*(years?|yrs?)/i);
  if (r3) return { min: parseInt(r3[1], 10), max: null };
  const r4 = jdText.match(/(\d{1,2})\s*(years?|yrs?)\s*(experience)?/i);
  if (r4) return { min: parseInt(r4[1], 10), max: null };
  return { min: null, max: null };
}

function experienceFitScore(years, range) {
  if (!Number.isFinite(years)) return 0.7;
  if (!range.min && !range.max) return Math.max(0.5, Math.min(1, years / 6));
  if (range.min && range.max) {
    if (years < range.min) return Math.max(0, 1 - (range.min - years) / (range.min || 1));
    if (years > range.max) return Math.max(0.6, 1 - (years - range.max) / (range.max || 1));
    return 1;
  }
  if (range.min && !range.max) return years >= range.min ? 1 : Math.max(0, years / range.min);
  return 0.7;
}

function educationBoost(level) {
  if (level === "phd") return 0.1;
  if (level === "master") return 0.07;
  if (level === "bachelor") return 0.03;
  return 0;
}

function avgBestMatchSim(jdSkills, resumeSkills, jdVecs, resVecs) {
  if (!jdSkills.length || !resumeSkills.length) return 0;
  function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
    return (dot / (Math.sqrt(na) * Math.sqrt(nb))) || 0;
  }
  let sum = 0;
  for (let j = 0; j < jdSkills.length; j++) {
    const jv = jdVecs[j];
    let best = 0;
    for (let r = 0; r < resumeSkills.length; r++) {
      const rv = resVecs[r];
      if (!jv || !rv) continue;
      const sim = cosine(jv, rv);
      if (sim > best) best = sim;
    }
    sum += best;
  }
  return sum / jdSkills.length;
}

async function screenOne(jdText, jdSkills, resumeFile) {
  const text = await bufToText(resumeFile);
  if (!text || text.trim().length < 200) {
  return {
    originalFilename: resumeFile.originalname || "resume",
    status: "error",
    error: "empty_or_unparsable_text_pdf"
  };
}
  const llm = await extractEntitiesLLM(text);
  const email = llm?.email || regexEmail(text);
  const phone = llm?.phone || regexPhone(text);
  const years = llm?.yearsExperience ?? regexYears(text) ?? 0;
  const edu = llm?.educationLevel || regexEducation(text);
  const rSkillsRaw = llm?.skills && llm.skills.length ? llm.skills : await extractSkills(text);
  const resumeSkills = Array.from(new Set(rSkillsRaw));
  const all = [...jdSkills, ...resumeSkills];
  const vectors = await embedStrings(all);
  const jdVecs = vectors.slice(0, jdSkills.length);
  const resVecs = vectors.slice(jdSkills.length);
  
//   const similarity = Number(avgBestMatchSim(jdSkills, resumeSkills, jdVecs, resVecs).toFixed(3));
let similarity;
if (!jdVecs.length || !resVecs.length) {
  const setJ = new Set(jdSkills.map(s => s.toLowerCase()));
  const setR = new Set(resumeSkills.map(s => s.toLowerCase()));
  const inter = [...setJ].filter(x => setR.has(x)).length;
  const uni = new Set([...setJ, ...setR]).size || 1;
  similarity = Number((inter / uni).toFixed(3)); // Jaccard fallback
} else {
  similarity = Number(avgBestMatchSim(jdSkills, resumeSkills, jdVecs, resVecs).toFixed(3));
}

  const range = jdExperienceRange(jdText);
  const expFit = Number(experienceFitScore(years, range).toFixed(3));
  const eduBoost = Number(educationBoost(edu).toFixed(3));
  const final = Math.round(Math.max(0, Math.min(1, 0.65*similarity + 0.25*expFit + 0.10*eduBoost)) * 100);

  const rubricRaw = await generateExplanation(`
Return ONLY JSON: {decision, summary, strengths, gaps, questions}
- decision in ["strong_yes","yes","maybe","no"]
- strengths,gaps: 3 short bullets each
- questions: 3-5 concise questions
JD:
${jdText}

Candidate:
- email: ${email || ""}
- phone: ${phone || ""}
- yearsExperience: ${years || 0}
- educationLevel: ${edu}
- skills: ${JSON.stringify(resumeSkills)}
- resumeText: ${text.slice(0, 4000)}
`.trim());
  let evaluation = null;
  try { evaluation = JSON.parse(rubricRaw || "{}"); } catch { evaluation = null; }

  return {
    originalFilename: resumeFile.originalname || "resume",
    text,
    extracted: {
      name: llm?.name || null,
      email: email || null,
      phone: phone || null,
      yearsExperience: years || 0,
      educationLevel: edu,
      skills: resumeSkills
    },
    scores: {
      similarity,
      experienceFit: expFit,
      educationBoost: eduBoost,
      final
    },
    evaluation: evaluation || {
      decision: final >= 85 ? "strong_yes" : final >= 70 ? "yes" : final >= 55 ? "maybe" : "no",
      summary: null,
      strengths: [],
      gaps: [],
      questions: []
    },
    status: "screened",
    createdAt: new Date().toISOString()
  };
}

async function screenBatch({ jdText, title, files }) {
  const jdSkills = await extractSkills(jdText);
  const results = [];
  for (const f of files) {
    // inside screenBatch loop
try {
  const cand = await screenOne(jdText, jdSkills, f);
  results.push(cand);
} catch (e) {
  results.push({
    originalFilename: f.originalname || "resume",
    status: "error",
    error: e?.message === "pdf_parse_unavailable"
      ? "pdfParse unavailable — reinstall or pin pdf-parse@1.1.1"
      : (e?.message || "parse_error")
  });
}

  }
  results.sort((a, b) => (b.scores?.final || 0) - (a.scores?.final || 0));
  return {
    job: {
      _id: null,
      title: title || "Untitled Job",
      jdText,
      skills: jdSkills,
      createdAt: new Date().toISOString()
    },
    candidates: results
  };
}

module.exports = { screenBatch };
