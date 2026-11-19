import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "../components/Toast";
import PageHeader from "../components/PageHeader";

const QUICK = [
  "Item missing from my bag",
  "Item damaged (stain / tear / shrink)",
  "Wrong items returned",
  "Items mixed with another student's",
];

export default function ReportIssue() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [issueDescription, setIssueDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (issueDescription.trim().length < 10) {
      setError("Give us a bit more detail (min 10 characters)");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/batches/${id}/report-issue`, { issueDescription });
      toast.success("Issue reported — it's attached to your batch record");
      navigate(`/track/${id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link to={`/track/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-slate-900 transition-colors mb-6 font-medium">
        ← Back to batch
      </Link>

      <PageHeader
        icon="⚠️"
        eyebrow={`Batch #${String(id || "").slice(-8).toUpperCase()}`}
        title="Report an issue"
        subtitle="The report is linked to your batch ID, so there's a real record — no more memory-vs-memory."
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm text-rose-700 border animate-scale-in"
            style={{ background: "rgba(251,113,133,0.08)", borderColor: "rgba(251,113,133,0.25)" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Quick chips */}
        <div className="animate-fade-up" style={{ animationDelay: "0.04s" }}>
          <p className="text-[11px] uppercase tracking-wider text-[#64748b] font-semibold mb-2.5">Common issues</p>
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button key={q} type="button" onClick={() => setIssueDescription(q)}
                className="px-3.5 py-2 rounded-full text-xs font-medium border border-slate-900/10 bg-slate-900/[0.04] text-[#475569] hover:border-rose-400/40 hover:text-slate-900 transition-all cursor-pointer">
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6 animate-fade-up" style={{ animationDelay: "0.08s" }}>
          <label className="block text-sm font-medium text-[#475569] mb-3">📝 What went wrong?</label>
          <textarea
            required
            rows={5}
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            className="field resize-none leading-relaxed"
            placeholder="Describe the item, what happened, and any details that help us investigate…"
          />
          <p className="text-xs text-[#64748b] mt-2">
            Be specific — item type, color, and what condition it was in when you dropped it off.
          </p>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 text-[15px] font-semibold rounded-xl text-slate-900 transition-all disabled:opacity-50 cursor-pointer"
          style={{ background: "linear-gradient(135deg,#e11d48,#f43f5e)", boxShadow: "0 10px 30px -10px rgba(225,29,72,0.5)" }}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /> Submitting…
            </span>
          ) : "Submit report"}
        </button>
      </form>
    </div>
  );
}
