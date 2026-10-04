import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import { useToast } from "../components/Toast";

const ROLES = ["student", "staff", "warden"];
const ROLE_LABELS = {
  student: "Student",
  staff: "Laundry Staff",
  warden: "Warden",
};

const STATUS_BADGE = {
  success: { cls: "bg-emerald-400/10 border-emerald-400/25 text-emerald-300", icon: "✅" },
  pending: { cls: "bg-amber-400/10 border-amber-400/25 text-amber-300", icon: "⏳" },
  failed: { cls: "bg-rose-400/10 border-rose-400/25 text-rose-300", icon: "✕" },
  refunded: { cls: "bg-slate-400/10 border-slate-400/25 text-slate-400", icon: "↩" },
};

const NAV_TABS = [
  { key: "analytics", label: "Analytics", icon: "📊" },
  { key: "payments", label: "Payments", icon: "💳" },
  { key: "services", label: "Services", icon: "🧺" },
  { key: "users", label: "Users", icon: "👥" },
];

export default function AdminPanel() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("analytics");

  // Analytics
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Payments
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Services
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [serviceForm, setServiceForm] = useState({ name: "", priceSmall: 120, priceMedium: 180, priceLarge: 250, priceXL: 350, description: "", isDefault: false });
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);

  // Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingUserRole, setEditingUserRole] = useState("");
  const [editingUserBlock, setEditingUserBlock] = useState("");

  // --- Analytics ---
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await api.get("/api/admin/analytics");
      setAnalytics(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [toast]);

  // --- Payments ---
  const fetchPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const res = await api.get("/api/payments/all/admin?limit=100");
      setPayments(res.data.payments || []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load payments");
    } finally {
      setPaymentsLoading(false);
    }
  }, [toast]);

  // --- Services ---
  const fetchServices = useCallback(async () => {
    setServicesLoading(true);
    try {
      const res = await api.get("/api/admin/services");
      setServices(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load services");
    } finally {
      setServicesLoading(false);
    }
  }, [toast]);

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingService) {
        await api.patch(`/api/admin/services/${editingService._id}`, serviceForm);
        toast.success("Service updated");
      } else {
        await api.post("/api/admin/services", serviceForm);
        toast.success("Service created");
      }
      setServiceForm({ name: "", priceSmall: 120, priceMedium: 180, priceLarge: 250, priceXL: 350, description: "", isDefault: false });
      setEditingService(null);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleServiceEdit = (s) => {
    setEditingService(s);
    setServiceForm({
      name: s.name,
      priceSmall: s.priceSmall,
      priceMedium: s.priceMedium,
      priceLarge: s.priceLarge,
      priceXL: s.priceXL,
      description: s.description || "",
      isDefault: !!s.isDefault,
    });
  };

  const handleServiceDelete = async (s) => {
    if (!window.confirm(`Delete service tier "${s.name}"?`)) return;
    try {
      await api.delete(`/api/admin/services/${s._id}`);
      toast.success("Service deleted");
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete service");
    }
  };

  // --- Users ---
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api.get("/api/admin/users");
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, [toast]);

  const handleUserEdit = (u) => {
    setEditingUser(u);
    setEditingUserRole(u.role);
    setEditingUserBlock(u.hostelBlock || "");
  };

  const handleUserSave = async () => {
    if (!editingUser) return;
    try {
      await api.patch(`/api/admin/users/${editingUser.id}`, {
        role: editingUserRole,
        hostelBlock: editingUserBlock || undefined,
      });
      toast.success("User updated");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update user");
    }
  };

  const handleUserDelete = async (u) => {
    if (!window.confirm(`Remove ${u.name} (${u.email})?`)) return;
    try {
      await api.delete(`/api/admin/users/${u.id}`);
      toast.success("User removed");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete user");
    }
  };

  const handleRefund = async (p) => {
    if (!window.confirm(`Refund payment #${String(p._id).slice(-6).toUpperCase()}?`)) return;
    try {
      await api.post(`/api/payments/${p._id}/refund`);
      toast.success("Payment refunded");
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to refund");
    }
  };

  const loadTab = (tab) => {
    setActiveTab(tab);
    if (tab === "analytics") fetchAnalytics();
    if (tab === "payments") fetchPayments();
    if (tab === "services") fetchServices();
    if (tab === "users") fetchUsers();
  };

  useEffect(() => {
    fetchAnalytics();
    fetchServices();
  }, [fetchAnalytics, fetchServices]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🛠️</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Admin panel</h1>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-2 mb-8 bg-white/[0.03] p-1.5 rounded-xl border border-white/5 overflow-x-auto">
        {NAV_TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => loadTab(tab.key)}
              className={`py-2.5 px-5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                active
                  ? "text-white border border-accent-400/25 shadow-lg shadow-accent-600/20"
                  : "text-[#8b93a7] hover:text-white hover:bg-white/[0.05]"
              }`}
              style={active ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)" } : {}}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===== Analytics Tab ===== */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {analyticsLoading ? (
            <div className="skeleton h-80" />
          ) : !analytics ? (
            <div className="text-center py-12 card">
              <p className="text-4xl mb-4">📉</p>
              <p className="text-[#8b93a7]">No analytics data yet</p>
            </div>
          ) : (
            <>
              {/* Stats cards */}
              <div className="grid sm:grid-cols-4 gap-4">
                {[
                  { label: "Total batches", value: analytics.totalBatches, icon: "🧺" },
                  { label: "Total revenue", value: `₹${(analytics.totalRevenue || 0).toLocaleString("en-IN")}`, icon: "💰" },
                  { label: "Avg. turnaround", value: `${analytics.avgProcessingHours}h`, icon: "⏱️" },
                  { label: "Open issues", value: analytics.batchesByStatus ? analytics.issuesByDay?.reduce((a, d) => a + d.count, 0) || 0 : 0, icon: "⚠️" },
                ].map((s, i) => (
                  <div key={s.label} className="card p-5 flex items-center justify-between animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div>
                      <p className="text-xs text-[#8b93a7] font-medium uppercase tracking-wider">{s.label}</p>
                      <p className="text-2xl font-bold text-white mt-1.5">{s.value}</p>
                    </div>
                    <span className="text-2xl">{s.icon}</span>
                  </div>
                ))}
              </div>

              {/* Batches by status */}
              <div className="card p-6 animate-fade-up" style={{ animationDelay: "0.08s" }}>
                <h3 className="text-sm font-semibold text-white mb-4">Batches by status</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(analytics.batchesByStatus || {}).map(([status, count]) => (
                    <div key={status} className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5 text-center">
                      <p className="text-2xl font-bold text-white">{count}</p>
                      <p className="text-xs text-[#5d6577] mt-0.5 capitalize">{status.replace("_", " ")}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Issues over last 7 days */}
              <div className="card p-6 animate-fade-up" style={{ animationDelay: "0.12s" }}>
                <h3 className="text-sm font-semibold text-white mb-4">Issues in last 7 days</h3>
                <div className="flex items-end gap-3 h-28">
                  {(analytics.issuesByDay || []).map((d) => {
                    const max = Math.max(...(analytics.issuesByDay || []).map((x) => x.count), 1);
                    const h = max > 0 ? (d.count / max) * 100 : 0;
                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-xs font-semibold text-white">{d.count}</span>
                        <div
                          className="w-full rounded-t-lg transition-all"
                          style={{
                            height: `${Math.max(h, 4)}%`,
                            background: d.count > 0 ? "linear-gradient(180deg,rgba(251,113,133,0.7),rgba(220,38,38,0.5))" : "rgba(255,255,255,0.05)",
                          }}
                        />
                        <span className="text-[9px] text-[#5d6577]">{new Date(d.date).toLocaleDateString(undefined, { weekday: "narrow" })}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Revenue by block */}
              <div className="card p-6 animate-fade-up" style={{ animationDelay: "0.16s" }}>
                <h3 className="text-sm font-semibold text-white mb-4">Revenue by block</h3>
                <div className="space-y-2.5">
                  {Object.entries(analytics.revenueByBlock || {})
                    .sort((a, b) => b[1] - a[1])
                    .map(([block, rev]) => (
                      <div key={block} className="flex items-center gap-3">
                        <span className="w-14 text-xs font-mono text-[#8b93a7]">{block}</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-accent-500 to-fuchsia-500"
                            style={{ width: `${Math.min((rev / (analytics.totalRevenue || 1)) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="w-24 text-right text-sm font-semibold text-white">₹{(rev || 0).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Users by role */}
              <div className="card p-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                <h3 className="text-sm font-semibold text-white mb-4">Users by role</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(analytics.usersByRole || {}).map(([role, count]) => (
                    <div key={role} className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3.5 text-center">
                      <p className="text-2xl font-bold text-white">{count}</p>
                      <p className="text-xs text-[#5d6577] mt-0.5">{ROLE_LABELS[role] || role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== Payments Tab ===== */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          {paymentsLoading ? (
            <div className="space-y-3">{Array(5).fill().map((_, i) => <div key={i} className="skeleton h-24" />)}</div>
          ) : payments.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-4">💳</p>
              <p className="text-[#8b93a7]">No payments recorded yet</p>
            </div>
          ) : (
            payments.map((p, i) => {
              const sb = STATUS_BADGE[p.status] || STATUS_BADGE.pending;
              return (
                <div key={p._id} className="card p-4 animate-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`badge ${sb.cls}`}>{sb.icon} {p.status}</span>
                      <span className="font-mono text-xs text-[#5d6577]">#{String(p._id).slice(-6).toUpperCase()}</span>
                    </div>
                    <span className="text-right">
                      <p className="font-bold text-white">₹{(p.amount || 0).toLocaleString("en-IN")}</p>
                      <p className="text-[10px] text-[#5d6577]">{new Date(p.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="text-[#b9c0d0]">
                        <b>{p.userName || "—"}</b> ({p.userEmail || "—"}) · Block {p.userBlock || "—"}
                      </p>
                      {p.batchDescription && <p className="text-xs text-[#5d6577] mt-0.5">Batch: {p.batchDescription}</p>}
                      {p.transactionRef && <p className="text-xs text-[#5d6577] font-mono mt-0.5">ref: {p.transactionRef}</p>}
                    </div>
                    {p.status === "success" && (
                      <button
                        onClick={() => handleRefund(p)}
                        className="text-xs font-medium text-rose-300 hover:text-rose-200 border border-rose-400/25 bg-rose-500/10 py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                      >
                        ↩ Refund
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ===== Services Tab ===== */}
      {activeTab === "services" && (
        <div className="space-y-6">
          {/* Service form */}
          <div className="card p-6 animate-fade-up">
            <h2 className="text-lg font-semibold text-white mb-5">{editingService ? "Edit service" : "New service tier"}</h2>
            <form onSubmit={handleServiceSubmit} className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Service name</label>
                <input
                  className="field"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="e.g. Standard, Premium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Small (₹)</label>
                <input type="number" className="field" value={serviceForm.priceSmall} onChange={(e) => setServiceForm((s) => ({ ...s, priceSmall: Number(e.target.value) }))} min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Medium (₹)</label>
                <input type="number" className="field" value={serviceForm.priceMedium} onChange={(e) => setServiceForm((s) => ({ ...s, priceMedium: Number(e.target.value) }))} min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Large (₹)</label>
                <input type="number" className="field" value={serviceForm.priceLarge} onChange={(e) => setServiceForm((s) => ({ ...s, priceLarge: Number(e.target.value) }))} min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#b9c0d0] mb-2">XL (₹)</label>
                <input type="number" className="field" value={serviceForm.priceXL} onChange={(e) => setServiceForm((s) => ({ ...s, priceXL: Number(e.target.value) }))} min={0} />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Description</label>
                <input
                  className="field"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm((s) => ({ ...s, description: e.target.value }))}
                  placeholder="What's included in this tier?"
                />
              </div>

              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 text-sm text-[#b9c0d0] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceForm.isDefault}
                    onChange={(e) => setServiceForm((s) => ({ ...s, isDefault: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/10 checked:bg-accent-500"
                  />
                  Default tier
                </label>
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={saving || !serviceForm.name} className="btn-primary flex-1 py-2.5 text-[13px]">
                  {saving ? <span className="flex items-center justify-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-white/25 border-t-white animate-spin" />Saving…</span> : (editingService ? "Update" : "Create")}
                </button>
                {editingService && (
                  <button
                    type="button"
                    onClick={() => { setEditingService(null); setServiceForm({ name: "", priceSmall: 120, priceMedium: 180, priceLarge: 250, priceXL: 350, description: "", isDefault: false }); }}
                    className="btn-ghost py-2.5 px-4 text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Services list */}
          {services.length === 0 ? (
            <div className="card p-12 text-center animate-fade-up">
              <p className="text-4xl mb-4">🧺</p>
              <p className="text-[#8b93a7]">No service tiers yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((s, i) => (
                <div key={s._id || i} className="card p-5 flex items-center justify-between animate-fade-up" style={{ animationDelay: `${Math.min(i, 5) * 0.04}s` }}>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white">{s.name}</span>
                        {s.isDefault && <span className="badge bg-emerald-400/10 border-emerald-400/25 text-emerald-300 text-[10px]">Default</span>}
                      </div>
                      <p className="text-xs text-[#5d6577] mt-1">{s.description || "—"}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#8b93a7]">
                      <span>S: ₹{s.priceSmall}</span>
                      <span>M: ₹{s.priceMedium}</span>
                      <span>L: ₹{s.priceLarge}</span>
                      <span>XL: ₹{s.priceXL}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleServiceEdit(s)} className="text-xs text-accent-300 hover:text-white font-medium cursor-pointer">Edit</button>
                    {!s.isDefault && (
                      <button onClick={() => handleServiceDelete(s)} className="text-xs text-rose-300 hover:text-rose-200 font-medium cursor-pointer">Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== Users Tab ===== */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {usersLoading ? (
            <div className="space-y-3">{Array(4).fill().map((_, i) => <div key={i} className="skeleton h-20" />)}</div>
          ) : users.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-4">👥</p>
              <p className="text-[#8b93a7]">No users found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u, i) => (
                <div key={u.id || i} className="card p-4 animate-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-fuchsia-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {(u.name || u.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">{u.name || "(no name)"}</span>
                          <span className={`badge text-[10px] py-0.5 ${
                            u.role === "warden" ? "bg-fuchsia-400/10 border-fuchsia-400/25 text-fuchsia-300" :
                            u.role === "staff" ? "bg-accent-400/10 border-accent-400/25 text-accent-300" :
                            "bg-cyan-400/10 border-cyan-400/25 text-cyan-300"
                          }`}>{u.role}</span>
                          <span className="badge text-[10px] bg-white/[0.04] border-white/10 text-[#5d6577]">{u.hostelBlock || "No block"}</span>
                        </div>
                        <p className="text-xs text-[#5d6577] mt-0.5">{u.email}</p>
                        {u.stats && (
                          <p className="text-[10px] text-[#5d6577] mt-1">
                            {u.stats.batchCount} batches · ₹{(u.stats.totalSpent || 0).toLocaleString("en-IN")} spent
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleUserEdit(u)}
                        className="text-xs text-accent-300 hover:text-white font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleUserDelete(u)}
                        className="text-xs text-rose-300 hover:text-rose-200 font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inline edit card */}
          {editingUser && (
            <div className="card p-6 animate-scale-in">
              <h3 className="text-lg font-semibold text-white mb-4">Edit: {editingUser.name}</h3>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Role</label>
                  <select
                    value={editingUserRole}
                    onChange={(e) => setEditingUserRole(e.target.value)}
                    className="field"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="bg-[#0b0d15]">{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b9c0d0] mb-2">Hostel block</label>
                  <input
                    className="field"
                    value={editingUserBlock}
                    onChange={(e) => setEditingUserBlock(e.target.value.toUpperCase())}
                    placeholder="e.g. B6"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={handleUserSave} className="btn-primary py-2 px-5 text-[13px]">Save changes</button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="btn-ghost py-2 px-5 text-[13px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
