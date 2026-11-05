const { gemini } = require("./_gemini");
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const text = String((req.body && req.body.text) || "").slice(0, 500);
    if (!text.trim()) return res.status(400).json({ error: "Type who you want to bill and for what." });
    const today = new Date().toISOString().slice(0, 10);
    const out = await gemini(
      `Today is ${today}. Extract one invoice from the message. Return ONLY JSON with keys: client_name (string), client_email (string, "" if not given), description (string), amount (number, no symbols), currency (3-letter code, default "USD"), due_date (YYYY-MM-DD; if unclear, 7 days after today). Message: """${text}"""`,
      true
    );
    const j = JSON.parse(out.replace(/```json|```/g, "").trim());
    const amount = Number(j.amount);
    if (!j.client_name || !(amount > 0)) return res.status(422).json({ error: "I couldn't find a client name and amount. Try: Invoice Ada $50 for logo design, due in 7 days." });
    const cur = ["USD", "EUR", "GBP", "CAD", "AUD"].includes(String(j.currency).toUpperCase()) ? String(j.currency).toUpperCase() : "USD";
    res.json({ client_name: String(j.client_name), client_email: String(j.client_email || ""), description: String(j.description || "Services"), amount, currency: cur, due_date: /^\d{4}-\d{2}-\d{2}$/.test(j.due_date) ? j.due_date : today });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
