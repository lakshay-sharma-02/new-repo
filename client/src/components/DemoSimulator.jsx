import { useState, useEffect, useRef, useCallback } from "react";
import api from "../lib/api";

const SPEEDS = [
  { label: "1×", interval: 5000 },
  { label: "2×", interval: 2600 },
  { label: "4×", interval: 1300 },
];

export default function DemoSimulator() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [logs, setLogs] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const busyRef = useRef(false);

  const pushLog = useCallback((msg, color) => {
    const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => [{ t, msg, color }, ...prev].slice(0, 8));
  }, []);

  // One tick: asks the demo driver (mock mode) to advance a batch
  // exactly as the block's staff would from the ops console.
  const tick = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      const res = await api.post("/demo/advance");
      const r = res.data || {};
      if (r.ok) {
        pushLog(r.message || "batch advanced", "#34d399");
      } else if (r.reason === "no_schedule") {
        setDisabled(true);
        setPlaying(false);
        pushLog("no published schedule for your block", "#fbbf24");
      }
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 401 || err.response?.status === 404) {
        setDisabled(true);
        setPlaying(false);
      }
    } finally {
      busyRef.current = false;
    }
  }, [pushLog]);

  useEffect(() => {
    if (!playing || disabled) return;
    const interval = SPEEDS[speedIdx].interval;
    // Fire immediately once for responsiveness, then on cadence
    const first = setTimeout(tick, 700);
    const iv = setInterval(tick, interval);
    return () => { clearTimeout(first); clearInterval(iv); };
  }, [playing, speedIdx, disabled, tick]);

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-3">
      {open && (
        <div className="card w-[340px] max-w-[calc(100vw-2.5rem)] p-4 shadow-2xl shadow-black/50 animate-scale-in" style={{ background: "rgba(10,12,20,0.92)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`relative flex w-2.5 h-2.5`}>
                <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${playing ? "animate-ping opacity-60" : "opacity-0"}`} />
                <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-emerald-400" />
              </span>
              <p className="text-sm font-semibold text-white">Live demo</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#5d6577] hover:text-white text-lg leading-none cursor-pointer">×</button>
          </div>

          <p className="text-[11px] text-[#8b93a7] mb-3 leading-relaxed">
            Driving your block's laundry service in real time — batches advance just like staff would from the ops console.
          </p>

          {/* Controls */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => { setPlaying((p) => !p); setDisabled(false); }}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border"
              style={{
                background: playing ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                borderColor: playing ? "rgba(129,140,248,0.4)" : "rgba(255,255,255,0.1)",
                color: playing ? "#c7d2fe" : "#8b93a7",
              }}
            >
              {playing ? "❚❚ Pause" : "▶ Play"}
            </button>
            <div className="flex rounded-lg overflow-hidden border border-white/10">
              {SPEEDS.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setSpeedIdx(i)}
                  className={`px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    i === speedIdx ? "bg-accent-500 text-white" : "bg-white/[0.04] text-[#8b93a7] hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {disabled && (
            <p className="text-[11px] text-amber-300/90 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 mb-2">
              Your block doesn't have a published schedule yet — the driver can't create new batches until staff publish one.
            </p>
          )}

          {/* Activity feed */}
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {logs.length === 0 && (
              <p className="text-[11px] text-[#5d6577] text-center py-3">Waiting for activity…</p>
            )}
            {logs.map((l, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] animate-fade-in">
                <span className="text-[#5d6577] font-mono shrink-0 pt-0.5">{l.t}</span>
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: l.color }} />
                <span className="text-[#b9c0d0] truncate">{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle pill */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-full glass-nav border border-white/10 shadow-xl shadow-black/40 hover:border-accent-400/40 transition-all cursor-pointer"
      >
        <span className={`w-2 h-2 rounded-full ${playing ? "bg-emerald-400 animate-pulse-ring" : "bg-white/40"}`} />
        <span className="text-xs font-semibold text-white/90">
          {open ? "Demo simulator" : playing ? "Simulating live…" : "Demo simulator"}
        </span>
        <span className={`text-[10px] text-white/60 transition-transform ${open ? "rotate-180" : ""}`}>▲</span>
      </button>
    </div>
  );
}
