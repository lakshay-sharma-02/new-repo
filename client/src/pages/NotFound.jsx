import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { user } = useAuth();

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-24 text-center animate-fade-up">
      <p className="text-6xl mb-6">🧺</p>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-300 mb-3">
        404 · page not found
      </p>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
        This one went missing
      </h1>
      <p className="muted mt-3 max-w-sm mx-auto">
        Like a sock in the dryer. The page you were looking for doesn&apos;t exist — everything
        else is right where it should be.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to={user ? "/" : "/login"} className="btn-primary px-6 py-3">
          {user ? "Back to dashboard" : "Sign in"}
        </Link>
        <Link to="/support" className="btn-ghost px-6 py-3">
          Get help
        </Link>
      </div>
    </div>
  );
}
