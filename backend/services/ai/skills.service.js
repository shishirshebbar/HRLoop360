
const { extractSkills, embedStrings, generateExplanation } = require("./provider");

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i];
  }
  return (dot / (Math.sqrt(na) * Math.sqrt(nb))) || 0;
}

async function analyzeSkills({ profileText, jobText, topK }) {
  const [profileSkills, jobSkills] = await Promise.all([
    extractSkills(profileText),
    extractSkills(jobText)
  ]);

  if (!profileSkills.length || !jobSkills.length) {
    return {
      profileSkills, jobSkills,
      strengths: [],
      gaps: jobSkills.map(s => ({ skill: s, similarity: 0 })),
      explanation: "Insufficient skills detected; provide richer profile/JD text."
    };
  }

  const uniqProfile = Array.from(new Set(profileSkills));
  const uniqJob = Array.from(new Set(jobSkills));
  const all = [...uniqProfile, ...uniqJob];
  const vectors = await embedStrings(all);
  const profVecs = vectors.slice(0, uniqProfile.length);
  const jobVecs = vectors.slice(uniqProfile.length);

  const matches = uniqJob.map((jobSkill, j) => {
    const jv = jobVecs[j];
    let best = 0, bestName = null;
    for (let p = 0; p < uniqProfile.length; p++) {
      const sim = jv && profVecs[p] ? cosine(jv, profVecs[p]) : 0;
      if (sim > best) { best = sim; bestName = uniqProfile[p]; }
    }
    return { jobSkill, bestProfileSkill: bestName, similarity: Number(best.toFixed(3)) };
  });

  const strengths = matches
    .filter(m => m.similarity >= 0.72)
    .sort((a,b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map(m => ({ skill: m.jobSkill, matchedWith: m.bestProfileSkill, similarity: m.similarity }));

  const gaps = matches
    .filter(m => m.similarity < 0.72)
    .sort((a,b) => a.similarity - b.similarity)
    .slice(0, topK)
    .map(m => ({ skill: m.jobSkill, similarity: m.similarity }));

  const explanation = await generateExplanation(`
You are an HR learning advisor. Provide a concise overview (3–4 sentences) of strengths vs gaps,
then list a 4-step learning plan that addresses the biggest gaps first. Avoid vendor endorsements.

Strengths: ${JSON.stringify(strengths)}
Gaps: ${JSON.stringify(gaps)}
Profile skills: ${JSON.stringify(profileSkills)}
Job skills: ${JSON.stringify(jobSkills)}
`.trim());

  return { profileSkills, jobSkills, strengths, gaps, explanation };
}

module.exports = { analyzeSkills };
