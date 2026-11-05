const { pp } = require("./_paypal");
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const b = req.body || {};
    const amount = Number(b.amount);
    if (!b.client_name || !(amount > 0)) return res.status(400).json({ error: "Add a client name and an amount." });
    if (!/^\S+@\S+\.\S+$/.test(b.client_email || "")) return res.status(400).json({ error: "Add the client's email so PayPal can send the invoice." });
    const cur = b.currency || "USD";
    const parts = String(b.client_name).trim().split(/\s+/);
    const name = { given_name: parts[0] };
    if (parts.length > 1) name.surname = parts.slice(1).join(" ");
    const created = await pp("/v2/invoicing/invoices", {
      method: "POST",
      body: JSON.stringify({
        detail: { currency_code: cur, note: "Created with Billy", payment_term: { term_type: "DUE_ON_DATE_SPECIFIED", due_date: b.due_date } },
        primary_recipients: [{ billing_info: { name, email_address: b.client_email } }],
        items: [{ name: String(b.description || "Services").slice(0, 200), quantity: "1", unit_amount: { currency_code: cur, value: amount.toFixed(2) } }],
      }),
    });
    const id = String(created.href).split("/").pop();
    await pp(`/v2/invoicing/invoices/${id}/send`, { method: "POST", body: JSON.stringify({ send_to_recipient: true, send_to_invoicer: false }) });
    const inv = await pp(`/v2/invoicing/invoices/${id}`);
    res.json({ id, link: (inv.detail && inv.detail.metadata && inv.detail.metadata.recipient_view_url) || "" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
