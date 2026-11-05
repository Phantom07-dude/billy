const BASE = process.env.PAYPAL_BASE || "https://api-m.sandbox.paypal.com";
async function token() {
  const id = process.env.PAYPAL_CLIENT_ID, secret = process.env.PAYPAL_SECRET;
  if (!id || !secret) throw new Error("PayPal keys are missing in the Vercel environment variables.");
  const r = await fetch(BASE + "/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(id + ":" + secret).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error_description || "PayPal login failed. Check your Client ID and Secret.");
  return d.access_token;
}
async function pp(path, opts = {}) {
  const t = await token();
  const r = await fetch(BASE + path, { ...opts, headers: { Authorization: "Bearer " + t, "Content-Type": "application/json" } });
  const txt = await r.text();
  let d = {};
  try { d = txt ? JSON.parse(txt) : {}; } catch { d = {}; }
  if (!r.ok) {
    const extra = d.details && d.details[0] ? " (" + (d.details[0].description || d.details[0].issue) + ")" : "";
    throw new Error((d.message || "PayPal error " + r.status) + extra);
  }
  return d;
}
module.exports = { pp };
