import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const ORDER = ["submitted", "received", "washing", "drying", "folding", "ready", "picked_up"];
const LABELS = {
  submitted: "Submitted",
  received: "Received",
  washing: "Washing",
  drying: "Drying",
  folding: "Folding",
  ready: "Ready",
  picked_up: "Picked up",
};
const ICONS = {
  submitted: "📋", received: "✅", washing: "🫧", drying: "☀️",
  folding: "👕", ready: "🎉", picked_up: "🏠",
};
const STAGE_COLOR = {
  submitted: { bg: "rgba(148,163,184,0.12)", fg: "#cbd5e1", border: "rgba(148,163,184,0.25)" },
  received: { bg: "rgba(34,211,238,0.12)", fg: "#67e8f9", border: "rgba(34,211,238,0.3)" },
  washing: { bg: "rgba(129,140,248,0.14)", fg: "#a5b4fc", border: "rgba(129,140,248,0.35)" },
  drying: { bg: "rgba(251,191,36,0.12)", fg: "#fcd34d", border: "rgba(251,191,36,0.3)" },
  folding: { bg: "rgba(232,121,249,0.12)", fg: "#f0abfc", border: "rgba(232,121,249,0.3)" },
  ready: { bg: "rgba(52,211,153,0.12)", fg: "#6ee7b7", border: "rgba(52,211,153,0.35)" },
  picked_up: { bg: "rgba(148,163,184,0.08)", fg: "#94a3b8", border: "rgba(148,163,184,0.15)" },
};

const VIEWS = [
  { key: "all", label: "All batches" },
  { key: "queued", label: "Queued" },
  { key: "machines", label: "In machines" },
  { key: "ready", label: "Ready now" },
  { key: "issues", label: "Open issues" },
];

export default function StaffConsole() {
  const { user } = useAuth();
  const toast = useToast();
  const [batches, setBatches] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [view, setView] = useState("all");
  const [blockFilter, setBlockFilter] = useState("ALL");
  const [busyId, setBusyId] = useState(null);
  const [nextSel, setNextSel] = useState({});
  const [resolvingId, setResolvingId] = useState(null);
  const [resolveText, setResolveText] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [b, s] = await Promise.all([
        api.get("/batches"),
        api.get("/timings/all"),
      ]);
      setBatches(b.data || []);
      setSchedules(s.data || []);
    } catch {
      /* transient */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 3000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  const blocks = [...new Set(batches.map((b) => b.hostelBlock).filter(Boolean))].sort();

  const visible = batches.filter((b) => {
    if (blockFilter !== "ALL" && b.hostelBlock !== blockFilter) return false;
    if (view === "queued") return b.status === "submitted" || b.status === "received";
    if (view === "machines") return ["washing", "drying", "folding"].includes(b.status);
    if (view === "ready") return b.status === "ready";
    if (view === "issues") return b.issueReported && !b.issueResolved;
    return true; // all (incl. picked up)
  });

  const queued = batches.filter((b) => b.status === "submitted" || b.status === "received").length;
  const inMachines = batches.filter((b) => ["washing", "drying", "folding"].includes(b.status)).length;
  const readyNow = batches.filter((b) => b.status === "ready").length;
  const openIssues = batches.filter((b) => b.issueReported && !b.issueResolved).length;
  const completedToday = batches.filter((b) => {
    if (b.status !== "picked_up") return false;
    const d = new Date(b.updatedAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const stats = [
    { label: "Queued", value: queued, icon: "📥", ring: "from-slate-400 to-slate-600", text: "#cbd5e1" },
    { label: "In machines", value: inMachines, icon: "🫧", ring: "from-accent-500 to-fuchsia-500", text: "#a5b4fc" },
    { label: "Ready now", value: readyNow, icon: "🎉", ring: "from-emerald-400 to-teal-500", text: "#6ee7b7" },
    { label: "Open issues", value: openIssues, icon: "⚠️", ring: "from-rose-500 to-orange-500", text: "#fda4af" },
  ];

  // Last-7-days activity bars (from batch creation)
  const bars = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({ day: d, count: 0 });
    }
    batches.forEach((b) => {
      const created = new Date(b.createdAt);
      const hit = days.find((x) => x.day.toDateString() === created.toDateString());
      if (hit) hit.count++;
    });
    const max = Math.max(1, ...days.map((d) => d.count));
    return days.map((d) => ({
      label: d.day.toLocaleDateString(undefined, { weekday: "narrow" }),
      count: d.count,
      h: Math.round((d.count / max) * 100),
      today: d.day.toDateString() === new Date().toDateString(),
    }));
  })();

  const advance = async (batch, status) => {
    setBusyId(batch._id);
    try {
      await api.patch(`/batches/${batch._id}/status`, { status });
      toast.success(`${batch.ownerName || "Batch"} → ${LABELS[status]}`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't move batch");
    } finally {
      setBusyId(null);
    }
  };

  const startResolve = (batch) => {
    setResolvingId(resolvingId === batch._id ? null : batch._id);
    setResolveText("");
  };

  const resolve = async (batch) => {
    if (!resolveText.trim()) return;
    setBusyId(batch._id);
    try {
      await api.post(`/batches/${batch._id}/resolve-issue`, { response: resolveText.trim() });
      toast.success("Issue resolved — student notified");
      setResolvingId(null);
      setResolveText("");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't resolve issue");
    } finally {
      setBusyId(null);
    }
  };

  const greeting = `${user?.name?.split(" ")[0] || "Staff"}, ${user?.role === "warden" ? "all blocks" : `block ${user?.hostelBlock}`}`;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="skeleton h-10 w-72" />
        <div className="grid sm:grid-cols-4 gap-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-28" />)}</div>
        <div className="skeleton h-80" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Ops console</h1>
            <span className="badge bg-accent-500/15 border border-accent-400/30 text-accent-300 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-glow mr-1.5 inline-block" />
              {user?.role === "warden" ? "WARDEN" : "STAFF"} · {user?.hostelBlock}
            </span>
          </div>
          <p className="muted mt-2">The laundry floor, live — drive every batch from drop-off to pickup.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#5d6577] font-medium">{greeting}</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 badge bg-emerald-400/10 border border-emerald-400/25 text-emerald-300 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-glow" /> live · polls every 3s
          </span>
        </div>
      </div>

      {/* Schedule strip */}
      {schedules.length > 0 && (
        <div className="flex flex-wrap gap-2.5 mb-8 animate-fade-up" style={{ animationDelay: "0.04s" }}>
          {schedules.map((s) => (
            <div key={s._id} className="card px-4 py-2.5 flex items-center gap-3">
              <span className="badge bg-accent-500/15 border border-accent-400/30 text-accent-300">{s.hostelBlock}</span>
              <span className="text-xs text-[#8b93a7] font-medium hidden sm:inline">{s.laundryDays.join(" · ")}</span>
              <span className="text-xs text-[#5d6577] hidden md:inline">
                drop {s.dropoffStart}–{s.dropoffEnd} · pickup {s.pickupStart}–{s.pickupEnd} · ~{s.turnaroundDays}d
              </span>
            </div>
          ))}
          <a href="/timings" className="btn-ghost py-2.5 px-4 text-xs self-center">Edit schedules →</a>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={s.label} className="card card-hover p-5 flex items-center justify-between animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div>
              <p className="text-xs text-[#8b93a7] font-medium uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-bold mt-1.5" style={{ color: s.text }}>{s.value}</p>
            </div>
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${s.ring} flex items-center justify-center text-lg shadow-lg`} style={{ opacity: 0.9 }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Weekly activity */}
      <div className="card p-6 mb-8 animate-fade-up" style={{ animationDelay: "0.08s" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-white">Last 7 days · batches dropped off</h2>
          <span className="text-xs text-[#5d6577]">{batches.length} total · {completedToday} picked up today</span>
        </div>
        <div className="flex items-end gap-3 h-28">
          {bars.map((b) => (
            <div key={b.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[11px] font-semibold" style={{ color: b.today ? "#a5b4fc" : "#8b93a7" }}>{b.count}</span>
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${Math.max(b.h, 4)}%`,
                  background: b.today
                    ? "linear-gradient(180deg,#818cf8,#6d28d9)"
                    : b.count > 0
                      ? "linear-gradient(180deg,rgba(129,140,248,0.7),rgba(109,40,217,0.4))"
                      : "rgba(255,255,255,0.05)",
                  boxShadow: b.today ? "0 0 18px rgba(99,102,241,0.45)" : "none",
                }}
              />
              <span className={`text-[10px] font-semibold ${b.today ? "text-accent-300" : "text-[#5d6577]"}`}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Queue */}
      <div className="mb-4 flex flex-wrap items-center gap-2 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {VIEWS.map((v) => {
          const on = view === v.key;
          return (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                on ? "text-white border-accent-400/40 shadow-lg shadow-accent-600/20" : "text-[#8b93a7] border-white/10 hover:text-white hover:bg-white/[0.04]"
              }`}
              style={on ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)" } : { background: "rgba(255,255,255,0.02)" }}
            >
              {v.label}
            </button>
          );
        })}
        {blocks.length > 1 && (
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={() => setBlockFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${blockFilter === "ALL" ? "bg-white/10 text-white" : "text-[#5d6577] hover:text-white"}`}>
              All blocks
            </button>
            {blocks.map((bl) => (
              <button key={bl} onClick={() => setBlockFilter(bl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${blockFilter === bl ? "bg-white/10 text-white" : "text-[#5d6577] hover:text-white"}`}>
                {bl}
              </button>
            ))}
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="card p-14 text-center">
          <p className="text-5xl mb-4 opacity-80">🧺</p>
          <p className="text-lg font-semibold text-white">Nothing here right now</p>
          <p className="muted text-sm mt-1">New drop-offs will appear the moment a student submits a batch.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((b, i) => {
            const c = STAGE_COLOR[b.status];
            const idx = ORDER.indexOf(b.status);
            const options = ORDER.slice(idx + 1);
            const hasOpenIssue = b.issueReported && !b.issueResolved;
            const isResolving = resolvingId === b._id;
            return (
              <div
                key={b._id}
                className="card p-4 sm:p-5 animate-fade-up"
                style={{
                  animationDelay: `${Math.min(i, 6) * 0.03}s`,
                  borderLeft: hasOpenIssue ? "3px solid rgba(251,113,133,0.8)" : b.status === "ready" ? "3px solid rgba(52,211,153,0.7)" : "3px solid transparent",
                }}
              >
                <div className="flex flex-wrap items-start gap-4">
                  {/* Left: identity + description */}
                  <div className="flex-1 min-w-[220px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge bg-accent-500/15 border border-accent-400/25 text-accent-300 font-mono text-[10px]">
                        #{String(b._id).slice(-6).toUpperCase()}
                      </span>
                      <span className="badge bg-white/[0.05] border border-white/10 text-[#b9c0d0] text-[10px]">{b.hostelBlock}</span>
                      <span className="text-xs font-semibold text-white/85">{b.ownerName || "—"}</span>
                      <span className="text-[10px] text-[#5d6577]">
                        {new Date(b.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                    {b.description && (
                      <p className="text-sm text-[#b9c0d0] mt-2.5 leading-snug">{b.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                      <span className="badge py-1" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.fg }}>
                        {ICONS[b.status]} {LABELS[b.status]}
                      </span>
                      <span className="text-[11px] text-[#5d6577]">
                        est. ready{" "}
                        <span className="text-white/70 font-medium">
                          {new Date(b.estimatedReady).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                      </span>
                      {b.issueResolved && (
                        <span className="badge bg-emerald-400/10 border border-emerald-400/25 text-emerald-300 text-[10px]">✅ issue resolved</span>
                      )}
                    </div>
                    {hasOpenIssue && (
                      <p className="text-xs text-rose-300/90 mt-2 bg-rose-400/[0.07] border border-rose-400/20 rounded-lg px-3 py-2">
                        ⚠️ {b.issueDescription}
                      </p>
                    )}
                    {b.issueResolved && b.issueResponse && (
                      <p className="text-xs text-emerald-300/80 mt-2 bg-emerald-400/[0.06] border border-emerald-400/15 rounded-lg px-3 py-2">
                        💬 {b.issueResponse}
                      </p>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0 w-full sm:w-auto">
                    {b.status !== "picked_up" && options.length > 0 && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                          value={nextSel[b._id] || options[0]}
                          className="field w-auto text-xs px-2.5 py-2 flex-1 sm:flex-none"
                          onChange={(e) => {
                            setNextSel((s) => ({ ...s, [b._id]: e.target.value }));
                            advance(b, e.target.value);
                          }}
                          disabled={busyId === b._id}
                        >
                          {options.map((s) => (
                            <option key={s} value={s} className="bg-[#0b0d15]">
                              → {LABELS[s]} {s === "picked_up" ? "🏠" : ""}
                            </option>
                          ))}
                        </select>
                        {busyId === b._id && <span className="w-4 h-4 rounded-full border-2 border-accent-400/30 border-t-accent-400 animate-spin shrink-0" />}
                      </div>
                    )}
                    {b.status === "picked_up" && (
                      <span className="badge text-[10px] py-1" style={{ background: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.2)" }}>
                        Completed 🏠
                      </span>
                    )}
                    {hasOpenIssue && (
                      <div className="w-full sm:w-auto">
                        {isResolving ? (
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              value={resolveText}
                              onChange={(e) => setResolveText(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && resolve(b)}
                              placeholder="Response to the student…"
                              className="field text-xs px-2.5 py-2 w-44"
                            />
                            <button
                              onClick={() => resolve(b)}
                              disabled={!resolveText.trim() || busyId === b._id}
                              className="btn-primary text-xs py-2 px-3 disabled:opacity-40"
                            >
                              Send
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => startResolve(b)} className="btn-ghost text-xs py-2 px-3 text-rose-300 hover:text-rose-200 border-rose-400/25 hover:bg-rose-500/10">
                            ⚠️ Resolve issue
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
