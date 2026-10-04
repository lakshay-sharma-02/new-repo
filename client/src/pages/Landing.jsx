import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

/* ------------------------------------------------ */
/* Small helpers                                    */
/* ------------------------------------------------ */

const STAGES = [
  { key: "submitted", label: "Submitted", icon: "📋" },
  { key: "received", label: "Received", icon: "✅" },
  { key: "washing", label: "Washing", icon: "🫧" },
  { key: "drying", label: "Drying", icon: "☀️" },
  { key: "folding", label: "Folding", icon: "👕" },
  { key: "ready", label: "Ready!", icon: "🎉" },
];

function MiniTracker({ stage }) {
  const idx = STAGES.findIndex((s) => s.key === stage);
  return (
    <div className="flex items-center gap-1">
      {STAGES.map((s, i) => (
        <div key={s.key} className="flex-1 h-1.5 rounded-full relative overflow-hidden"
          style={{ background: i <= idx ? "linear-gradient(90deg,#6366f1,#a855f7)" : "rgba(255,255,255,0.09)" }}>
          {i === idx && <div className="absolute inset-0 bg-white/25 animate-glow" />}
        </div>
      ))}
    </div>
  );
}

function useCycle() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 2200);
    return () => clearInterval(t);
  }, []);
  return stage;
}

function HeroMockup() {
  const stage = useCycle();
  const current = STAGES[stage];

  return (
    <div className="relative w-full max-w-md mx-auto animate-float" style={{ animationDuration: "9s" }}>
      {/* Glow */}
      <div className="absolute -inset-10 rounded-full bg-accent-500/25 blur-3xl animate-glow" />

      {/* Device frame */}
      <div className="relative card p-2 shadow-2xl shadow-accent-600/20">
        <div className="rounded-2xl overflow-hidden bg-[#0a0c14]/90 border border-white/5 p-5">
          {/* window dots */}
          <div className="flex items-center gap-1.5 mb-5 px-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80" />
          </div>

          {/* Fake navbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧺</span>
              <span className="text-sm font-bold text-white/90">Laundry Roulette</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-400 to-fuchsia-500 flex items-center justify-center text-[10px] font-bold text-white">A</div>
              <div className="w-6 h-6 rounded-full bg-[#22d3ee]/15 border border-cyan-400/30 flex items-center justify-center text-[10px] animate-pulse-ring">▶</div>
            </div>
          </div>

          {/* Batch card */}
          <div className="card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="badge bg-accent-500/15 text-accent-300 border border-accent-500/25">
                  {current.icon} {current.label}
                </span>
                <span className="badge bg-white/5 text-[#8b93a7] border border-white/10">B6 · Mon batch</span>
              </div>
              <span className="text-xs text-[#5d6577] font-medium">now</span>
            </div>

            <MiniTracker stage={current.key} />

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs text-[#5d6577]">Estimated ready</p>
                <p className="text-sm font-semibold text-white/85">Wed · 4:00 PM</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#5d6577]">Items</p>
                <p className="text-sm font-semibold text-white/85">2 shirts, 3 tees</p>
              </div>
            </div>
          </div>

          {/* Live ticker */}
          <div className="mt-4 overflow-hidden">
            <div className="flex gap-8 whitespace-nowrap animate-ticker" style={{ width: "max-content" }}>
              {[0, 1].map((k) => (
                <div key={k} className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-300/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-glow" />
                    Batch #A-104 → {current.label}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-[#8b93a7]">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-400" /> Batch #A-103 → drying
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-[#8b93a7]">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Batch #A-102 → ready
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: "🛰️",
    title: "Real-time batch tracking",
    desc: "Follow your laundry through 7 live stages — submitted, washing, drying, ready — the way you track a food delivery.",
  },
  {
    icon: "🗓️",
    title: "Per-block schedules",
    desc: "Laundry staff publish each block's laundry days, windows, and turnaround once — the whole block runs on it.",
  },
  {
    icon: "🔔",
    title: "Live notifications",
    desc: "A notification center pings you the moment a batch moves — especially when it's ready for pickup.",
  },
  {
    icon: "🧾",
    title: "Digital submission record",
    desc: "Every batch gets an ID, a timestamp, and an item log — real evidence when something goes wrong.",
  },
  {
    icon: "🛡️",
    title: "Structured dispute reports",
    desc: "Spot a stain or a missing shirt? File a structured report tied to your batch instead of memory-vs-memory.",
  },
  {
    icon: "🖥️",
    title: "Staff ops console",
    desc: "Laundry staff get a live ops console — the full queue per block, one-click stage advances, and issue resolution.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Staff publish the schedule",
    desc: "The laundry service sets each block's laundry days, drop-off & pickup windows, and turnaround.",
  },
  {
    n: "02",
    title: "Submit a batch",
    desc: "Drop clothes off, log it in seconds — get an instant confirmation with an ETA based on the schedule.",
  },
  {
    n: "03",
    title: "Track & collect",
    desc: "Watch it move through every stage. Get pinged when it's ready, confirm pickup, done.",
  },
];

function FeatureIcon({ children }) {
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-fuchsia-500/20 border border-accent-400/20 flex items-center justify-center text-2xl">
      {children}
    </div>
  );
}

/* ------------------------------------------------ */
/* Landing page                                     */
/* ------------------------------------------------ */

export default function Landing() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [demoBusy, setDemoBusy] = useState(false);
  const howRef = useRef(null);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const tryDemo = async () => {
    setDemoBusy(true);
    try {
      await login("aarav@hostel.edu", "demo123");
      toast.success("Logged into the live demo as Aarav (B6)");
    } catch {
      toast.error("Demo account unavailable — try the demo data on sign-up");
      navigate("/register");
    } finally {
      setDemoBusy(false);
    }
  };

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="relative">
      {/* ======= NAV ======= */}
      <header className="sticky top-0 z-50 glass-nav border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🧺</span>
            <span className="font-bold tracking-tight text-[15px]">
              Laundry<span className="grad-text">Roulette</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#8b93a7]">
            <button onClick={() => scrollTo(howRef)} className="hover:text-white transition-colors cursor-pointer">How it works</button>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost py-2 px-4 hidden sm:inline-flex">Sign in</Link>
            <button onClick={tryDemo} disabled={demoBusy} className="btn-primary py-2 px-5">
              {demoBusy ? "Loading…" : "▶ Try live demo"}
            </button>
          </div>
        </div>
      </header>

      {/* ======= HERO ======= */}
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-10 md:pt-28">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 badge bg-white/5 border border-white/10 text-[#a7b0c2] mb-7 px-3 py-1.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-glow" />
              Final-year capstone · working live demo
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-white">
              Never wonder
              <br />
              <span className="grad-text">where your laundry</span>
              <br />
              is again.
            </h1>

            <p className="mt-6 text-lg text-[#8b93a7] max-w-md leading-relaxed">
              Hostel laundry is a black hole — drop it off, cross your fingers, go check three times.
              <span className="text-white/80"> Laundry Roulette turns it into a live tracker.</span>
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button onClick={tryDemo} disabled={demoBusy} className="btn-primary px-7 py-3.5 text-[15px]">
                {demoBusy ? "Spinning up…" : "Try the live demo →"}
              </button>
              <button
                onClick={() => scrollTo(howRef)}
                className="btn-ghost px-6 py-3.5 text-[15px]"
              >
                See how it works
              </button>
            </div>

            {/* mini stat row */}
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-sm">
              {[
                ["7", "live status stages"],
                ["~0", "wasted trips*"],
                ["100%", "hostel-agnostic"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="text-2xl font-bold text-white">{v}</p>
                  <p className="text-[11px] text-[#5d6577] mt-0.5 leading-snug">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right mockup */}
          <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* ======= HOW IT WORKS ======= */}
      <section ref={howRef} className="max-w-6xl mx-auto px-6 py-20 scroll-mt-20">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent-300 uppercase mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">From drop-off to pickup, in the open</h2>
          <p className="muted mt-3 max-w-xl mx-auto">Three steps. That's the entire product — everything else is polish.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.n} className="card card-hover p-7 relative overflow-hidden animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="absolute -top-8 -right-4 text-[110px] font-extrabold leading-none text-white/[0.035] select-none">{s.n}</div>
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent-500 to-fuchsia-500 flex items-center justify-center font-bold text-white mb-5 shadow-lg shadow-accent-600/30">
                  {s.n}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-[#8b93a7] leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======= FEATURES ======= */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-16">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent-300 uppercase mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Built for the messiest part of hostel life</h2>
          <p className="muted mt-3 max-w-xl mx-auto">Every feature maps to a real failure point we found by watching actual laundry cycles.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="card card-hover p-6 animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <FeatureIcon>{f.icon}</FeatureIcon>
              <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-[#8b93a7] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======= CTA ======= */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="card relative overflow-hidden p-10 sm:p-14 text-center">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-accent-600/25 blur-3xl rounded-full pointer-events-none" />
          <div className="relative">
            <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Stop guessing. <span className="grad-text">Start tracking.</span>
            </p>
            <p className="muted mt-3 max-w-md mx-auto">
              Log in with the demo account or create your own — set your hostel schedule and submit a batch in under a minute.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button onClick={tryDemo} disabled={demoBusy} className="btn-primary px-7 py-3">
                {demoBusy ? "Loading…" : "Enter live demo"}
              </button>
              <Link to="/register" className="btn-ghost px-7 py-3">Create account</Link>
            </div>
            <p className="mt-5 text-xs text-[#5d6577] font-mono leading-relaxed">
              demo logins → aarav@hostel.edu / demo123 (student)<br />
              ramesh@hostel.edu / demo123 (staff ops console)
            </p>
          </div>
        </div>
      </section>

      {/* ======= FOOTER ======= */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[#8b93a7]">
            <span className="text-lg">🧺</span> Laundry Roulette
          </div>
          <p className="text-xs text-[#5d6577]">Built as a final-year capstone · React + Express</p>
        </div>
      </footer>
    </div>
  );
}
