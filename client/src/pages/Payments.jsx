import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const STATUS_BADGE = {
  success: { cls: "bg-emerald-400/10 border-emerald-400/25 text-emerald-300", icon: "✅" },
  pending: { cls: "bg-amber-400/10 border-amber-400/25 text-amber-300", icon: "⏳" },
  failed: { cls: "bg-rose-400/10 border-rose-400/25 text-rose-300", icon: "✕" },
  refunded: { cls: "bg-slate-400/10 border-slate-400/25 text-slate-400", icon: "↩" },
};

const METHOD_ICON = {
  upi: "📱",
  card: "💳",
  netbanking: "🏦",
};

export default function Payments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/payments");
      setPayments(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const totalSpent = payments.filter((p) => p.status === "success").reduce((s, p) => s + (p.amount || 0), 0);
  const pendingCount = payments.filter((p) => p.status === "pending").length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="skeleton h-10 w-48" />
        <div className="grid sm:grid-cols-2 gap-4">{Array(2).fill().map((_, i) => <div key={i} className="skeleton h-24" />)}</div>
        <div className="space-y-3">
          {Array(3).fill().map((_, i) => <div key={i} className="skeleton h-56" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Payment history</h1>
          <p className="muted mt-2">Track every charge, download invoices, and review past payments.</p>
        </div>
        <Link to="/submit" className="btn-ghost py-2.5 px-5 text-[13px]">← Submit new batch</Link>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="card card-hover p-5 flex items-center justify-between animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <div>
            <p className="text-xs text-[#8b93a7] font-medium uppercase tracking-wider">Total paid</p>
            <p className="text-2xl font-bold text-white mt-1.5">₹{totalSpent.toLocaleString("en-IN")}</p>
          </div>
          <span className="text-2xl">💰</span>
        </div>
        <div className="card card-hover p-5 flex items-center justify-between animate-fade-up" style={{ animationDelay: "0.08s" }}>
          <div>
            <p className="text-xs text-[#8b93a7] font-medium uppercase tracking-wider">Transactions</p>
            <p className="text-2xl font-bold text-white mt-1.5">{payments.length}</p>
          </div>
          <span className="text-2xl">📊</span>
        </div>
        <div className="card card-hover p-5 flex items-center justify-between animate-fade-up" style={{ animationDelay: "0.11s" }}>
          <div>
            <p className="text-xs text-[#8b93a7] font-medium uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-white mt-1.5">{pendingCount}</p>
          </div>
          <span className="text-2xl">⏱️</span>
        </div>
      </div>

      {/* Payments list */}
      {payments.length === 0 ? (
        <div className="card p-14 text-center animate-scale-in">
          <p className="text-5xl mb-4 opacity-80">💳</p>
          <p className="text-lg font-semibold text-white">No payments yet</p>
          <p className="muted text-sm mt-1.5 mb-6">Submit a laundry batch and we'll generate your first invoice.</p>
          <Link to="/submit" className="btn-primary inline-flex">Submit a batch</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((p, i) => {
            const sb = STATUS_BADGE[p.status] || STATUS_BADGE.pending;
            return (
              <Link
                key={p._id}
                to={`/payments/${p._id}`}
                className="card card-hover p-5 block animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`badge ${sb.cls}`}>{sb.icon} {p.status.replace("_", " ")}</span>
                    <span className="font-mono text-xs text-[#5d6577]">#{String(p._id).slice(-6).toUpperCase()}</span>
                  </div>
                  <span className="text-right">
                    <p className="text-lg font-bold text-white">₹{(p.amount || 0).toLocaleString("en-IN")}</p>
                    <p className="text-[10px] text-[#5d6577]">{new Date(p.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-xs text-[#8b93a7]">
                      {METHOD_ICON[p.method] || "💳"} {p.method || "upi"}
                    </span>
                    {p.batchInfo && (
                      <span className="text-xs text-[#5d6577] truncate max-w-[180px]">• {p.batchInfo.description}</span>
                    )}
                    {p.transactionRef && (
                      <span className="font-mono text-[10px] text-[#5d6577]">ref: {p.transactionRef}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-accent-300">View invoice →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
