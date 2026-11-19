import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Slim app footer shared by every signed-in page. */
export default function Footer() {
  const { user } = useAuth();
  const isStaff = user?.role === "staff" || user?.role === "warden";

  return (
    <footer className="mt-16 border-t border-white/[0.06] print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-7 pb-24 sm:pb-16 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🧺</span>
          <div>
            <p className="text-sm font-semibold text-white/90">
              Laundry<span className="grad-text">Roulette</span>
            </p>
            <p className="text-[11px] text-[#5d6577]">Hostel laundry tracking · capstone demo</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#8b93a7]">
          <Link to={isStaff ? "/staff" : "/"} className="hover:text-white transition-colors">
            {isStaff ? "Ops console" : "Dashboard"}
          </Link>
          {!isStaff && (
            <Link to="/submit" className="hover:text-white transition-colors">
              Submit
            </Link>
          )}
          <Link to="/reviews" className="hover:text-white transition-colors">
            Reviews
          </Link>
          <Link to="/payments" className="hover:text-white transition-colors">
            Payments
          </Link>
          <Link to="/support" className="hover:text-white transition-colors">
            Support
          </Link>
        </nav>

        <p className="text-[11px] text-[#5d6577] text-center sm:text-right">
          Demo data lives in memory — it resets on server restart
        </p>
      </div>
    </footer>
  );
}
