import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import StatusTracker from "../components/StatusTracker";
import PageHeader from "../components/PageHeader";

const BADGE_STYLE = {
  ready: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", fg: "#047857", icon: "🎉" },
  picked_up: { bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)", fg: "#475569", icon: "🏠" },
  washing: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", fg: "#1d4ed8", icon: "🫧" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [batchRes, timingsRes] = await Promise.all([
        api.get("/batches"),
        api.get("/timings").catch(() => null),
      ]);
      setBatches(batchRes.data || []);
      setTimings(timingsRes?.data || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Poll so live demo simulation shows up in real time
    const iv = setInterval(fetchAll, 4000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = (user?.name || "").split(" ")[0];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="skeleton h-10 w-72" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-28" />)}
        </div>
        <div className="skeleton h-64" />
      </div>
    );
  }

  const active = batches.filter((b) => b.status !== "picked_up");
  const inProgress = active.filter((b) => b.status !== "ready");
  const readyForPickup = active.filter((b) => b.status === "ready");
  const done = batches.filter((b) => b.status === "picked_up");

  const stats = [
    { label: "In progress", value: inProgress.length, icon: "⏳", ring: "from-accent-500 to-sky-500", text: "#1d4ed8", chip: "rgba(59,130,246,0.12)" },
    { label: "Ready for pickup", value: readyForPickup.length, icon: "📦", ring: "from-emerald-400 to-teal-500", text: "#047857", chip: "rgba(52,211,153,0.12)" },
    { label: "Completed", value: done.length, icon: "🏁", ring: "from-slate-400 to-slate-500", text: "#475569", chip: "rgba(148,163,184,0.1)" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <PageHeader
        eyebrow="Student dashboard"
        title={`${greeting}${firstName ? `, ${firstName}` : ""} 👋`}
        subtitle="Here's your laundry at a glance — live status, block schedule, and pickup windows."
        actions={
          <>
            <Link to="/timings" className="btn-ghost py-2.5 px-5 text-[13px]">🗓️ Block schedule</Link>
            <Link to="/submit" className="btn-primary py-2.5 px-5 text-[13px]">+ Submit batch</Link>
          </>
        }
      />

      {/* Block schedule strip (published by the laundry service) */}
      {timings && (
        <div className="card px-5 py-3 mb-8 flex flex-wrap items-center gap-x-4 gap-y-1.5 animate-fade-up" style={{ animationDelay: "0.03s" }}>
          <span className="text-xs font-semibold text-slate-700">🗓️ Block schedule · {timings.hostelBlock}</span>
          <span className="text-xs text-[#475569]">{timings.laundryDays.join(" · ")}</span>
          <span className="text-xs text-[#64748b]">Drop-off {timings.dropoffStart}–{timings.dropoffEnd}</span>
          <span className="text-xs text-[#64748b]">Pickup {timings.pickupStart}–{timings.pickupEnd}</span>
          <span className="badge bg-accent-500/15 border border-accent-400/30 text-accent-600 ml-auto text-[10px]">ETA ~{timings.turnaroundDays}d</span>
        </div>
      )}

      {/* No published schedule warning */}
      {!timings && (
        <div className="card p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-up" style={{ borderColor: "rgba(251,191,36,0.25)" }}>
          <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-xl shrink-0">⚠️</div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">No schedule published for your block yet</p>
            <p className="text-sm text-[#475569] mt-0.5">The laundry service for your block hasn't shared its drop-off days yet — once they do, you can submit and track batches here.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={s.label} className="card card-hover p-5 flex items-center justify-between animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
            <div>
              <p className="text-sm text-[#475569] font-medium">{s.label}</p>
              <p className="text-3xl font-bold mt-1.5" style={{ color: s.text }}>{s.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.ring} flex items-center justify-center text-xl shadow-lg`} style={{ opacity: 0.9 }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Active batches */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Active batches
            {active.length > 0 && (
              <span className="flex items-center gap-1.5 badge bg-emerald-400/10 border border-emerald-400/25 text-emerald-700 py-0.5 px-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-glow" /> live
              </span>
            )}
          </h2>
        </div>

        {active.length === 0 ? (
          <div className="card p-12 sm:p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-400/20 flex items-center justify-center text-3xl mx-auto mb-5">🧺</div>
            <p className="text-lg font-semibold text-slate-900">No active laundry</p>
            <p className="muted text-sm mt-1.5 mb-6 max-w-sm mx-auto">
              Everything's picked up — nice and clean. Drop a bag at your block's collection point
              and log it here to get a live tracker.
            </p>
            <Link to="/submit" className="btn-primary inline-flex">Submit your first batch →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {active.map((b, i) => {
              const bs = BADGE_STYLE[b.status] || { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", fg: "#1d4ed8", icon: "⏳" };
              const est = new Date(b.estimatedReady);
              const daysLeft = Math.ceil((est - Date.now()) / 86400000);
              return (
                <Link
                  key={b._id}
                  to={`/track/${b._id}`}
                  className="card card-hover p-5 block animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="badge" style={{ background: bs.bg, border: `1px solid ${bs.border}`, color: bs.fg }}>
                        {bs.icon} {b.status.replace("_", " ")}
                      </span>
                      {b.issueReported && (
                        <span className="badge bg-rose-400/10 border border-rose-400/25 text-rose-700">⚠ issue</span>
                      )}
                      <span className="badge bg-slate-900/[0.04] border border-slate-900/10 text-[#475569] font-mono text-[10px]">
                        #{String(b._id).slice(-5).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-[#64748b]">
                      {new Date(b.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  {b.description && <p className="text-sm font-medium text-slate-700 mb-4">{b.description}</p>}

                  <StatusTracker currentStatus={b.status} compact />

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-900/10">
                    <p className="text-xs text-[#64748b]">
                      Est. ready{" "}
                      <span className="text-slate-700 font-medium">
                        {est.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                      {daysLeft > 0 && <span className="ml-1.5 text-[#475569]">· {daysLeft}d away</span>}
                    </p>
                    <span className="text-xs font-medium text-accent-600">View details →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recently completed */}
      {done.length > 0 && (
        <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-5">Recently completed</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {done.slice(0, 6).map((b) => (
              <div key={b._id} className="card p-4 flex items-center gap-3 opacity-80">
                <div className="w-9 h-9 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-base shrink-0">✅</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-emerald-700">Picked up</p>
                  {b.description && <p className="text-xs text-[#475569] truncate mt-0.5">{b.description}</p>}
                </div>
                <span className="text-[10px] text-[#64748b] shrink-0">
                  {new Date(b.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
