import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "../components/Toast";
import PageHeader from "../components/PageHeader";

const STATUS_BADGE = {
  success: { cls: "bg-emerald-400/10 border-emerald-400/25 text-emerald-700", icon: "✅" },
  pending: { cls: "bg-amber-400/10 border-amber-400/25 text-amber-700", icon: "⏳" },
  failed: { cls: "bg-rose-400/10 border-rose-400/25 text-rose-700", icon: "✕" },
  refunded: { cls: "bg-slate-400/10 border-slate-400/25 text-slate-600", icon: "↩" },
};

export default function Invoice() {
  const { id } = useParams();
  const toast = useToast();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/payments/${id}/invoice`);
      setInvoice(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  // Light, print-friendly invoice sheet — reused by both the PDF and print actions.
  const buildInvoiceHtml = () => {
    // Escape every user-controlled value before writing raw HTML.
    const esc = (value) =>
      String(value ?? "").replace(/[&<>"']/g, (ch) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])
      );

    // Build printable content and open a new window
    const html = `
      <html><head><title>Invoice ${esc(invoice.invoiceNumber)}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; color: #111; background: #fff; padding: 40px; }
        .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .logo { font-size: 28px; font-weight: bold; }
        .grad { color: #2563eb; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
        th { color: #6b7280; font-weight: 600; font-size: 12px; text-transform: uppercase; }
        .total-row td { font-weight: 700; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
        .paid { background: #dcfce7; color: #166534; }
        .pending { background: #fef3c7; color: #92400e; }
        .failed { background: #fee2e2; color: #991b1b; }
        .qr-area { text-align: center; margin-top: 20px; }
        .qr { display: inline-block; width: 100px; height: 100px; border: 1px solid #d1d5db; border-radius: 8px; font-family: monospace; display: flex; align-items: center; justify-content: center; font-size: 10px; padding: 4px; word-break: break-all; }
      </style>
      </head><body>
        <div class="header"><div><span class="logo">🧺 Laundry<span class="grad">Roulette</span></span><p style="color:#6b7280;margin-top:4px;font-size:13px;">Invoice</p></div>
        <div style="text-align:right;"><div class="badge ${invoice.paymentStatus === 'success' ? 'paid' : invoice.paymentStatus === 'failed' ? 'failed' : 'pending'}">${invoice.paymentStatus}</div>
        <p style="font-size:12px;color:#6b7280;margin-top:6px;">${esc(invoice.invoiceNumber)}</p></div>
        </div>
        <div class="card">
          <h3 style="font-size:13px;color:#9ca3af;text-transform:uppercase;margin:0 0 16px;">Bill to</h3>
          <p style="margin:4px 0;font-size:14px;"><b>${esc(invoice.studentName)}</b></p>
          <p style="margin:4px 0;font-size:13px;color:#4b5563;">${esc(invoice.studentEmail)}</p>
          <p style="margin:4px 0;font-size:13px;color:#4b5563;">Block: ${esc(invoice.block)}</p>
        </div>
        <div class="card">
          <table>
            <thead><tr><th>Qty</th><th>Type</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr></thead>
            <tbody>
              ${invoice.items.map((it) => `<tr><td>${it.count}</td><td>${esc(it.type.charAt(0).toUpperCase()+it.type.slice(1))}</td><td class="text-right">₹${it.price}</td><td class="text-right">₹${(it.price * it.count).toFixed(2)}</td></tr>`).join("")}
            </tbody>
            <tfoot>
              <tr><td colspan="3">Subtotal</td><td class="text-right">₹${invoice.pricing.subtotal.toFixed(2)}</td></tr>
              ${invoice.pricing.couponCode ? `<tr><td colspan="3">Discount (${esc(invoice.pricing.couponCode)})</td><td class="text-right">-₹${invoice.pricing.discount.toFixed(2)}</td></tr>` : ""}
              <tr><td colspan="3">Tax (5%)</td><td class="text-right">₹${invoice.pricing.tax.toFixed(2)}</td></tr>
              <tr class="total-row"><td colspan="3">Total</td><td class="text-right">₹${invoice.pricing.total.toFixed(2)}</td></tr>
            </tfoot>
          </table>
        </div>
        <div class="card">
          <h3 style="font-size:13px;color:#9ca3af;text-transform:uppercase;margin:0 0 12px;">Batch details</h3>
          <p style="margin:4px 0;font-size:14px;"><b>#${esc(invoice.invoiceNumber)}</b></p>
          <p style="margin:4px 0;font-size:13px;color:#4b5563;">${esc(invoice.batchDetails.description)}</p>
          <p style="margin:4px 0;font-size:13px;color:#4b5563;">Size: ${esc(invoice.batchDetails.itemEstimate)}</p>
          <p style="margin:4px 0;font-size:13px;color:#4b5563;">Batch status: ${esc(invoice.batchDetails.status)}</p>
          <p style="margin:4px 0;font-size:13px;color:#4b5563;">Submitted: ${new Date(invoice.batchDetails.submittedAt).toLocaleDateString()}</p>
        </div>
        <div class="qr-area">
          <div class="qr">${esc(invoice.invoiceNumber)}<br/>${esc(invoice.pricing.total)} ${esc(invoice.pricing.currency)}<br/>${esc(invoice.transactionRef)}</div>
          <p style="font-size:11px;color:#6b7280;margin-top:8px;">Scan or provide this invoice number for verification.</p>
        </div>
      </body></html>
    `;
    return html;
  };

  const openPrintableInvoice = () => {
    const printWin = window.open("", "_blank");
    if (!printWin) {
      toast.error("Allow pop-ups to save or print this invoice");
      return;
    }
    printWin.document.write(buildInvoiceHtml());
    printWin.document.close();
    printWin.focus();
    // Let the browser lay the sheet out before opening the print dialog.
    setTimeout(() => printWin.print(), 300);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-64" />
        <div className="skeleton h-48" />
      </div>
    );
  }
  if (!invoice) return null;

  const sb = STATUS_BADGE[invoice.paymentStatus] || STATUS_BADGE.pending;

  // QR code data string
  const qrData = `${invoice.invoiceNumber}|${invoice.amount}|${invoice.currency}|${invoice.paymentStatus}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/payments" className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-slate-900 transition-colors mb-6 font-medium">
        ← Payment history
      </Link>

      <PageHeader
        eyebrow="Billing"
        title="Invoice"
        actions={
          <div className="print:hidden flex gap-2">
            <button onClick={openPrintableInvoice} className="btn-ghost py-2 px-4 text-xs">📄 Save as PDF</button>
            <button onClick={openPrintableInvoice} className="btn-ghost py-2 px-4 text-xs">🖨 Print</button>
          </div>
        }
      />

      <div className="card p-8 animate-fade-up" style={{ animationDelay: "0.04s" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧺</span>
            <span className="text-xl font-bold text-slate-900">Laundry<span className="grad-text">Roulette</span></span>
          </div>
          <div className="text-right">
            <span className={`badge ${sb.cls}`}>{sb.icon} {invoice.paymentStatus.replace("_", " ")}</span>
            <p className="text-sm font-mono text-[#64748b] mt-1.5">{invoice.invoiceNumber}</p>
          </div>
        </div>

        {/* Bill to */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-wider text-[#64748b] font-semibold mb-2">Bill to</p>
          <p className="font-semibold text-slate-900">{invoice.studentName}</p>
          <p className="text-sm text-[#64748b]">{invoice.studentEmail}</p>
          <p className="text-sm text-[#64748b]">Block: {invoice.block}</p>
        </div>

        {/* Items */}
        <div className="mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-900/10">
                  <th className="text-left py-2 text-[10px] uppercase tracking-wider text-[#64748b] font-semibold">Qty</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wider text-[#64748b] font-semibold">Type</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-[#64748b] font-semibold">Rate</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-[#64748b] font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((it, i) => (
                  <tr key={i} className="border-b border-slate-900/[0.07]">
                    <td className="py-2 text-sm text-[#475569]">{it.count}</td>
                    <td className="py-2 text-sm text-slate-900 capitalize">{it.type}</td>
                    <td className="py-2 text-right text-sm text-[#475569]">₹{it.price}</td>
                    <td className="py-2 text-right text-sm text-slate-900">₹{(it.price * it.count).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-900/15">
                  <td colSpan={3} className="py-2 text-sm text-[#475569]">Subtotal</td>
                  <td className="py-2 text-right text-sm text-slate-900">₹{invoice.pricing.subtotal.toFixed(2)}</td>
                </tr>
                {invoice.pricing.couponCode && (
                  <tr className="border-b border-slate-900/[0.07]">
                    <td colSpan={3} className="py-2 text-sm text-emerald-700">Discount ({invoice.pricing.couponCode})</td>
                    <td className="py-2 text-right text-sm text-emerald-700">-₹{invoice.pricing.discount.toFixed(2)}</td>
                  </tr>
                )}
                <tr className="border-b border-slate-900/[0.07]">
                  <td colSpan={3} className="py-2 text-sm text-[#475569]">Tax (5%)</td>
                  <td className="py-2 text-right text-sm text-slate-900">₹{invoice.pricing.tax.toFixed(2)}</td>
                </tr>
                <tr className="font-bold">
                  <td colSpan={3} className="py-3 text-slate-900">Total</td>
                  <td className="py-3 text-right text-xl text-slate-900">₹{invoice.pricing.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Batch details */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-wider text-[#64748b] font-semibold mb-2">Batch details</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-[#64748b]">Invoice #</span>
              <span className="text-slate-900 font-mono ml-2">{invoice.invoiceNumber}</span>
            </div>
            <div>
              <span className="text-[#64748b]">Status</span>
              <span className="text-slate-900 ml-2 capitalize">{invoice.batchDetails.status}</span>
            </div>
            <div>
              <span className="text-[#64748b]">Items</span>
              <span className="text-slate-900 ml-2">{invoice.batchDetails.description}</span>
            </div>
            <div>
              <span className="text-[#64748b]">Size</span>
              <span className="text-slate-900 ml-2 capitalize">{invoice.batchDetails.itemEstimate}</span>
            </div>
            <div>
              <span className="text-[#64748b]">Submitted</span>
              <span className="text-slate-900 ml-2">{new Date(invoice.batchDetails.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <div>
              <span className="text-[#64748b]">Payment method</span>
              <span className="text-slate-900 ml-2 capitalize">{invoice.method || "upi"}</span>
            </div>
          </div>
        </div>

        {/* QR code area */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-900/10 print:hidden">
          <div>
            <p className="text-[11px] text-[#64748b] mb-2">Transaction reference</p>
            <p className="font-mono text-xs text-slate-900">{invoice.transactionRef || "—"}</p>
          </div>
          <div className="text-center">
            <div className="w-28 h-28 mx-auto rounded-xl bg-slate-900/[0.03] border border-slate-900/10 flex items-center justify-center mb-2">
              <div className="text-center">
                <span className="text-3xl mb-1 block">📱</span>
                <p className="font-mono text-[8px] text-[#64748b] leading-tight break-all">{qrData}</p>
              </div>
            </div>
            <p className="text-[10px] text-[#64748b]">Invoice QR</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900/10 text-center print:hidden">
          <p className="text-xs text-[#64748b]">
            Thank you for using Laundry Roulette!<br />
            <span className="text-[#475569]">Invoice issued on {new Date(invoice.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
