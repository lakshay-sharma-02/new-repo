import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import StatusTracker from "../components/StatusTracker";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const ORDER = ["submitted", "received", "washing", "drying", "folding", "ready", "picked_up"];

const META = {
  received: { label: "Received by staff", icon: "✅" },
  washing: { label: "Washing", icon: "🫧" },
  drying: { label: "Drying", icon: "☀️" },
  folding: { label: "Folding", icon: "👕" },
  ready: { label: "Ready for pickup", icon: "🎉" },
  picked_up: { label: "Picked up", icon: "🏠" },
};

const COLOR = {
  ready: "#34d399",
  picked_up: "#94a3b8",
  issue: "#fb7185",
};

export default function TrackStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchBatch = useCallback(async () => {
    try {
      const res = await api.get(`/batches/${id}`);
      setBatch(res.data);
    } catch {
      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchBatch();
    const iv = setInterval(fetchBatch, 3000); // live demo reacts in real time
    return () => clearInterval(iv);
  }, [fetchBatch]);

  const advance = async (to, label) => {
    setUpdating(true);
    try {
      await api.patch(`/batches/${id}/status`, { status: to });
      toast.success(label || `Marked as ${to.replace("_", " ")}`);
      await fetchBatch();
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't update status");
    } finally {
      setUpdating(false);
    }
  };

  const pickup = () => advance("picked_up", "Batch picked up — thanks! 🏠");

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-5">
        <div className="skeleton h-5 w-28" />
        <div className="skeleton h-72" />
        <div className="skeleton h-52" />
      </div>
    );
  }
  if (!batch) return null;

  const idx = ORDER.indexOf(batch.status);
  const next = idx >= 0 && idx < ORDER.length - 1 ? ORDER[idx + 1] : null;
  const history = [...(batch.statusHistory || [])].reverse();
  const issueColor = batch.issueReported ? COLOR.issue : null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#8b93a7] hover:text-white transition-colors mb-6 font-medium">
        ← Dashboard
      </Link>

      {/* Main card */}
      <div className="card overflow-hidden animate-fade-up">
        {/* Top strip */}
        <div className="px-6 pt-6 pb-2 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
              style={{
                background: issueColor ? "rgba(251,113,133,0.12)" : "rgba(99,102,241,0.14)",
                border: `1px solid ${issueColor || "rgba(129,140,248,0.3)"}`,
              }}>
              {issueColor ? "⚠️" : "🧺"}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Laundry batch</h1>
              <p className="text-xs text-[#5d6577] font-mono mt-0.5">
                #{String(batch._id).slice(-8).toUpperCase()} · {new Date(batch.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
          <span className="badge bg-emerald-400/10 border border-emerald-400/25 text-emerald-300 py-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-glow" /> live
          </span>
        </div>

        {/* Tracker */}
        <div className="px-6 py-5">
          <StatusTracker currentStatus={batch.status} />
        </div>

        {/* Details */}
        <div className="px-6 py-5 border-t border-white/[0.05] space-y-3.5">
          <Row label="Items">{batch.description || <span className="text-[#5d6577]">—</span>}</Row>
          <Row label="Size">
            <span className="capitalize">{batch.itemEstimate || "—"}</span>
          </Row>
          <Row label="Est. ready">
            <span className="text-emerald-300 font-semibold">
              {new Date(batch.estimatedReady).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </Row>
          <Row label="Current">
            <span className="text-accent-300 capitalize font-semibold">{batch.status.replace("_", " ")}</span>
          </Row>

          {batch.issueReported && !batch.issueResolved && (
            <div className="rounded-xl px-4 py-3 text-sm mt-2 border"
              style={{ background: "rgba(251,113,133,0.07)", borderColor: "rgba(251,113,133,0.25)" }}>
              <p className="font-semibold text-rose-300 mb-1">⚠️ Issue reported — staff notified</p>
              <p className="text-rose-200/80 text-[13px] leading-relaxed">{batch.issueDescription}</p>
              <p className="text-[11px] text-rose-300/60 mt-2">You'll get a notification here when the staff responds.</p>
            </div>
          )}
          {batch.issueReported && batch.issueResolved && (
            <div className="rounded-xl px-4 py-3 text-sm mt-2 border"
              style={{ background: "rgba(52,211,153,0.06)", borderColor: "rgba(52,211,153,0.25)" }}>
              <p className="font-semibold text-emerald-300 mb-1">✅ Issue resolved</p>
              <p className="text-rose-200/70 text-[13px] leading-relaxed line-through decoration-rose-400/40">{batch.issueDescription}</p>
              {batch.issueResponse && (
                <p className="text-emerald-200/80 text-[13px] leading-relaxed mt-2 bg-white/[0.03] rounded-lg px-3 py-2">
                  💬 {batch.issueResponse}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Advance / pickup controls */}
        <div className="px-6 pb-6">
          {isStudent && batch.status === "ready" ? (
            <div className="rounded-xl p-4 border"
              style={{ background: "rgba(52,211,153,0.07)", borderColor: "rgba(52,211,153,0.3)" }}>
              <p className="text-center text-emerald-300 font-semibold mb-3">🎉 Ready — come pick it up!</p>
              <button onClick={pickup} disabled={updating}
                className="btn-primary w-full py-3.5">
                {updating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /> Confirming…
                  </span>
                ) : "🏠 I picked it up"}
              </button>
            </div>
          ) : isStudent && batch.status === "picked_up" ? (
            <p className="text-center text-sm text-[#8b93a7]">Batch complete — nice and clean. 🧺</p>
          ) : isStudent ? (
            <div className="rounded-xl px-4 py-3.5 text-center border"
              style={{ background: "rgba(99,102,241,0.05)", borderColor: "rgba(129,140,248,0.2)" }}>
              <p className="text-sm text-[#b9c0d0]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-400 animate-glow mr-2" />
                In progress — the laundry service updates this at every stage, and you'll get a ping when it's ready.
              </p>
            </div>
          ) : batch.status === "picked_up" ? (
            <p className="text-center text-sm text-[#8b93a7]">Batch complete 🏠</p>
          ) : next ? (
            <button onClick={() => advance(next, META[next]?.label)} disabled={updating}
              className="btn-primary w-full py-3.5">
              {updating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /> Updating…
                </span>
              ) : (
                <>Advance to: {META[next]?.icon} {META[next]?.label}</>
              )}
            </button>
          ) : null}
        </div>
      </div>

      {/* Timeline */}
      {history.length > 0 && (
        <div className="card p-6 mt-5 animate-fade-up" style={{ animationDelay: "0.08s" }}>
          <h2 className="text-sm font-bold text-white mb-5">History</h2>
          <div className="relative pl-1">
            <div className="absolute left-[13px] top-2 bottom-2 w-px bg-white/[0.08]" />
            <div className="space-y-5">
              {history.map((entry, i) => {
                const m = META[entry.status] || { icon: "📋", label: entry.status.replace("_", " ") };
                const isLatest = i === 0;
                return (
                  <div key={i} className="flex items-start gap-4 relative animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 z-10 border"
                      style={
                        isLatest
                          ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderColor: "transparent", boxShadow: "0 0 0 4px rgba(99,102,241,0.15)" }
                          : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }
                      }
                    >
                      {m.icon}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold capitalize ${isLatest ? "text-white" : "text-[#b9c0d0]"}`}>
                          {m.label}
                        </span>
                        {isLatest && (
                          <span className="badge bg-accent-500/15 border border-accent-400/30 text-accent-300 py-0.5 px-2 text-[9px]">
                            LATEST
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5d6577] mt-0.5">
                        {new Date(entry.updatedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </p>
                      {entry.note && (
                        <p className="text-xs text-[#8b93a7] mt-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5">{entry.note}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Report issue */}
      {batch.status !== "picked_up" && !batch.issueReported && (
        <div className="mt-6 animate-fade-up" style={{ animationDelay: "0.12s" }}>
          <Link to={`/report/${batch._id}`}
            className="inline-flex items-center gap-2 text-sm text-rose-300 hover:text-rose-200 font-medium transition-colors">
            ⚠️ Something wrong? Report an issue
          </Link>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[11px] uppercase tracking-wider text-[#5d6577] font-semibold w-20 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-white/85">{children}</span>
    </div>
  );
}
