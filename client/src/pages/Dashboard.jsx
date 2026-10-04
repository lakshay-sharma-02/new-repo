import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import StatusTracker from "../components/StatusTracker";

const ORDER = ["submitted", "received", "washing", "drying", "folding", "ready", "picked_up"];

const BADGE_STYLE = {
  ready: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", fg: "#6ee7b7", icon: "🎉" },
  picked_up: { bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)", fg: "#cbd5e1", icon: "🏠" },
  washing: { bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.3)", fg: "#a5b4fc", icon: "🫧" },
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
    { label: "In progress", value: inProgress.length, icon: "⏳", ring: "from-accent-500 to-fuchsia-500", text: "#a5b4fc", chip: "rgba(129,140,248,0.12)" },
    { label: "Ready for pickup", value: readyForPickup.length, icon: "📦", ring: "from-emerald-400 to-teal-500", text: "#6ee7b7", chip: "rgba(52,211,153,0.12)" },
    { label: "Completed", value: done.length, icon: "🏁", ring: "from-slate-400 to-slate-500", text: "#cbd5e1", chip: "rgba(148,163,184,0.1)" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {greeting}{firstName ? `, ${firstName}` : ""} 👋
          </h1>
          <p className="muted mt-2">Here's your laundry at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/submit" className="btn-primary py-2.5 px-5 text-[13px]">+ Submit batch</Link>
        </div>
      </div>

      {/* Block schedule strip (published by the laundry service) */}
      {timings && (
        <div className="card px-5 py-3 mb-8 flex flex-wrap items-center gap-x-4 gap-y-1.5 animate-fade-up" style={{ animationDelay: "0.03s" }}>
          <span className="text-xs font-semibold text-white/85">🗓️ Block schedule · {timings.hostelBlock}</span>
          <span className="text-xs text-[#b9c0d0]">{timings.laundryDays.join(" · ")}</span>
          <span className="text-xs text-[#5d6577]">Drop-off {timings.dropoffStart}–{timings.dropoffEnd}</span>
          <span className="text-xs text-[#5d6577]">Pickup {timings.pickupStart}–{timings.pickupEnd}</span>
          <span className="badge bg-accent-500/15 border border-accent-400/30 text-accent-300 ml-auto text-[10px]">ETA ~{timings.turnaroundDays}d</span>
        </div>
      )}

      {/* No published schedule warning */}
      {!timings && (
        <div className="card p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-up" style={{ borderColor: "rgba(251,191,36,0.25)" }}>
          <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-xl shrink-0">⚠️</div>
          <div className="flex-1">
            <p className="font-semibold text-white">No schedule published for your block yet</p>
            <p className="text-sm text-[#8b93a7] mt-0.5">The laundry service for your block hasn't shared its drop-off days yet — once they do, you can submit and track batches here.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={s.label} className="card card-hover p-5 flex items-center justify-between animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
            <div>
              <p className="text-sm text-[#8b93a7] font-medium">{s.label}</p>
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
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
            Active batches
            {active.length > 0 && (
              <span className="flex items-center gap-1.5 badge bg-emerald-400/10 border border-emerald-400/25 text-emerald-300 py-0.5 px-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-glow" /> live
              </span>
            )}
          </h2>
        </div>

        {active.length === 0 ? (
          <div className="card p-14 text-center">
            <p className="text-5xl mb-4 opacity-80">🧺</p>
            <p className="text-lg font-semibold text-white">No active laundry</p>
            <p className="muted text-sm mt-1 mb-6">Everything's picked up — nice and clean.</p>
            <Link to="/submit" className="btn-primary inline-flex">Submit your first batch →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {active.map((b, i) => {
              const bs = BADGE_STYLE[b.status] || { bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.3)", fg: "#a5b4fc", icon: "⏳" };
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
                        <span className="badge bg-rose-400/10 border border-rose-400/25 text-rose-300">⚠ issue</span>
                      )}
                      <span className="badge bg-white/[0.04] border border-white/10 text-[#8b93a7] font-mono text-[10px]">
                        #{String(b._id).slice(-5).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-[#5d6577]">
                      {new Date(b.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  {b.description && <p className="text-sm font-medium text-white/85 mb-4">{b.description}</p>}

                  <StatusTracker currentStatus={b.status} compact />

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
                    <p className="text-xs text-[#5d6577]">
                      Est. ready{" "}
                      <span className="text-white/80 font-medium">
                        {est.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                      {daysLeft > 0 && <span className="ml-1.5 text-[#8b93a7]">· {daysLeft}d away</span>}
                    </p>
                    <span className="text-xs font-medium text-accent-300">View details →</span>
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
          <h2 className="text-lg font-bold text-white tracking-tight mb-5">Recently completed</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {done.slice(0, 6).map((b) => (
              <div key={b._id} className="card p-4 flex items-center gap-3 opacity-80">
                <div className="w-9 h-9 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-base shrink-0">✅</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-emerald-300">Picked up</p>
                  {b.description && <p className="text-xs text-[#8b93a7] truncate mt-0.5">{b.description}</p>}
                </div>
                <span className="text-[10px] text-[#5d6577] shrink-0">
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
