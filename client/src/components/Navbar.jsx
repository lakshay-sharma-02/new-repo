import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationsBell from "./NotificationsBell";

const ROLE_META = {
  student: { label: "STUDENT", cls: "text-cyan-300 border-cyan-400/25 bg-cyan-400/10" },
  staff: { label: "STAFF", cls: "text-accent-300 border-accent-400/25 bg-accent-500/10" },
  warden: { label: "WARDEN", cls: "text-fuchsia-300 border-fuchsia-400/25 bg-fuchsia-500/10" },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
            ? "text-white bg-white/[0.08] border border-white/10 shadow-inner"
            : "text-[#8b93a7] hover:text-white hover:bg-white/[0.04]"
        }`}
      >
        <span className="mr-1.5 opacity-80">{link.icon}</span>
        {link.label}
      </Link>
    );
  };

  const roleMeta = ROLE_META[user.role] || ROLE_META.student;

  return (
    <nav className="sticky top-0 z-50 glass-nav border-b border-white/5">
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
              <span className="hidden xl:inline-flex items-center gap-1.5 badge bg-emerald-400/10 border border-emerald-400/25 text-emerald-300 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-glow" />
                LIVE DEMO
              </span>
            )}

            <NotificationsBell />

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-full px-2 py-1.5 hover:border-accent-400/30 transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-400 to-fuchsia-500 flex items-center justify-center text-[11px] font-bold text-white">
                  {(user.name || "?")[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-white/85 pr-1">{user.name}</span>
                <span className={`badge py-0.5 px-1.5 text-[8px] font-bold border ${roleMeta.cls}`}>{roleMeta.label}</span>
                <span className="text-xs text-[#5d6577] transition-transform">{dropdownOpen ? "▴" : "▾"}</span>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 top-12 w-48 rounded-xl border border-white/10 shadow-2xl animate-scale-in"
                  style={{ background: "rgba(12,14,22,0.97)" }}
                >
                  <div className="py-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#b9c0d0] hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
                    >
                      <span>👤</span> Profile
                    </Link>
                    <Link
                      to="/payments"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#b9c0d0] hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
                    >
                      <span>💳</span> Payment history
                    </Link>
                    <Link
                      to="/reviews"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#b9c0d0] hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
                    >
                      <span>⭐</span> Write a review
                    </Link>
                    {user.role === "warden" && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-fuchsia-300 hover:text-white hover:bg-fuchsia-500/10 transition-all cursor-pointer border-t border-white/[0.06] mt-1.5 pt-2.5"
                      >
                        <span>🛠️</span> Admin panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-all cursor-pointer border-t border-white/[0.06] mt-1.5 pt-2.5 text-left"
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
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-white/70 rounded-full transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                <span className={`w-full h-0.5 bg-white/70 rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`w-full h-0.5 bg-white/70 rounded-full transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 animate-fade-in">
          <div className="px-4 py-3 space-y-1 bg-[#07080d]/90 backdrop-blur-xl">
            {links.map((l) => navItem(l, () => setMobileOpen(false)))}
            <div className="flex items-center gap-2 pt-2 px-3">
              <span className={`badge py-0.5 px-2 text-[9px] font-bold border ${roleMeta.cls}`}>{roleMeta.label}</span>
              <span className="text-xs text-[#8b93a7]">{user.name}</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
