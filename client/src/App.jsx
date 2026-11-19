import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import StaffConsole from "./pages/StaffConsole";
import TimingsSetup from "./pages/TimingsSetup";
import SubmitLaundry from "./pages/SubmitLaundry";
import TrackStatus from "./pages/TrackStatus";
import ReportIssue from "./pages/ReportIssue";
import Payments from "./pages/Payments";
import Invoice from "./pages/Invoice";
import Reviews from "./pages/Reviews";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import AdminPanel from "./pages/AdminPanel";
import DemoSimulator from "./components/DemoSimulator";

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="app-bg" />
      <div className="app-grid" />
      <div className="flex flex-col items-center gap-5">
        <div className="w-10 h-10 rounded-full border-2 border-accent-500/25 border-t-accent-500 animate-spin" />
        <p className="text-sm text-[#475569] font-medium tracking-wide">Loading…</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/" replace />;
}

/** Only staff/warden may open this branch — students bounce home. */
function StaffRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/" replace />;
  if (user.role === "student") return <Navigate to="/" replace />;
  return children;
}

/** Only warden (admin) may open this branch — everyone else bounces home. */
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "warden") return <Navigate to="/" replace />;
  return children;
}

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Landing />;
  return user.role === "student" ? <Dashboard /> : <Navigate to="/staff" replace />;
}

const TITLES = {
  "/login": "Sign in",
  "/register": "Create account",
  "/forgot-password": "Reset your password",
  "/reset-password": "Choose a new password",
  "/staff": "Ops console",
  "/timings": "Block schedules",
  "/submit": "Submit laundry",
  "/payments": "Payment history",
  "/reviews": "Student reviews",
  "/profile": "Profile",
  "/support": "Support",
  "/admin": "Admin panel",
};

function titleFor(pathname, user) {
  if (pathname.startsWith("/track/")) return "Track batch";
  if (pathname.startsWith("/report/")) return "Report an issue";
  if (pathname.startsWith("/payments/")) return "Invoice";
  if (pathname === "/") {
    if (!user) return "Track your hostel laundry";
    return user.role === "student" ? "Dashboard" : "Ops console";
  }
  return TITLES[pathname] || "Page not found";
}

function Shell() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Reset scroll and keep the browser tab in sync with the current page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    document.title = `${titleFor(location.pathname, user)} · Laundry Roulette`;
  }, [location.pathname, user]);

  return (
    <div className="min-h-screen">
      <div className="app-bg" />
      <div className="app-grid" />
      <Navbar />
      {loading ? (
        <Loader />
      ) : (
        <Routes>
          {/* Public landing for logged-out visitors; role-aware home when logged in */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Home /> : <Login />} />
          <Route path="/register" element={user ? <Home /> : <Register />} />
          <Route path="/forgot-password" element={user ? <Home /> : <ForgotPassword />} />
          <Route path="/reset-password" element={user ? <Home /> : <ResetPassword />} />

          <Route
            path="/staff"
            element={
              <StaffRoute>
                <StaffConsole />
              </StaffRoute>
            }
          />
          <Route
            path="/timings"
            element={
              <ProtectedRoute>
                <TimingsSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <SubmitLaundry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track/:id"
            element={
              <ProtectedRoute>
                <TrackStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report/:id"
            element={
              <ProtectedRoute>
                <ReportIssue />
              </ProtectedRoute>
            }
          />

          {/* Payment pages */}
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments/:id"
            element={
              <ProtectedRoute>
                <Invoice />
              </ProtectedRoute>
            }
          />

          {/* Reviews */}
          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <Reviews />
              </ProtectedRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Support */}
          <Route path="/support" element={<Support />} />

          {/* Admin (warden only) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
      {user && !loading && <Footer />}
      {/* Live-demo driver widget — students only; staff drive the real console */}
      {user && user.role === "student" && <DemoSimulator />}

      {/* Admin route badge in navbar for warden */}
      {user && user.role === "warden" && (
        <div className="fixed bottom-5 left-5 z-[80]">
          <Link
            to="/admin"
            className="flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full glass-nav border border-slate-900/10 shadow-xl shadow-slate-900/10 hover:border-accent-400/40 transition-all cursor-pointer text-xs font-medium text-accent-600"
          >
            <span>🛠️</span> Admin panel
          </Link>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
