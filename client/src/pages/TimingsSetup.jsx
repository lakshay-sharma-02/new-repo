import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EMPTY = {
  laundryDays: [],
  dropoffStart: "09:00",
  dropoffEnd: "12:00",
  pickupStart: "16:00",
  pickupEnd: "18:00",
  cutoffTime: "12:00",
  turnaroundDays: 2,
};

export default function TimingsSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const isStaff = user?.role === "staff" || user?.role === "warden";
  const isWarden = user?.role === "warden";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [readOnly, setReadOnly] = useState(null); // published schedule (student view)
  const [allSchedules, setAllSchedules] = useState([]); // warden picker

  // Editor state
  const [hostelBlock, setHostelBlock] = useState(""); // "__new" when creating a fresh block
  const [newBlockInput, setNewBlockInput] = useState("");
  const [laundryDays, setLaundryDays] = useState([]);
  const [dropoffStart, setDropoffStart] = useState(EMPTY.dropoffStart);
  const [dropoffEnd, setDropoffEnd] = useState(EMPTY.dropoffEnd);
  const [pickupStart, setPickupStart] = useState(EMPTY.pickupStart);
  const [pickupEnd, setPickupEnd] = useState(EMPTY.pickupEnd);
  const [cutoffTime, setCutoffTime] = useState(EMPTY.cutoffTime);
  const [turnaroundDays, setTurnaroundDays] = useState(2);

  const loadFor = useCallback(async (block) => {
    try {
      const res = await api.get("/timings/all");
      const list = res.data || [];
      setAllSchedules(list);
      const found = list.find((s) => String(s.hostelBlock).toUpperCase() === String(block).toUpperCase()) || null;
      if (found) {
        setHostelBlock(found.hostelBlock);
        setLaundryDays(found.laundryDays || []);
        setDropoffStart(found.dropoffStart);
        setDropoffEnd(found.dropoffEnd);
        setPickupStart(found.pickupStart);
        setPickupEnd(found.pickupEnd);
        setCutoffTime(found.cutoffTime);
        setTurnaroundDays(found.turnaroundDays);
      } else if (block) {
        // Fresh block — blank form (e.g. staff block with no schedule yet)
        setHostelBlock(block);
        setLaundryDays([]);
        setDropoffStart(EMPTY.dropoffStart);
        setDropoffEnd(EMPTY.dropoffEnd);
        setPickupStart(EMPTY.pickupStart);
        setPickupEnd(EMPTY.pickupEnd);
        setCutoffTime(EMPTY.cutoffTime);
        setTurnaroundDays(EMPTY.turnaroundDays);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (!isStaff) {
          // Students: read the schedule published for their block
          const res = await api.get("/timings");
          setReadOnly(res.data);
        } else if (isWarden) {
          setAllSchedules((await api.get("/timings/all")).data || []);
        } else {
          // Staff: their own block's schedule
          await loadFor(user?.hostelBlock);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [isStaff, isWarden, user, loadFor]);

  const toggleDay = (d) =>
    setLaundryDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const blockToSave = hostelBlock === "__new" ? newBlockInput.trim().toUpperCase() : String(hostelBlock || "").trim().toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!blockToSave) { setError(hostelBlock === "__new" ? "Enter the new block name" : "Pick a hostel block"); return; }
    if (laundryDays.length === 0) { setError("Pick at least one laundry day"); return; }
    setSaving(true);
    try {
      await api.post("/timings", {
        hostelBlock: blockToSave,
        laundryDays, dropoffStart, dropoffEnd,
        pickupStart, pickupEnd, cutoffTime, turnaroundDays,
      });
      toast.success(`Schedule for ${blockToSave} published — students can now submit`);
      if (isWarden) await loadFor(blockToSave);
      else navigate("/staff", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-5">
        <div className="skeleton h-10 w-64" />
        <div className="skeleton h-44" />
        <div className="skeleton h-40" />
      </div>
    );
  }

  /* ----- Students: read-only view of their block's published schedule ----- */
  if (!isStaff) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Your block's laundry schedule</h1>
          <p className="muted mt-2">Published by the laundry service — submissions open on these days.</p>
        </div>
        {!readOnly ? (
          <div className="card p-10 text-center">
            <p className="text-4xl mb-4">🗓️</p>
            <p className="text-lg font-semibold text-white">No schedule published yet</p>
            <p className="muted text-sm mt-1.5 max-w-sm mx-auto">
              The laundry service for block {user?.hostelBlock} hasn't shared its days yet. You'll be able to submit as soon as they do.
            </p>
          </div>
        ) : (
          <div className="card p-6 animate-fade-up" style={{ animationDelay: "0.05s" }}>
            <div className="flex items-center justify-between mb-6">
              <span className="badge bg-accent-500/15 border border-accent-400/30 text-accent-300">{readOnly.hostelBlock}</span>
              <span className="badge bg-emerald-400/10 border border-emerald-400/25 text-emerald-300 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-glow mr-1.5 inline-block" /> live schedule
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Laundry days", readOnly.laundryDays.join(" · ")],
                ["Drop-off window", `${readOnly.dropoffStart} – ${readOnly.dropoffEnd}`],
                ["Pickup window", `${readOnly.pickupStart} – ${readOnly.pickupEnd}`],
                ["Submission cut-off", readOnly.cutoffTime],
              ].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#5d6577] font-semibold">{l}</p>
                  <p className="text-sm font-bold text-white mt-1">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-accent-500/[0.06] border border-accent-400/20 px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-[#b9c0d0]">Expected turnaround</p>
              <span className="badge text-white" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                ~{readOnly.turnaroundDays} day{readOnly.turnaroundDays !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-[11px] text-[#5d6577] mt-5">
              Schedule changes are managed by the laundry staff — ping them if the days look off.
            </p>
          </div>
        )}
      </div>
    );
  }

  /* ----- Staff / warden: schedule publisher ----- */
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 animate-fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Publish block schedule</h1>
        <p className="muted mt-2">
          {isWarden
            ? "Pick a block and set its laundry days, windows, and turnaround. Publishing unlocks submissions for that block."
            : "This is the schedule your block runs on — students see it and submit only on these days."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm text-rose-200 border animate-scale-in"
            style={{ background: "rgba(251,113,133,0.08)", borderColor: "rgba(251,113,133,0.25)" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Block picker */}
        <div className="card p-6 space-y-6 animate-fade-up" style={{ animationDelay: "0.04s" }}>
          {isWarden ? (
            <div>
              <label className="block text-sm font-medium text-[#b9c0d0] mb-2">🏠 Hostel block</label>
              <select
                className="field"
                value={hostelBlock || ""}
                onChange={(e) => { setHostelBlock(e.target.value); loadFor(e.target.value); }}
              >
                <option value="" className="bg-[#0b0d15]">Select a block…</option>
                {allSchedules.map((s) => (
                  <option key={s._id} value={s.hostelBlock} className="bg-[#0b0d15]">{s.hostelBlock} · published</option>
                ))}
                <option value="__new" className="bg-[#0b0d15]">＋ New block…</option>
              </select>
              {hostelBlock === "__new" && (
                <input
                  className="field mt-3"
                  placeholder="e.g. A2"
                  value={newBlockInput}
                  onChange={(e) => setNewBlockInput(e.target.value)}
                />
              )}
            </div>
          ) : (
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#5d6577] font-semibold mb-2">🏠 Your block</label>
              <div className="badge text-white text-sm px-4 py-2.5" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                {user?.hostelBlock || "—"}
              </div>
              <p className="text-[11px] text-[#5d6577] mt-2">Block staff manage their own block's schedule.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#b9c0d0] mb-3">📅 Laundry days</label>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map((d) => {
                const on = laundryDays.includes(d);
                return (
                  <button key={d} type="button" onClick={() => toggleDay(d)}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      on
                        ? "text-white shadow-lg shadow-accent-600/30"
                        : "text-[#8b93a7] bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:text-white"
                    }`}
                    style={on ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)" } : {}}>
                    {d}
                  </button>
                );
              })}
            </div>
            {laundryDays.length === 0 && <p className="text-xs text-amber-300/80 mt-2">Select at least one day</p>}
          </div>
        </div>

        {/* Windows */}
        <div className="card p-6 space-y-5 animate-fade-up" style={{ animationDelay: "0.08s" }}>
          <h3 className="text-sm font-semibold text-white">⏰ Windows</h3>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#5d6577] font-semibold mb-2">Drop-off</label>
              <div className="flex items-center gap-2">
                <input type="time" className="field w-auto min-w-0 flex-1 px-3" value={dropoffStart} onChange={(e) => setDropoffStart(e.target.value)} />
                <span className="text-[#5d6577]">–</span>
                <input type="time" className="field w-auto min-w-0 flex-1 px-3" value={dropoffEnd} onChange={(e) => setDropoffEnd(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#5d6577] font-semibold mb-2">Pickup</label>
              <div className="flex items-center gap-2">
                <input type="time" className="field w-auto min-w-0 flex-1 px-3" value={pickupStart} onChange={(e) => setPickupStart(e.target.value)} />
                <span className="text-[#5d6577]">–</span>
                <input type="time" className="field w-auto min-w-0 flex-1 px-3" value={pickupEnd} onChange={(e) => setPickupEnd(e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#5d6577] font-semibold mb-2">
              Cut-off · latest same-day submission
            </label>
            <input type="time" className="field px-3 sm:w-40" value={cutoffTime} onChange={(e) => setCutoffTime(e.target.value)} />
          </div>
        </div>

        {/* Turnaround */}
        <div className="card p-6 animate-fade-up" style={{ animationDelay: "0.12s" }}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-medium text-[#b9c0d0]">🕐 Expected turnaround</span>
            <span className="badge text-white" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              ~{turnaroundDays} day{turnaroundDays !== 1 ? "s" : ""}
            </span>
          </div>
          <input
            type="range" min={1} max={14} value={turnaroundDays}
            onChange={(e) => setTurnaroundDays(Number(e.target.value))}
            className="w-full accent-accent-500 cursor-pointer"
            style={{ height: 6 }}
          />
          <div className="flex justify-between text-[10px] text-[#5d6577] mt-2">
            <span>1 day · express</span>
            <span>14 days</span>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3.5 text-[15px]">
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /> Publishing…
            </span>
          ) : blockToSave ? `Update ${blockToSave} schedule` : "Publish schedule"}
        </button>
      </form>
    </div>
  );
}
