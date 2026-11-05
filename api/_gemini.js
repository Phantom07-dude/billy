async function gemini(prompt, json) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is missing in the Vercel environment variables.");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: json ? { responseMimeType: "application/json", temperature: 0 } : { temperature: 0.7 },
    }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error((d.error && d.error.message) || "Gemini error");
  const parts = (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || [];
  return parts.map((p) => p.text || "").join("");
}
module.exports = { gemini };
