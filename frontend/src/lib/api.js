
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function apiPost(path, body) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const msg = await safeJson(res);
    throw new Error(msg?.error || msg?.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}
