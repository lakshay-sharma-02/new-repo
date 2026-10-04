import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

function iconFor(type) {
  if (type === "issue") return "⚠️";
  if (type === "new_batch") return "📥";
  if (type === "status") return "🔔";
  return "💬";
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/notifications");
      setItems(res.data.items || []);
      setUnread(res.data.unreadCount || 0);
    } catch {
      /* transient */
    }
  }, [user]);

  useEffect(() => {
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const openItem = async (n) => {
    if (!n.read) {
      try { await api.patch(`/notifications/${n._id}/read`); } catch { /* ignore */ }
    }
    setOpen(false);
    if (n.batch) navigate(`/track/${n.batch}`);
    else load();
  };

  const markAll = async () => {
    try { await api.patch("/notifications/read-all"); } catch { /* ignore */ }
    load();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          if (open) setOpen(false);
          else { setOpen(true); load(); }
        }}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <span className="text-base leading-none">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-lg shadow-rose-500/40">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 animate-scale-in z-[95]"
          style={{ background: "rgba(12,14,22,0.97)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <p className="text-sm font-semibold text-white">Notifications</p>
            {unread > 0 && (
              <button onClick={markAll} className="text-[11px] text-accent-300 hover:text-white font-medium transition-colors cursor-pointer">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[380px] overflow-y-auto">
            {items.length === 0 && (
              <p className="text-xs text-[#5d6577] text-center py-8">Nothing yet — status updates and issue replies land here.</p>
            )}
            {items.map((n) => (
              <button
                key={n._id}
                onClick={() => openItem(n)}
                className={`w-full text-left px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors cursor-pointer flex gap-3 ${n.read ? "opacity-55" : ""}`}
              >
                <span className="text-base mt-0.5 shrink-0">{iconFor(n.type)}</span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className={`text-[13px] font-semibold truncate ${n.read ? "text-[#b9c0d0]" : "text-white"}`}>{n.title}</span>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-accent-400 shrink-0 animate-glow" />}
                  </span>
                  <span className="block text-xs text-[#8b93a7] leading-snug mt-0.5">{n.message}</span>
                  <span className="block text-[10px] text-[#5d6577] mt-1">{timeAgo(n.createdAt)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
