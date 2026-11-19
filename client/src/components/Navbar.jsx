import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationsBell from "./NotificationsBell";

const ROLE_META = {
  student: { label: "STUDENT", cls: "text-cyan-700 border-cyan-400/25 bg-cyan-400/10" },
  staff: { label: "STAFF", cls: "text-accent-600 border-accent-400/25 bg-accent-500/10" },
  warden: { label: "WARDEN", cls: "text-indigo-700 border-indigo-300 bg-indigo-50" },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close the menus whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Close on Escape and on a click outside the profile dropdown.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setDropdownOpen(false);
      }
    };
    const onPointer = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, []);

  if (!user) return null;
  const isDemo = /@hostel\.edu/.test(user.email || "");
  const isStaff = user.role === "staff" || user.role === "warden";

  const links = isStaff
    ? [
        { to: "/staff", label: "Console", icon: "🖥️" },
        { to: "/timings", label: "Schedules", icon: "🗓️" },
      ]
    : [
        { to: "/", label: "Dashboard", icon: "📊" },
        { to: "/submit", label: "Submit", icon: "➕" },
      ];

  const mobileLinks = [
    ...links,
    { to: "/payments", label: "Payments", icon: "💳" },
    { to: "/reviews", label: "Reviews", icon: "⭐" },
    { to: "/profile", label: "Profile", icon: "👤" },
    { to: "/support", label: "Support", icon: "💬" },
  ];

  const navItem = (link, onClick) => {
    const active =
      link.to === "/" ? location.pathname === "/" : location.pathname.startsWith(link.to);
    return (
      <Link
        key={link.to}
        to={link.to}
        onClick={onClick}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          active
            ? "text-slate-900 bg-slate-900/[0.07] border border-slate-900/10 shadow-inner"
            : "text-[#475569] hover:text-slate-900 hover:bg-slate-900/[0.04]"
        }`}
      >
        <span className="mr-1.5 opacity-80">{link.icon}</span>
        {link.label}
      </Link>
    );
  };

  const roleMeta = ROLE_META[user.role] || ROLE_META.student;

  return (
    <nav className="sticky top-0 z-50 glass-nav border-b border-slate-900/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isStaff ? "/staff" : "/"} className="flex items-center gap-2.5 group">
            <span className="text-2xl transition-transform group-hover:scale-110 duration-300 inline-block">🧺</span>
            <span className="hidden sm:block font-bold tracking-tight text-[15px]">
              Laundry<span className="grad-text">Roulette</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => navItem(l))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isDemo && (
              <span className="hidden xl:inline-flex items-center gap-1.5 badge bg-emerald-400/10 border border-emerald-400/25 text-emerald-700 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-glow" />
                LIVE DEMO
              </span>
            )}

            <NotificationsBell />

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                className="flex items-center gap-2 bg-slate-900/[0.04] border border-slate-900/10 rounded-full px-2 py-1.5 hover:border-accent-400/30 transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-400 to-sky-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                  {(user.name || "?")[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-slate-700 pr-1 max-w-[9rem] truncate">
                  {user.name}
                </span>
                <span className={`inline-flex badge py-0.5 px-1.5 text-[8px] font-bold border ${roleMeta.cls}`}>{roleMeta.label}</span>
                <span className="text-xs text-[#64748b] transition-transform" aria-hidden="true">{dropdownOpen ? "▴" : "▾"}</span>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 top-12 w-48 rounded-xl border border-slate-900/10 shadow-2xl animate-scale-in"
                  style={{ background: "#ffffff" }}
                >
                  <div className="py-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#475569] hover:text-slate-900 hover:bg-slate-900/[0.04] transition-all cursor-pointer"
                    >
                      <span>👤</span> Profile
                    </Link>
                    <Link
                      to="/payments"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#475569] hover:text-slate-900 hover:bg-slate-900/[0.04] transition-all cursor-pointer"
                    >
                      <span>💳</span> Payment history
                    </Link>
                    <Link
                      to="/reviews"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#475569] hover:text-slate-900 hover:bg-slate-900/[0.04] transition-all cursor-pointer"
                    >
                      <span>⭐</span> Write a review
                    </Link>
                    {user.role === "warden" && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-indigo-700 hover:text-slate-900 hover:bg-indigo-100 transition-all cursor-pointer border-t border-slate-900/10 mt-1.5 pt-2.5"
                      >
                        <span>🛠️</span> Admin panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-700 hover:text-rose-700 hover:bg-rose-500/10 transition-all cursor-pointer border-t border-slate-900/10 mt-1.5 pt-2.5 text-left"
                    >
                      <span>→</span> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-900/5 transition-colors cursor-pointer"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                <span className={`w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-900/10 animate-fade-in">
          <div className="px-4 py-3 space-y-1 bg-white/95 backdrop-blur-xl">
            {mobileLinks.map((l) => navItem(l, () => setMobileOpen(false)))}
            <div className="flex items-center gap-2 pt-3 mt-2 px-3 border-t border-slate-900/10">
              <span className={`badge py-0.5 px-2 text-[9px] font-bold border ${roleMeta.cls}`}>{roleMeta.label}</span>
              <span className="text-xs text-[#475569] truncate">{user.name}</span>
              {user.hostelBlock && (
                <span className="text-[10px] text-[#64748b]">· block {user.hostelBlock}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
