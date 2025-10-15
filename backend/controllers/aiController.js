

const { scoreAndExplain: perfScore } = require("../services/ai/performance.service");
const { scoreAndExplain: offerScore } = require("../services/ai/offer.service");
const { analyzeSkills } = require("../services/ai/skills.service");
const { scoreSatisfaction } = require("../services/ai/satisfaction.service");

function required(obj, fields) {
  for (const f of fields) {
    if (obj[f] === undefined || obj[f] === null || obj[f] === "") {
      const err = new Error(`Missing field: ${f}`);
      err.status = 400;
      throw err;
    }
  }
}

async function performance(req, res, next) {
  try {
    const body = req.body || {};
    required(body, ["employeeId","okrCompletion","attendanceRate","peerFeedbackCount","peerFeedbackSentiment","lastManagerRating","tenureMonths","roleComplexity"]);
    const data = await perfScore(body);
    res.json({ ok: true, data });
  } catch (e) { next(e); }
}

async function offer(req, res, next) {
  try {
    const body = req.body || {};
    required(body, ["candidateId","offeredBaseSalary","marketMedianSalary","roleLevel","experienceYears","benefitsScore","locationFlexibility","offerSpeedDays","companyReputationScore"]);
    const data = await offerScore(body);
    res.json({ ok: true, data });
  } catch (e) { next(e); }
}

async function skills(req, res, next) {
  try {
    const body = req.body || {};
    required(body, ["profileText","jobText"]);
    if (body.topK === undefined) body.topK = 8;
    const data = await analyzeSkills(body);
    res.json({ ok: true, data });
  } catch (e) { next(e); }
}

async function satisfaction(req, res, next) {
  try {
    const body = req.body || {};
    required(body, ["teamId","surveys"]);
    if (!Array.isArray(body.surveys) || body.surveys.length === 0) {
      const err = new Error("surveys must be a non-empty array");
      err.status = 400; throw err;
    }
    if (!body.windowLabel) body.windowLabel = "last_4_weeks";
    const data = await scoreSatisfaction(body);
    res.json({ ok: true, data });
  } catch (e) { next(e); }
}

module.exports = {
  performance,
  offer,
  skills,
  satisfaction,
};
