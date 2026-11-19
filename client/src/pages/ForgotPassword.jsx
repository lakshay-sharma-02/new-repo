import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "../components/Toast";

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setSent(true);
      setResetToken(res.data.resetToken || "");
      toast.success("If that email exists, a reset link is on its way");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not send the reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <Link to="/login" className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-medium text-[#475569] hover:text-slate-900 transition-colors">
        ← Back to sign in
      </Link>
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-9">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-sky-500 items-center justify-center text-3xl mb-5 shadow-2xl shadow-accent-600/40">
            🔑
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reset your password</h1>
          <p className="muted text-sm mt-1.5">
            We&apos;ll email you a link to choose a new one
          </p>
        </div>

        <div className="card p-7 sm:p-8 shadow-2xl shadow-slate-900/10">
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-[#475569]">
                If <span className="text-slate-900">{email}</span> is registered, a reset link has
                been sent.
              </p>
              {resetToken && (
                <Link
                  to={`/reset-password?token=${resetToken}`}
                  className="btn-primary inline-flex w-full justify-center py-3"
                >
                  Continue to reset (dev)
                </Link>
              )}
              <Link to="/login" className="block text-xs text-accent-600 hover:text-slate-900">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field"
                  placeholder="you@hostel.edu"
                  autoComplete="email"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm muted mt-7">
          Remembered it?{" "}
          <Link to="/login" className="text-accent-600 hover:text-slate-900 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
