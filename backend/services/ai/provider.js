

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const GEMINI_EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || "text-embedding-004";
const ENABLE_LLM = (process.env.ENABLE_LLM_EXPLANATION || "false").toLowerCase() === "true";

const BASE_URL = "https://generativelanguage.googleapis.com/v1";

async function geminiGenerateContent(prompt) {
  if (!GEMINI_API_KEY) return null;
  const url = `${BASE_URL}/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${GEMINI_API_KEY}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }]}],
      generationConfig: { temperature: 0.2 }
    })
  });
  if (!resp.ok) return null;
  const json = await resp.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  return text?.trim() || null;
}

async function extractSkills(text) {
  if (!GEMINI_API_KEY) return fallbackExtract(text);
  const prompt = `
Extract skills as a JSON array from the text below.
Return ONLY JSON like: {"skills":[{"name":"react"},{"name":"javascript"}]}
Normalize common synonyms (js->javascript, mongo->mongodb). Max 40 items.
Text:
${text}
  `.trim();
  const raw = await geminiGenerateContent(prompt);
  try {
    const parsed = JSON.parse(raw);
    const arr = (parsed?.skills || []).map(s => normalizeSkill(s.name)).filter(Boolean);
    const uniq = Array.from(new Set(arr.map(x => x.toLowerCase())));
    return uniq;
  } catch {
    return fallbackExtract(text);
  }
}

async function embedStrings(strings) {
  if (!GEMINI_API_KEY || !Array.isArray(strings) || strings.length === 0) return [];
  const url = `${BASE_URL}/models/${encodeURIComponent(GEMINI_EMBED_MODEL)}:batchEmbedContents?key=${GEMINI_API_KEY}`;
  const inputs = strings.map(s => ({ content: { parts: [{ text: s }]} }));
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requests: inputs })
  });
  if (!resp.ok) return [];
  const json = await resp.json();
  const vectors = (json?.responses || []).map(r => r?.embedding?.values || []);
  return vectors;
}

async function sentimentScore(text) {
  if (!GEMINI_API_KEY || !text || !text.trim()) return null;
  const prompt = `
Return ONLY JSON: {"score": number in [-1,1]}
Comment:
${text}
  `.trim();
  const raw = await geminiGenerateContent(prompt);
  try {
    const parsed = JSON.parse(raw);
    const s = Number(parsed.score);
    if (Number.isFinite(s) && s >= -1 && s <= 1) return s;
  } catch {}
  return null;
}

async function generateExplanation(promptText) {
  if (!ENABLE_LLM || !GEMINI_API_KEY) return null;
  return geminiGenerateContent(promptText);
}

/* ----------------- helpers ----------------- */

const ONTOLOGY = [
  "communication","leadership","collaboration","problem solving","time management",
  "javascript","typescript","react","next.js","node.js","express","mongodb","postgresql",
  "python","java","docker","kubernetes","aws","gcp","azure","graphql","rest",
  "jest","cypress","git","ci/cd","tailwindcss","material ui",
  "pandas","numpy","scikit-learn","tensorflow","pytorch","hugging face","ml ops",
  "recruiting","sourcing","interviewing","hr analytics","payroll","attendance systems",
  "performance management","okrs","employee engagement","compensation analysis"
];

function normalizeSkill(s) {
  if (!s) return null;
  const x = String(s).trim().toLowerCase();
  const map = {
    "js": "javascript",
    "node": "node.js",
    "mongo": "mongodb",
    "reactjs": "react",
    "nextjs": "next.js",
    "tf": "tensorflow",
    "mui": "material ui",
    "sklearn": "scikit-learn",
    "np": "numpy",
    "ci cd": "ci/cd"
  };
  return map[x] || x;
}

function fallbackExtract(text = "") {
  const words = text.toLowerCase().match(/\b[a-z0-9.+#\-\/ ]{2,}\b/g) || [];
  const onto = new Set(ONTOLOGY);
  const found = new Set();
  for (const w of words) {
    const n = normalizeSkill(w);
    if (onto.has(n)) found.add(n);
  }
  return Array.from(found);
}

module.exports = {
  generateExplanation,
  extractSkills,
  embedStrings,
  sentimentScore,
};
