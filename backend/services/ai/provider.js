/**
 * Provider adapter for Gemini (CommonJS, Node 18+ with global fetch).
 * Uses lazy env reads so values are always fresh even if modules load early.
 *
 * Set AI_DEBUG=true in backend/.env to see debug logs.
 */

require("dotenv").config(); // safe even if already called elsewhere

// Text generation endpoints live under v1; embeddings are documented under v1beta.
const BASE_URL_GEN = "https://generativelanguage.googleapis.com/v1";
const BASE_URL_EMB = "https://generativelanguage.googleapis.com/v1beta";

// ---- env + logging helpers -------------------------------------------------
function env() {
  return {
    AI_DEBUG: String(process.env.AI_DEBUG || "false").toLowerCase() === "true",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
    GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    GEMINI_EMBED_MODEL: process.env.GEMINI_EMBED_MODEL || "text-embedding-004",
    // Keep original variable for compatibility, but use a consistent internal name.
    ENABLE_LLM_EXPLANATION: String(process.env.ENABLE_LLM_EXPLANATION || "false").toLowerCase() === "true",
  };
}

function dlog(...args) {
  if (env().AI_DEBUG) console.log("[AI][Provider]", ...args);
}

// Prove module loaded (does NOT print key)
console.log("[AI][Provider] module loaded", {
  AI_DEBUG_env: process.env.AI_DEBUG,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  GEMINI_EMBED_MODEL: process.env.GEMINI_EMBED_MODEL,
  hasKey: !!process.env.GEMINI_API_KEY,
});

// ---- helpers ----------------------------------------------------------------

async function safeText(res) {
  try { return await res.text(); } catch { return ""; }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Small, bounded exponential backoff helper.
// Returns an async iterator over delays: 250ms, 500ms, 1s, 2s, 4s, 8s (max 6 attempts)
function* backoffDelays(maxTries = 6, baseMs = 250, capMs = 8000) {
  for (let i = 0; i < maxTries; i++) {
    yield Math.min(baseMs * 2 ** i, capMs);
  }
}

// ---- core LLM helpers ------------------------------------------------------

async function geminiGenerateContent(prompt) {
  const { GEMINI_API_KEY, GEMINI_MODEL } = env();
  if (!GEMINI_API_KEY) {
    dlog("generateContent: missing GEMINI_API_KEY → null");
    return null;
  }

  // Try configured model first, then a stable fallback.
  const modelsToTry = [GEMINI_MODEL, "gemini-1.5-flash"];

  for (const model of modelsToTry) {
    const url = `${BASE_URL_GEN}/models/${encodeURIComponent(model)}:generateContent?key=${GEMINI_API_KEY}`;
    dlog("generateContent: model =", model);

    let attempt = 0;
    for (const delay of backoffDelays(6)) {
      attempt++;
      let resp;
      try {
        resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }]}],
            generationConfig: { temperature: 0.2 }
          })
        });
      } catch (e) {
        dlog("generateContent: network error:", e?.message, "(attempt", attempt, ")");
        await sleep(delay);
        continue;
      }

      if (!resp.ok) {
        const body = await safeText(resp);
        dlog("generateContent: HTTP", resp.status, body?.slice?.(0, 300), "(attempt", attempt, ")");
        // Retry on 429/503, otherwise break to model fallback
        if (resp.status === 429 || resp.status === 503) {
          await sleep(delay);
          continue;
        }
        break;
      }

      const textBody = await safeText(resp);
      let json = null;
      try { json = JSON.parse(textBody); } catch { /* ignore */ }

      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      dlog("generateContent: ok; text length =", text?.length ?? 0);
      if (text) return text.trim();

      // If successful response but no text, retry a few times.
      await sleep(delay);
    }
    // next model fallback
  }

  return null;
}

async function extractSkills(text) {
  const { GEMINI_API_KEY } = env();
  if (!GEMINI_API_KEY) { dlog("extractSkills: no key → fallbackExtract()"); return fallbackExtract(text); }

  const prompt = `
Return ONLY JSON with no prose, no markdown fences.

Schema:
{"skills":[{"name":"<normalized skill>"}]}

Rules:
- Use lowercase names.
- Normalize synonyms (js→javascript, mongo→mongodb, node→node.js, mui→material ui, sklearn→scikit-learn).
- Max 40 items.
- If uncertain, omit.

TEXT:
${text}
  `.trim();

  const raw = await geminiGenerateContent(prompt);
  if (!raw) { dlog("extractSkills: LLM returned null/empty → fallbackExtract()"); return fallbackExtract(text); }

  // Tolerant JSON extraction: grab the first {...} block if extra text sneaks in.
  const jsonStr = (() => {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;
    const m = raw.match(/\{[\s\S]*\}/);
    return m ? m[0] : null;
  })();

  if (!jsonStr) {
    dlog("extractSkills: no JSON object found → fallbackExtract()");
    return fallbackExtract(text);
  }

  try {
    const parsed = JSON.parse(jsonStr);
    const arr = (parsed?.skills || [])
      .map(s => normalizeSkill(s?.name))
      .filter(Boolean)
      .map(x => x.toLowerCase());
    const uniq = Array.from(new Set(arr));
    dlog("extractSkills: found =", uniq.length, "samples:", uniq.slice(0, 8));
    return uniq.length ? uniq : fallbackExtract(text);
  } catch (e) {
    dlog("extractSkills: JSON parse error → fallbackExtract()");
    return fallbackExtract(text);
  }
}

// Replace your existing embedStrings with this robust version.
async function embedStrings(strings) {
  const { GEMINI_API_KEY, GEMINI_EMBED_MODEL } = env();
  if (!GEMINI_API_KEY) { dlog("embedStrings: missing key → []"); return []; }
  if (!Array.isArray(strings) || strings.length === 0) { dlog("embedStrings: empty input → []"); return []; }

  const MODEL_ID = GEMINI_EMBED_MODEL || "text-embedding-004";
  const MODEL_PATH = `models/${MODEL_ID}`;
  const batchUrl = `${BASE_URL_EMB}/${MODEL_PATH}:batchEmbedContents?key=${GEMINI_API_KEY}`;
  const singleUrl = `${BASE_URL_EMB}/${MODEL_PATH}:embedContent?key=${GEMINI_API_KEY}`;

  const body = {
    // NOTE: use 'requests' for batch embedding, with fully-qualified 'model' per request.
    requests: strings.map((s) => ({
      model: MODEL_PATH,
      content: { parts: [{ text: s }] }
    }))
  };

  console.log("[AI][Provider] embedStrings →", { model: MODEL_PATH, count: strings.length, hasKey: !!process.env.GEMINI_API_KEY });

  // Try batch first with retries/backoff
  let batchOk = false;
  let vectors = [];

  let attempt = 0;
  for (const delay of backoffDelays(6)) {
    attempt++;
    let resp;
    try {
      resp = await fetch(batchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    } catch (e) {
      dlog("embedStrings(batch): network error:", e?.message, "(attempt", attempt, ")");
      await sleep(delay);
      continue;
    }

    const t = await safeText(resp);
    console.log("[AI][Provider] embedStrings HTTP =", resp.status, "(attempt", attempt, ")");
    if (!resp.ok) {
      dlog("embedStrings: HTTP", resp.status, t?.slice?.(0, 300));
      if (resp.status === 429 || resp.status === 503 || resp.status === 500) {
        await sleep(delay);
        continue;
      }
      break; // non-retryable
    }

    let j = null;
    try { j = JSON.parse(t); } catch { /* ignore */ }

    // Correct shape: { embeddings: [ { values: number[] }, ... ] }
    vectors = (j?.embeddings || []).map(e => e?.values || []);
    dlog("embedStrings: embeddings =", vectors.length, "firstVecLen =", vectors[0]?.length ?? 0);

    // Success criteria: we got as many vectors as inputs and non-empty vectors
    if (vectors.length === strings.length && vectors[0]?.length) {
      batchOk = true;
      break;
    }

    // Retry on empty or mismatched lengths (rare transient)
    await sleep(delay);
  }

  if (!batchOk) {
    dlog("embedStrings: batch failed or incomplete → fallback to single-call per string");
    vectors = [];
    let idx = 0;
    for (const s of strings) {
      idx++;
      let done = false;
      for (const delay of backoffDelays(5)) {
        try {
          const r = await fetch(singleUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: MODEL_PATH, content: { parts: [{ text: s }] } }),
          });
          const t = await safeText(r);
          if (!r.ok) {
            dlog(`embedStrings(single #${idx}): HTTP`, r.status, t?.slice?.(0, 200));
            if (r.status === 429 || r.status === 503 || r.status === 500) {
              await sleep(delay);
              continue;
            }
            vectors.push([]); // non-retryable
            done = true;
            break;
          }
          let j = null;
          try { j = JSON.parse(t); } catch {}
          const vec = j?.embedding?.values || [];
          vectors.push(Array.isArray(vec) ? vec : []);
          done = true;
          break;
        } catch (e) {
          dlog(`embedStrings(single #${idx}): net err`, e?.message);
          await sleep(delay);
        }
      }
      if (!done) vectors.push([]);
    }
  }

  return vectors;
}

async function sentimentScore(text) {
  const { GEMINI_API_KEY } = env();
  if (!GEMINI_API_KEY || !text || !text.trim()) {
    dlog("sentimentScore: missing key or empty text → null");
    return null;
  }
  const prompt = `
Return ONLY JSON: {"score": number in [-1,1]}
Comment:
${text}
  `.trim();

  const raw = await geminiGenerateContent(prompt);
  if (!raw) {
    dlog("sentimentScore: LLM returned null/empty → null");
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    const s = Number(parsed?.score);
    const ok = Number.isFinite(s) && s >= -1 && s <= 1;
    dlog("sentimentScore: parsed =", ok ? s : "invalid");
    return ok ? s : null;
  } catch {
    dlog("sentimentScore: JSON parse error");
    return null;
  }
}

async function generateExplanation(promptText) {
  const { ENABLE_LLM_EXPLANATION } = env();
  if (!ENABLE_LLM_EXPLANATION) return null;
  return geminiGenerateContent(promptText);
}

// ---- lightweight ontology + normalizer -------------------------------------

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
    "js":"javascript","node":"node.js","mongo":"mongodb","reactjs":"react","nextjs":"next.js",
    "tf":"tensorflow","mui":"material ui","sklearn":"scikit-learn","np":"numpy","ci cd":"ci/cd"
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
  const out = Array.from(found);
  dlog("fallbackExtract: matched =", out.length, "samples:", out.slice(0, 8));
  return out;
}

module.exports = {
  generateExplanation,
  extractSkills,
  embedStrings,
  sentimentScore,
};
