import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back 👋");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("demo123");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <Link to="/" className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-medium text-[#475569] hover:text-slate-900 transition-colors">
        ← Back to home
      </Link>
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-9">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-sky-500 items-center justify-center text-3xl mb-5 shadow-2xl shadow-accent-600/40">
            🧺
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="muted text-sm mt-1.5">Sign in to track your laundry</p>
        </div>

        {/* Card */}
        <div className="card p-7 sm:p-8 shadow-2xl shadow-slate-900/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm text-rose-700 flex items-center gap-2.5 animate-scale-in border"
                style={{ background: "rgba(251,113,133,0.08)", borderColor: "rgba(251,113,133,0.25)" }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="field" placeholder="you@hostel.edu" autoComplete="email" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="field" placeholder="••••••••" autoComplete="current-password" />
            </div>

            <div className="flex justify-end -mt-2">
              <Link to="/forgot-password" className="text-xs text-accent-600 hover:text-slate-900 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                  Signing in…
                </span>
              ) : "Sign in"}
            </button>
          </form>

          {/* Demo quick access */}
          <div className="divider my-6" />
          <p className="text-center text-[11px] uppercase tracking-wider text-[#64748b] font-semibold mb-3">Try a demo account</p>
          <p className="text-[10px] text-[#64748b] font-semibold mb-2 text-center">STUDENT</p>
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <button onClick={() => quickFill("aarav@hostel.edu")}
              className="py-2.5 rounded-xl text-xs font-medium text-[#1d4ed8] border border-accent-400/25 bg-accent-500/10 hover:bg-accent-500/20 transition-all cursor-pointer">
              Aarav · block B6
            </button>
            <button onClick={() => quickFill("priya@hostel.edu")}
              className="py-2.5 rounded-xl text-xs font-medium text-[#4338ca] border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 transition-all cursor-pointer">
              Priya · block C3
            </button>
          </div>
          <p className="text-[10px] text-[#64748b] font-semibold mb-2 text-center">LAUNDRY STAFF · WARDEN</p>
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={() => quickFill("ramesh@hostel.edu")}
              className="py-2.5 rounded-xl text-xs font-medium text-emerald-700 border border-emerald-400/25 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all cursor-pointer">
              Ramesh · staff (B6)
            </button>
            <button onClick={() => quickFill("meera@hostel.edu")}
              className="py-2.5 rounded-xl text-xs font-medium text-amber-700 border border-amber-400/25 bg-amber-500/10 hover:bg-amber-500/20 transition-all cursor-pointer">
              Meera · warden
            </button>
          </div>
          <p className="text-center text-[11px] text-[#64748b] mt-3 font-mono">all passwords: demo123 · staff land on the ops console</p>
        </div>

        <p className="text-center text-sm muted mt-7">
          New here?{" "}
          <Link to="/register" className="text-accent-600 hover:text-slate-900 font-medium transition-colors">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
