const { gemini } = require("./_gemini");
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const b = req.body || {};
    const tone = b.tone === "firm" ? "firm but professional" : "warm and polite";
    const msg = await gemini(
      `Write a short payment reminder message (max 80 words) to ${b.client}. Invoice amount: ${b.amount} ${b.currency}. Due date: ${b.due}. Status: ${b.status === "OVERDUE" ? "overdue" : "not yet paid"}. Tone: ${tone}. Mention that the PayPal invoice link was sent to their email. Output only the message text, signed "Thank you".`,
      false
    );
    res.json({ message: msg.trim() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
