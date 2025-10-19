/**
 * Skill Gaps Analyzer (CommonJS) with targeted debug logs.
 * - Extracts skills (Gemini with fallback)
 * - Embeds strings and computes cosine similarity
 * - Returns strengths & gaps + optional LLM learning plan
 */

require("dotenv").config(); // ensure envs available

const { extractSkills, embedStrings, generateExplanation } = require("./provider");

console.log("[AI][Skills] module loaded (service)");

function isDebug() {
  return String(process.env.AI_DEBUG || "false").toLowerCase() === "true";
}
function dlog(...args) {
  if (isDebug()) console.log("[AI][Skills]", ...args);
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return (denom ? (dot / denom) : 0) || 0;
}

/**
 * Analyze candidate vs job skill alignment.
 * @param {Object} params
 * @param {string} params.profileText - Freeform candidate resume/summary text
 * @param {string} params.jobText - Freeform job description text
 * @param {number} [params.topK=8] - Number of strengths and gaps to return
 * @returns {Promise<{profileSkills: string[], jobSkills: string[], strengths: any[], gaps: any[], explanation: string|null}>}
 */
async function analyzeSkills({ profileText, jobText, topK = 8 }) {
  // 1) Extract skills (LLM or fallback)
  const [profileSkills, jobSkills] = await Promise.all([
    extractSkills(profileText || ""),
    extractSkills(jobText || ""),
  ]);
  dlog("extracted:", { profileSkills: profileSkills.length, jobSkills: jobSkills.length });

  if (!profileSkills.length || !jobSkills.length) {
    dlog("early-exit: missing skills → similarities default to 0");
    return {
      profileSkills, jobSkills,
      strengths: [],
      gaps: jobSkills.map((s) => ({ skill: s, similarity: 0 })),
      explanation: "Insufficient skills detected; provide richer profile/JD text.",
    };
  }

  // 2) Embeddings
  const uniqProfile = Array.from(new Set(profileSkills));
  const uniqJob = Array.from(new Set(jobSkills));
  const all = [...uniqProfile, ...uniqJob];

  console.log("[AI][Skills] embedding start", {
    totalStrings: all.length,
    prof: uniqProfile.length,
    job: uniqJob.length,
  });

  const vectors = await embedStrings(all);

  console.log("[AI][Skills] embedding done", {
    vectorsCount: vectors.length,
    firstVecLen: vectors[0]?.length,
  });

  // Defensive: if embeddings came back short or empty, treat as zeros.
  const profCount = uniqProfile.length;
  const profVecs = vectors.slice(0, profCount);
  const jobVecs = vectors.slice(profCount);

  // 3) Match & compute similarities
  const matches = uniqJob.map((jobSkill, j) => {
    const jv = jobVecs[j] || [];
    let best = 0, bestName = null;
    for (let p = 0; p < profCount; p++) {
      const sim = (jv.length && profVecs[p]?.length) ? cosine(jv, profVecs[p]) : 0;
      if (sim > best) { best = sim; bestName = uniqProfile[p]; }
    }
    return { jobSkill, bestProfileSkill: bestName, similarity: Number((best || 0).toFixed(3)) };
  });

  dlog("sample matches:", matches.slice(0, Math.min(5, matches.length)));

  // 4) Strengths vs gaps
  const SIM_THRESHOLD = 0.72;

  const strengths = matches
    .filter((m) => m.similarity >= SIM_THRESHOLD)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map((m) => ({ skill: m.jobSkill, matchedWith: m.bestProfileSkill, similarity: m.similarity }));

  const gaps = matches
    .filter((m) => m.similarity < SIM_THRESHOLD)
    .sort((a, b) => a.similarity - b.similarity)
    .slice(0, topK)
    .map((m) => ({ skill: m.jobSkill, similarity: m.similarity }));

  dlog("strengths/gaps:", { strengths: strengths.length, gaps: gaps.length });

  // 5) Optional LLM learning plan
  const explanation = await generateExplanation(`
You are an HR learning advisor. Provide a concise overview (3–4 sentences) of strengths vs gaps,
then list a 4-step learning plan that addresses the biggest gaps first. Avoid vendor endorsements.

Strengths: ${JSON.stringify(strengths)}
Gaps: ${JSON.stringify(gaps)}
Profile skills: ${JSON.stringify(profileSkills)}
Job skills: ${JSON.stringify(jobSkills)}
`.trim());

  return { profileSkills, jobSkills, strengths, gaps, explanation: explanation || null };
}

module.exports = { analyzeSkills };
