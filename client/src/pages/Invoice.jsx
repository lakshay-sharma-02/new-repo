import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "../components/Toast";

const STATUS_BADGE = {
  success: { cls: "bg-emerald-400/10 border-emerald-400/25 text-emerald-300", icon: "✅" },
  pending: { cls: "bg-amber-400/10 border-amber-400/25 text-amber-300", icon: "⏳" },
  failed: { cls: "bg-rose-400/10 border-rose-400/25 text-rose-300", icon: "✕" },
  refunded: { cls: "bg-slate-400/10 border-slate-400/25 text-slate-400", icon: "↩" },
};

export default function Invoice() {
  const { id } = useParams();
  const toast = useToast();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/payments/${id}/invoice`);
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

  const handleDownload = () => {
    // Build printable content and open a new window
    const html = `
      <html><head><title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; color: #111; background: #fff; padding: 40px; }
        .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .logo { font-size: 28px; font-weight: bold; }
        .grad { color: #6366f1; }
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
        <p style="font-size:12px;color:#6b7280;margin-top:6px;">${invoice.invoiceNumber}</p></div>
        </div>
        <div class="card">
          <h3 style="font-size:13px;color:#9ca3af;text-transform:uppercase;margin:0 0 16px;">Bill to</h3>
          <p style="margin:4px 0;font-size:14px;"><b>${invoice.studentName}</b></p>
          <p style="margin:4px 0;font-size:13px;color:#4b5563;">${invoice.studentEmail}</p>
          <p style="margin:4px 0;font-size:13px;color:#4b5563;">Block: ${invoice.block}</p>
        </div>
        <div class="card">
          <table>
            <thead><tr><th>Qty</th><th>Type</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr></thead>
            <tbody>
              ${invoice.items.map((it) => `<tr><td>${it.count}</td><td>${it.type.charAt(0).toUpperCase()+it.type.slice(1)}</td><td class="text-right">₹${it.price}</td><td class="text-right">₹${(it.price * it.count).toFixed(2)}</td></tr>`).join("")}
            </tbody>
            <tfoot>
              <tr><td colspan="3">Subtotal</td><td class="text-right">₹${invoice.pricing.subtotal.toFixed(2)}</td></tr>
              ${invoice.pricing.couponCode ? `<tr><td colspan="3">Discount (${invoice.pricing.couponCode})</td><td class="text-right">-₹${invoice.pricing.discount.toFixed(2)}</td></tr>` : ""}
              <tr><td colspan="3">Tax (5%)</td><td class="text-right">₹${invoice.pricing.tax.toFixed(2)}</td></tr>
              <tr class="total-row"><td colspan="3">Total</td><td class="text-right">₹${invoice.pricing.total.toFixed(2)}</td></tr>
            </tfoot>
          </table>
        </div>
        <div class="card">
          <h3 style="font-size:13px;color:#9ca3af;text-transform:uppercase;margin:0 0 12px;">Batch details</h3>
          <p style="margin:4px 0;font-size:14px;"><b>#${invoice.invoiceNumber}</b></p>
          <p style="margin:4px 0;font-size:13px;color:#4b5563;">${invoice.batchDetails.description}</p>
          <p style="margin:4px 0;font-size:13px;color:#4b5563;">Size: ${invoice.batchDetails.itemEstimate}</p>
          <p style="margin:4px 0;font-size:13px;color:#4b5563;">Batch status: ${invoice.batchDetails.status}</p>
          <p style="margin:4px 0;font-size:13px;color:#4b5563;">Submitted: ${new Date(invoice.batchDetails.submittedAt).toLocaleDateString()}</p>
        </div>
        <div class="qr-area">
          <div class="qr">${invoice.invoiceNumber}<br/>${invoice.amount} ${invoice.currency}<br/>${invoice.transactionRef || ""}</div>
          <p style="font-size:11px;color:#6b7280;margin-top:8px;">Scan or provide this invoice number for verification.</p>
        </div>
      </body></html>
    `;
    const printWin = window.open("", "_blank");
    printWin.document.write(html);
    printWin.document.close();
    printWin.focus();
    printWin.print();
  };

  const handlePrint = () => {
    window.print();
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
      <Link to="/payments" className="inline-flex items-center gap-1.5 text-sm text-[#8b93a7] hover:text-white transition-colors mb-6 font-medium">
        ← Payment history
      </Link>

      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-white">Invoice</h1>
        <div className="print:hidden flex gap-2">
          <button onClick={handleDownload} className="btn-ghost py-2 px-4 text-xs">📥 Download PDF</button>
          <button onClick={handlePrint} className="btn-ghost py-2 px-4 text-xs">🖨 Print</button>
        </div>
      </div>

      <div className="card p-8 animate-fade-up" style={{ animationDelay: "0.04s" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧺</span>
            <span className="text-xl font-bold text-white">Laundry<span className="grad-text">Roulette</span></span>
          </div>
          <div className="text-right">
            <span className={`badge ${sb.cls}`}>{sb.icon} {invoice.paymentStatus.replace("_", " ")}</span>
            <p className="text-sm font-mono text-[#5d6577] mt-1.5">{invoice.invoiceNumber}</p>
          </div>
        </div>

        {/* Bill to */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-wider text-[#5d6577] font-semibold mb-2">Bill to</p>
          <p className="font-semibold text-white">{invoice.studentName}</p>
          <p className="text-sm text-[#5d6577]">{invoice.studentEmail}</p>
          <p className="text-sm text-[#5d6577]">Block: {invoice.block}</p>
        </div>

        {/* Items */}
        <div className="mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-2 text-[10px] uppercase tracking-wider text-[#5d6577] font-semibold">Qty</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wider text-[#5d6577] font-semibold">Type</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-[#5d6577] font-semibold">Rate</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-[#5d6577] font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((it, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td className="py-2 text-sm text-[#b9c0d0]">{it.count}</td>
                    <td className="py-2 text-sm text-white capitalize">{it.type}</td>
                    <td className="py-2 text-right text-sm text-[#b9c0d0]">₹{it.price}</td>
                    <td className="py-2 text-right text-sm text-white">₹{(it.price * it.count).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/[0.08]">
                  <td colSpan={3} className="py-2 text-sm text-[#8b93a7]">Subtotal</td>
                  <td className="py-2 text-right text-sm text-white">₹{invoice.pricing.subtotal.toFixed(2)}</td>
                </tr>
                {invoice.pricing.couponCode && (
                  <tr className="border-b border-white/[0.04]">
                    <td colSpan={3} className="py-2 text-sm text-emerald-300">Discount ({invoice.pricing.couponCode})</td>
                    <td className="py-2 text-right text-sm text-emerald-300">-₹{invoice.pricing.discount.toFixed(2)}</td>
                  </tr>
                )}
                <tr className="border-b border-white/[0.04]">
                  <td colSpan={3} className="py-2 text-sm text-[#8b93a7]">Tax (5%)</td>
                  <td className="py-2 text-right text-sm text-white">₹{invoice.pricing.tax.toFixed(2)}</td>
                </tr>
                <tr className="font-bold">
                  <td colSpan={3} className="py-3 text-white">Total</td>
                  <td className="py-3 text-right text-xl text-white">₹{invoice.pricing.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Batch details */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-wider text-[#5d6577] font-semibold mb-2">Batch details</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-[#5d6577]">Invoice #</span>
              <span className="text-white font-mono ml-2">{invoice.invoiceNumber}</span>
            </div>
            <div>
              <span className="text-[#5d6577]">Status</span>
              <span className="text-white ml-2 capitalize">{invoice.batchDetails.status}</span>
            </div>
            <div>
              <span className="text-[#5d6577]">Items</span>
              <span className="text-white ml-2">{invoice.batchDetails.description}</span>
            </div>
            <div>
              <span className="text-[#5d6577]">Size</span>
              <span className="text-white ml-2 capitalize">{invoice.batchDetails.itemEstimate}</span>
            </div>
            <div>
              <span className="text-[#5d6577]">Submitted</span>
              <span className="text-white ml-2">{new Date(invoice.batchDetails.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <div>
              <span className="text-[#5d6577]">Payment method</span>
              <span className="text-white ml-2 capitalize">{invoice.method || "upi"}</span>
            </div>
          </div>
        </div>

        {/* QR code area */}
        <div className="flex items-center justify-between pt-6 border-t border-white/[0.06] print:hidden">
          <div>
            <p className="text-[11px] text-[#5d6577] mb-2">Transaction reference</p>
            <p className="font-mono text-xs text-white">{invoice.transactionRef || "—"}</p>
          </div>
          <div className="text-center">
            <div className="w-28 h-28 mx-auto rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-2">
              <div className="text-center">
                <span className="text-3xl mb-1 block">📱</span>
                <p className="font-mono text-[8px] text-[#5d6577] leading-tight break-all">{qrData}</p>
              </div>
            </div>
            <p className="text-[10px] text-[#5d6577]">Invoice QR</p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/[0.06] text-center print:hidden">
          <p className="text-xs text-[#5d6577]">
            Thank you for using Laundry Roulette!<br />
            <span className="text-[#8b93a7]">Invoice issued on {new Date(invoice.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
