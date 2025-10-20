// controllers/genieChatController.js (ESM)
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function genieChat(req, res) {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ ok: false, error: "message_required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: "missing_api_key" });
    }

    // Node version check (fetch required)
    const [major] = process.versions.node.split(".").map(Number);
    if (major < 18) {
      return res.status(500).json({ ok: false, error: "node_18_required" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Try your preferred model first; fall back if the SDK/version doesn’t have it
    const MODEL_PREF = "gemini-2.0-flash";
    const MODEL_FALLBACK = "gemini-1.5-flash";

    let model = genAI.getGenerativeModel({ model: MODEL_PREF });
    let text;
    try {
      const r = await model.generateContent(message);
      text = r?.response?.text?.() || "";
    } catch (e) {
      // Fallback once if model not recognized or similar error
      model = genAI.getGenerativeModel({ model: MODEL_FALLBACK });
      const r = await model.generateContent(message);
      text = r?.response?.text?.() || "";
    }

    if (!text) text = "Sorry, no response.";
    return res.json({ ok: true, reply: text });
  } catch (err) {
    // Log full detail server-side; return a clear code client-side
    console.error("[/api/ai/chat] ERROR:", {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
      cause: err?.cause,
    });
    return res.status(500).json({ ok: false, error: "genie_chat_failed" });
  }
}
