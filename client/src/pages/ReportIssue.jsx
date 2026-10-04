import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "../components/Toast";

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
        className="inline-flex items-center gap-1.5 text-sm text-[#8b93a7] hover:text-white transition-colors mb-6 font-medium">
        ← Back to batch
      </Link>

      <div className="mb-8 animate-fade-up">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-rose-400/10 border border-rose-400/25 items-center justify-center text-2xl mb-5">⚠️</div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Report an issue</h1>
        <p className="muted mt-2">The report is linked to your batch ID, so there's a real record — no more memory-vs-memory.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm text-rose-200 border animate-scale-in"
            style={{ background: "rgba(251,113,133,0.08)", borderColor: "rgba(251,113,133,0.25)" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Quick chips */}
        <div className="animate-fade-up" style={{ animationDelay: "0.04s" }}>
          <p className="text-[11px] uppercase tracking-wider text-[#5d6577] font-semibold mb-2.5">Common issues</p>
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button key={q} type="button" onClick={() => setIssueDescription(q)}
                className="px-3.5 py-2 rounded-full text-xs font-medium border border-white/10 bg-white/[0.04] text-[#b9c0d0] hover:border-rose-400/40 hover:text-white transition-all cursor-pointer">
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6 animate-fade-up" style={{ animationDelay: "0.08s" }}>
          <label className="block text-sm font-medium text-[#b9c0d0] mb-3">📝 What went wrong?</label>
          <textarea
            required
            rows={5}
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            className="field resize-none leading-relaxed"
            placeholder="Describe the item, what happened, and any details that help us investigate…"
          />
          <p className="text-xs text-[#5d6577] mt-2">
            Be specific — item type, color, and what condition it was in when you dropped it off.
          </p>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 text-[15px] font-semibold rounded-xl text-white transition-all disabled:opacity-50 cursor-pointer"
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
