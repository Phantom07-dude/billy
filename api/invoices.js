const { pp } = require("./_paypal");
module.exports = async (req, res) => {
  try {
    const d = await pp("/v2/invoicing/invoices?page=1&page_size=20&total_required=true");
    const today = new Date().toISOString().slice(0, 10);
    const items = (d.items || []).map((i) => {
      const due = (i.detail && i.detail.payment_term && i.detail.payment_term.due_date) || "";
      const bi = (i.primary_recipients && i.primary_recipients[0] && i.primary_recipients[0].billing_info) || {};
      const n = bi.name || {};
      let status = i.status;
      if (["SENT", "UNPAID", "PARTIALLY_PAID", "PAYMENT_PENDING"].includes(status) && due && due < today) status = "OVERDUE";
      if (status === "MARKED_AS_PAID") status = "PAID";
      return {
        id: i.id, status, due,
        client: ((n.given_name || "") + " " + (n.surname || "")).trim() || bi.email_address || "Client",
        amount: i.amount && i.amount.value, currency: i.amount && i.amount.currency_code,
        link: (i.detail && i.detail.metadata && i.detail.metadata.recipient_view_url) || "",
      };
    });
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
