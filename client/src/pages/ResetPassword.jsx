import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "../components/Toast";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!token) {
      setError("This reset link is missing its token");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success("Password updated — sign in with your new password");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Could not reset your password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-9">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-fuchsia-500 items-center justify-center text-3xl mb-5 shadow-2xl shadow-accent-600/40">
            🔐
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Choose a new password</h1>
          <p className="muted text-sm mt-1.5">At least 8 characters, with a letter and a number</p>
        </div>

        <div className="card p-7 sm:p-8 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm text-rose-200 flex items-center gap-2.5 border"
                style={{ background: "rgba(251,113,133,0.08)", borderColor: "rgba(251,113,133,0.25)" }}
              >
                <span>⚠️</span> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#b9c0d0] mb-2">New password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field"
                placeholder="Min 8 characters"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Confirm password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="field"
                placeholder="Repeat it"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm muted mt-7">
          <Link to="/login" className="text-accent-300 hover:text-white font-medium">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
