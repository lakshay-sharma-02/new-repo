import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const ROLE_LABELS = {
  student: "Student",
  staff: "Laundry Staff",
  warden: "Warden",
};

function PasswordStrength({ password }) {
  const checks = [
    { label: "At least 6 characters", test: password.length >= 6 },
    { label: "Contains a number", test: /\d/.test(password) },
    { label: "Contains a symbol", test: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    { label: "Mixed case", test: /[a-z]/.test(password) && /[A-Z]/.test(password) },
  ];
  const passed = checks.filter((c) => c.test).length;
  const pct = (passed / checks.length) * 100;

  const color = passed < 2 ? "#fb7185" : passed < 3 ? "#fbbf24" : passed < 4 ? "#60a5fa" : "#34d399";

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-[#5d6577] font-medium">Password strength</span>
        <span className="text-[11px] font-medium" style={{ color }}>
          {passed < 2 ? "Weak" : passed < 3 ? "Fair" : passed < 4 ? "Good" : "Strong"}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-1.5 mt-2.5">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <span className={`text-xs transition-colors`}>{c.test ? "✅" : "○"}</span>
            <span className={`text-xs ${c.test ? "text-emerald-300" : "text-[#5d6577]"}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState(user?.name || "");
  const [hostelBlock, setHostelBlock] = useState(user?.hostelBlock || "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [batches, setBatches] = useState([]);
  const [payments, setPayments] = useState([]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const [bRes, pRes] = await Promise.all([api.get("/api/batches"), api.get("/api/payments")]);
      setBatches(bRes.data || []);
      setPayments(pRes.data || []);
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch(`/api/users/${user._id}/profile`, { name, hostelBlock });
      toast.success("Profile updated");
      // Refresh auth context with updated user data
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setPwLoading(true);
    try {
      await api.patch(`/api/users/${user._id}/password`, { currentPassword, newPassword });
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-end justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Profile</h1>
          <p className="muted mt-2">Manage your account details, password, and review your activity.</p>
        </div>
        <button onClick={logout} className="btn-ghost py-2 px-4 text-xs text-rose-300 border-rose-400/25 hover:bg-rose-500/10">
          Log out
        </button>
      </div>

      {/* Profile info */}
      <div className="card p-6 mb-8 animate-fade-up" style={{ animationDelay: "0.04s" }}>
        <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2.5">👤 Profile information</h2>

        <form onSubmit={handleProfileSave} className="grid sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Full name</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Email</label>
            <input type="email" className="field bg-white/[0.02] cursor-default" value={user.email} disabled />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Role</label>
            <input className="field bg-white/[0.02] cursor-default" value={ROLE_LABELS[user.role] || user.role} disabled />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Hostel block</label>
            <input className="field" value={hostelBlock} onChange={(e) => setHostelBlock(e.target.value)} placeholder="e.g. B6" />
            <p className="text-[11px] text-[#5d6577] mt-1.5">Changes here also affect your batch schedule display.</p>
          </div>

          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary py-2.5 px-6 text-[13px]">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 rounded-full border-2 border-white/25 border-t-white animate-spin" /> Saving…
                </span>
              ) : "Save changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6 mb-8 animate-fade-up" style={{ animationDelay: "0.08s" }}>
        <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2.5">🔐 Change password</h2>

        <form onSubmit={handlePasswordChange} className="grid sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Current password</label>
            <input
              type="password"
              className="field"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b9c0d0] mb-2">New password</label>
            <input
              type="password"
              className="field"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              autoComplete="new-password"
              required
            />
            <PasswordStrength password={newPassword} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Confirm new password</label>
            <input
              type="password"
              className="field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-rose-300 mt-1.5">⚠ Passwords don't match</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <button type="submit" disabled={pwLoading || !currentPassword || !newPassword || newPassword !== confirmPassword} className="btn-primary py-2.5 px-6 text-[13px]">
              {pwLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 rounded-full border-2 border-white/25 border-t-white animate-spin" /> Updating…
                </span>
              ) : "Change password"}
            </button>
          </div>
        </form>
      </div>

      {/* Order history */}
      <div className="card p-6 mb-8 animate-fade-up" style={{ animationDelay: "0.12s" }}>
        <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2.5">📦 Order history</h2>
        <p className="text-[11px] text-[#5d6577] mb-4">
          {batches.length} batch{batches.length !== 1 ? "es" : ""} total
        </p>

        {batches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-2xl mb-2 opacity-60">🧺</p>
            <p className="text-sm text-[#8b93a7] mb-3">No batches yet</p>
            <Link to="/submit" className="btn-ghost inline-flex py-2 px-4 text-xs">Submit your first batch</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {batches.slice(0, 8).map((b, i) => (
              <Link
                key={b._id}
                to={`/track/${b._id}`}
                className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-accent-400/25 hover:bg-white/[0.04] transition-all animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-lg shrink-0">{b.status === "picked_up" ? "🏠" : b.status === "ready" ? "🎉" : "⏳"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{b.description || "(no description)"}</p>
                    <p className="text-[10px] text-[#5d6577] font-mono">#{String(b._id).slice(-5).toUpperCase()}</p>
                  </div>
                </div>
                <span className={`badge text-[10px] py-0.5 ${
                  b.status === "picked_up" ? "bg-slate-400/10 text-slate-300 border-slate-400/25" :
                  b.status === "ready" ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/25" :
                  "bg-accent-500/10 text-accent-300 border-accent-400/25"
                }`}>
                  {b.status.replace("_", " ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Payment history quick links */}
      <div className="card p-6 animate-fade-up" style={{ animationDelay: "0.16s" }}>
        <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2.5">💳 Payment history</h2>
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-2xl mb-2 opacity-60">💳</p>
            <p className="text-sm text-[#8b93a7] mb-3">No payments yet</p>
            <Link to="/payments" className="btn-ghost inline-flex py-2 px-4 text-xs">View payments</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.slice(0, 5).map((p, i) => (
              <Link
                key={p._id}
                to={`/payments/${p._id}`}
                className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-accent-400/25 hover:bg-white/[0.04] transition-all animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-lg shrink-0">{p.status === "success" ? "✅" : p.status === "failed" ? "✕" : "⏳"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate font-mono">
                      #{String(p._id).slice(-6).toUpperCase()}
                    </p>
                    <p className="text-[10px] text-[#5d6577]">
                      {new Date(p.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <span className="text-right shrink-0">
                  <p className="font-semibold text-white">₹{(p.amount || 0).toLocaleString("en-IN")}</p>
                  <span className={`badge text-[10px] py-0.5 ${
                    p.status === "success" ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/25" :
                    p.status === "failed" ? "bg-rose-400/10 text-rose-300 border-rose-400/25" :
                    "bg-amber-400/10 text-amber-300 border-amber-400/25"
                  }`}>{p.status}</span>
                </span>
              </Link>
            ))}
            {payments.length > 5 && (
              <Link to="/payments" className="block text-center text-xs text-accent-300 hover:text-white mt-2 font-medium">
                View all {payments.length} payments →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
