import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hostelBlock, setHostelBlock] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password, hostelBlock);
      toast.success("Account created — welcome! 🎉");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-9">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-fuchsia-500 items-center justify-center text-3xl mb-5 shadow-2xl shadow-accent-600/40">
            🧺
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
          <p className="muted text-sm mt-1.5">Start tracking in under a minute</p>
        </div>

        {/* Card */}
        <div className="card p-7 sm:p-8 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm text-rose-200 flex items-center gap-2.5 animate-scale-in border"
                style={{ background: "rgba(251,113,133,0.08)", borderColor: "rgba(251,113,133,0.25)" }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Full name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="field" placeholder="Your name" autoComplete="name" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="field" placeholder="you@hostel.edu" autoComplete="email" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="field" placeholder="Min 6 characters" autoComplete="new-password" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b9c0d0] mb-2">
                Hostel block <span className="text-[#5d6577] font-normal">(optional)</span>
              </label>
              <input type="text" value={hostelBlock} onChange={(e) => setHostelBlock(e.target.value)}
                className="field" placeholder="e.g. B6, Block C" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                  Creating account…
                </span>
              ) : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm muted mt-7">
          Already have an account?{" "}
          <Link to="/login" className="text-accent-300 hover:text-white font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
